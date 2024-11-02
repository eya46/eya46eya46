import { LRUCache } from "lru-cache";
import { checkIsNextDay, checkIsNextHour } from "./date";
import type { AllTimeSinceToday, Last7Data, NowData } from "./wakatime_type";

const WAKATIME_API = import.meta.env.WAKATIME_API;

if (!WAKATIME_API) throw new Error("WAKATIME_API is not defined");

const cache = new LRUCache<string, [number, unknown]>({
  max: 10,
  ttl: 1000 * 60 * 60 * 24 * 7, // 七天
});

export async function _getProgramLanguageData(): Promise<{ [key: string]: string } | undefined> {
  console.log("fetching languages", new Date());
  try {
    const response = await fetch(`https://wakatime.com/api/v1/program_languages?api_key=${WAKATIME_API}`, {});
    const data: { name: string; color: string }[] = (await response.json()).data;
    const languages: { [p: string]: string } = {};
    data.forEach((item) => {
      languages[item["name"]] = item["color"];
    });
    cache.set("languages", [Date.now(), languages]);
    return languages;
  } catch (e) {
    console.error("error fetching languages", new Date());
    console.error(e);
    return {};
  }
}

export async function getProgramLanguageData(): Promise<{ [key: string]: string } | undefined> {
  const [time, data] = cache.get("languages") || [];
  if (time && data) {
    if (checkIsNextDay(time)) _getProgramLanguageData().then();
    return data as { [key: string]: string };
  }
  return await _getProgramLanguageData();
}

export async function _getAllData(): Promise<AllTimeSinceToday | undefined> {
  console.log("fetching all data", new Date());
  try {
    const response = await fetch(
      `https://wakatime.com/api/v1/users/current/all_time_since_today?api_key=${WAKATIME_API}`,
      {}
    );
    const data = (await response.json()).data as AllTimeSinceToday;
    cache.set("all_time_since_today", [Date.now(), data]);
    return data;
  } catch (e) {
    console.error("error fetching all data", new Date());
    console.error(e);
    return undefined;
  }
}

export async function getAllData(): Promise<AllTimeSinceToday | undefined> {
  const [time, data] = cache.get("all_time_since_today") || [];
  if (time && data) {
    if (checkIsNextDay(time)) _getAllData().then();
    return data as AllTimeSinceToday;
  }
  return await _getAllData();
}

export async function _getLast7Data(): Promise<Last7Data | undefined> {
  console.log("fetching last 7 days", new Date());
  try {
    const response = await fetch(
      `https://wakatime.com/api/v1/users/current/stats/last_7_days?api_key=${WAKATIME_API}`,
      {}
    );
    const data = (await response.json()).data as Last7Data;
    cache.set("last_7_days", [Date.now(), data]);
    return data;
  } catch (e) {
    console.error("error fetching last 7 days", new Date());
    console.error(e);
    return undefined;
  }
}

export async function getLast7Data(): Promise<Last7Data | undefined> {
  const [time, data] = cache.get("last_7_days") || [];
  if (time && data) {
    if (checkIsNextDay(time)) _getLast7Data().then();
    return data as Last7Data;
  }
  return await _getLast7Data();
}

export async function _getNowData(): Promise<NowData | undefined> {
  console.log("fetching now data", new Date());
  try {
    const response = await fetch(
      `https://wakatime.com/api/v1/users/current/status_bar/today?api_key=${WAKATIME_API}`,
      {}
    );
    const data = (await response.json()) as NowData;
    cache.set("now_data", [Date.now(), data]);
    return data;
  } catch (e) {
    console.error("error fetching now data", new Date());
    console.error(e);
    return undefined;
  }
}

export async function getNowData(): Promise<NowData | undefined> {
  const [time, data] = cache.get("now_data") || [];
  if (time && data) {
    if (checkIsNextHour(time) || checkIsNextDay(time)) _getNowData().then();
    return data as NowData;
  }
  return await _getNowData();
}
