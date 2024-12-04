import { checkIsNextDay, checkIsNextHour } from "./date";
import type { AllTimeSinceToday, Last7Data, NowData, ProgramLanguage } from "./wakatimeType.ts";
import { withCache } from "./cache.ts";
import { withCatch } from "./funcTool.ts";

const WAKATIME_TOKEN = import.meta.env.WAKATIME_TOKEN;

if (!WAKATIME_TOKEN) throw new Error("WAKATIME_TOKEN is not defined");

const defaultColorData = {
  "Vue.js": "#41b883",
};

class Wakatime {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  @withCache("all_time_since_today", checkIsNextDay)
  @withCatch
  async getAllData(): Promise<AllTimeSinceToday | undefined> {
    const response = await fetch(
      `https://wakatime.com/api/v1/users/current/all_time_since_today?api_key=${this.apiKey}`
    );
    return (await response.json()).data as AllTimeSinceToday;
  }

  @withCache("last_7_days", checkIsNextDay)
  @withCatch
  async getLast7Data(): Promise<Last7Data | undefined> {
    const response = await fetch(`https://wakatime.com/api/v1/users/current/stats/last_7_days?api_key=${this.apiKey}`);
    return (await response.json()).data as Last7Data;
  }

  @withCache("now_data", [checkIsNextDay, checkIsNextHour])
  @withCatch
  async getNowData(): Promise<NowData | undefined> {
    const response = await fetch(`https://wakatime.com/api/v1/users/current/status_bar/today?api_key=${this.apiKey}`);
    return (await response.json()) as NowData;
  }

  @withCache("languages", checkIsNextDay)
  @withCatch
  async getProgramLanguageData(): Promise<ProgramLanguage | undefined> {
    const response = await fetch(`https://wakatime.com/api/v1/program_languages?api_key=${this.apiKey}`);
    const data: { name: string; color: string }[] = (await response.json()).data;
    const languages: { [p: string]: string } = {};
    data.forEach((item) => {
      languages[item["name"]] = item["color"];
    });
    return { ...languages, ...defaultColorData };
  }
}

export const wakatime = new Wakatime(WAKATIME_TOKEN as string);
