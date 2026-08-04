import { UPTIME_KUMA_URL, UPTIME_KUMA_SLUG } from "astro:env/server";
import type { UptimeData, UptimeHeartbeatResponse } from "../types/uptime";
import { DEFAULT_PAGE_WAIT_MS, fetchWithTimeout, logUpstreamError } from "./cache";

let cachedData: UptimeData | null = null;
let lastFetchTime = 0;
let inflight: Promise<UptimeData | null> | null = null;

const CACHE_TTL = 15 * 1000;

export async function fetchUptimeData(): Promise<UptimeData | null> {
  const now = Date.now();

  if (cachedData && now - lastFetchTime < CACHE_TTL) {
    return cachedData;
  }

  if (cachedData) {
    void refreshInBackground();
    return cachedData;
  }

  const pending = refreshInBackground();
  return await settleWithMaxWait(pending);
}

function refreshInBackground(): Promise<UptimeData | null> {
  if (inflight) return inflight;

  inflight = fetchAndUpdateCache().finally(() => {
    inflight = null;
  });

  return inflight;
}

async function settleWithMaxWait(
  pending: Promise<UptimeData | null>,
  maxWaitMs = DEFAULT_PAGE_WAIT_MS
): Promise<UptimeData | null> {
  if (maxWaitMs <= 0) {
    pending.catch((err) => logUpstreamError("uptime", err));
    return cachedData;
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<"timeout">((resolve) => {
    timer = setTimeout(() => resolve("timeout"), maxWaitMs);
  });

  try {
    const result = await Promise.race([pending, timeout]);
    if (result === "timeout") {
      pending.catch((err) => logUpstreamError("uptime", err));
      return cachedData;
    }
    return result;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function fetchAndUpdateCache(): Promise<UptimeData | null> {
  if (!UPTIME_KUMA_URL || !UPTIME_KUMA_SLUG) {
    console.warn("[uptime] Uptime Kuma URL or Slug is not configured.");
    return null;
  }

  const baseUrl = UPTIME_KUMA_URL.replace(/\/$/, "");
  const configUrl = `${baseUrl}/api/status-page/${UPTIME_KUMA_SLUG}`;
  const heartbeatUrl = `${baseUrl}/api/status-page/heartbeat/${UPTIME_KUMA_SLUG}`;

  try {
    const [configRes, heartbeatRes] = await Promise.all([
      fetchWithTimeout(configUrl),
      fetchWithTimeout(heartbeatUrl),
    ]);

    if (!configRes.ok) {
      throw new Error(`Failed to fetch Uptime Kuma config: ${configRes.status}`);
    }

    const data = (await configRes.json()) as UptimeData;

    if (heartbeatRes.ok) {
      const heartbeats = (await heartbeatRes.json()) as UptimeHeartbeatResponse;

      data.publicGroupList.forEach((group) => {
        group.monitorList.forEach((monitor) => {
          const monitorIdStr = monitor.id.toString();

          if (heartbeats.uptimeList) {
            monitor.uptime24h = heartbeats.uptimeList[`${monitorIdStr}_24`] ?? 0;
          }

          const beats = heartbeats.heartbeatList[monitorIdStr];
          if (beats && beats.length > 0) {
            const latest = beats[beats.length - 1];
            monitor.status = latest.status;
            monitor.ping = latest.ping;
            monitor.time = latest.time;
            monitor.heartbeats = beats.slice(-40);
          } else {
            monitor.status = 0;
            monitor.heartbeats = [];
          }
        });
      });
    } else {
      console.warn(`[uptime] heartbeat endpoint returned ${heartbeatRes.status}, using config only`);
    }

    cachedData = data;
    lastFetchTime = Date.now();
    return data;
  } catch (error) {
    logUpstreamError("uptime", error);
    return cachedData;
  }
}

function warmUptimeCache() {
  if (!UPTIME_KUMA_URL || !UPTIME_KUMA_SLUG) return;
  void refreshInBackground();
  setInterval(() => {
    void refreshInBackground();
  }, CACHE_TTL + 1000).unref?.();
}

warmUptimeCache();
