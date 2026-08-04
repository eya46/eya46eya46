import { checkIsNextDay, checkIsNextHour } from "./date";
import type { AllTimeSinceToday, Last7Data, NowData, ProgramLanguage } from "../types/wakatime.ts";
import { fetchWithTimeout, warmCache, withCache } from "./cache.ts";
import { withCatch } from "./funcTool.ts";
import { WAKATIME_TOKEN } from "astro:env/server";

const defaultColorData = {
  "Vue.js": "#41b883",
};

class Wakatime {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  @withCache("all_time_since_today", [checkIsNextDay, checkIsNextHour])
  @withCatch
  async getAllData(): Promise<AllTimeSinceToday | undefined> {
    const response = await fetchWithTimeout(
      `https://wakatime.com/api/v1/users/current/all_time_since_today?api_key=${this.apiKey}`
    );
    if (!response.ok) throw new Error(`WakaTime all_time_since_today: ${response.status}`);
    return (await response.json()).data as AllTimeSinceToday;
  }

  @withCache("last_7_days", [checkIsNextDay, checkIsNextHour])
  @withCatch
  async getLast7Data(): Promise<Last7Data | undefined> {
    const response = await fetchWithTimeout(
      `https://wakatime.com/api/v1/users/current/stats/last_7_days?api_key=${this.apiKey}`
    );
    if (!response.ok) throw new Error(`WakaTime last_7_days: ${response.status}`);
    return (await response.json()).data as Last7Data;
  }

  @withCache("now_data", [checkIsNextDay, checkIsNextHour])
  @withCatch
  async getNowData(): Promise<NowData | undefined> {
    const response = await fetchWithTimeout(
      `https://wakatime.com/api/v1/users/current/status_bar/today?api_key=${this.apiKey}`
    );
    if (!response.ok) throw new Error(`WakaTime status_bar/today: ${response.status}`);
    return (await response.json()) as NowData;
  }

  @withCache("languages", [checkIsNextDay, checkIsNextHour])
  @withCatch
  async getProgramLanguageData(): Promise<ProgramLanguage | undefined> {
    const response = await fetchWithTimeout(
      `https://wakatime.com/api/v1/program_languages?api_key=${this.apiKey}`
    );
    if (!response.ok) throw new Error(`WakaTime program_languages: ${response.status}`);
    const data: { name: string; color: string }[] = (await response.json()).data;
    const languages: { [p: string]: string } = {};
    data.forEach((item) => {
      languages[item["name"]] = item["color"];
    });
    return { ...languages, ...defaultColorData };
  }
}

export const wakatime = new Wakatime(WAKATIME_TOKEN as string);

if (WAKATIME_TOKEN) {
  warmCache("all_time_since_today", () => wakatime.getAllData());
  warmCache("last_7_days", () => wakatime.getLast7Data());
  warmCache("now_data", () => wakatime.getNowData());
  warmCache("languages", () => wakatime.getProgramLanguageData());
}
