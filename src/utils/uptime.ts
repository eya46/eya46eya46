import { UPTIME_KUMA_URL, UPTIME_KUMA_SLUG } from "astro:env/server";
import type { UptimeData, UptimeHeartbeatResponse } from "../types/uptime";

// 简单的内存缓存机制，每15秒更新一次
let cachedData: UptimeData | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 15 * 1000;

export async function fetchUptimeData(): Promise<UptimeData | null> {
  const now = Date.now();
  if (cachedData && now - lastFetchTime < CACHE_TTL) {
    return cachedData;
  }

  // 异步触发更新，直接返回旧缓存，避免阻塞用户请求（类似于 SWR 策略）
  if (cachedData && now - lastFetchTime >= CACHE_TTL) {
    fetchAndUpdateCache().catch(console.error);
    return cachedData;
  }

  // 首次请求或者无缓存时，同步等待
  return await fetchAndUpdateCache();
}

async function fetchAndUpdateCache(): Promise<UptimeData | null> {
  if (!UPTIME_KUMA_URL || !UPTIME_KUMA_SLUG) {
    console.warn("Uptime Kuma URL or Slug is not configured.");
    return null;
  }

  // Clean trailing slash from URL
  const baseUrl = UPTIME_KUMA_URL.replace(/\/$/, "");
  const configUrl = `${baseUrl}/api/status-page/${UPTIME_KUMA_SLUG}`;
  const heartbeatUrl = `${baseUrl}/api/status-page/heartbeat/${UPTIME_KUMA_SLUG}`;

  try {
    const [configRes, heartbeatRes] = await Promise.all([
      fetch(configUrl),
      fetch(heartbeatUrl)
    ]);

    if (!configRes.ok) {
      throw new Error(`Failed to fetch Uptime Kuma config: ${configRes.status}`);
    }

    const data = await configRes.json() as UptimeData;

    if (heartbeatRes.ok) {
      const heartbeats = await heartbeatRes.json() as UptimeHeartbeatResponse;
      
      // Merge heartbeat data into monitorList
      data.publicGroupList.forEach(group => {
        group.monitorList.forEach(monitor => {
          const monitorIdStr = monitor.id.toString();
          
          // Add 24h uptime
          if (heartbeats.uptimeList) {
            monitor.uptime24h = heartbeats.uptimeList[`${monitorIdStr}_24`] ?? 0;
          }
          
          // Add latest heartbeat status
          const beats = heartbeats.heartbeatList[monitorIdStr];
          if (beats && beats.length > 0) {
            const latest = beats[beats.length - 1];
            monitor.status = latest.status;
            monitor.ping = latest.ping;
            monitor.time = latest.time;
            
            // Keep up to last 40 heartbeats for tile display
            monitor.heartbeats = beats.slice(-40);
          } else {
            monitor.status = 0; // Default to offline if no heartbeat
            monitor.heartbeats = [];
          }
        });
      });
    }

    // 更新缓存
    cachedData = data;
    lastFetchTime = Date.now();
    return data;
  } catch (error) {
    console.error("Error fetching Uptime Kuma data:", error);
    return cachedData; // 如果请求失败，尽量保留上次的缓存
  }
}
