export interface AllTimeSinceToday {
  total_seconds: number;
  text: string;
  decimal: string;
  digital: string;
  daily_average: number;
  is_up_to_string: boolean;
  percent_calculated: number;
  range: Range;
  timeout: number;
}

export interface Range {
  start: string;
  start_string: string;
  start_text: string;
  end: string;
  end_string: string;
  end_text: string;
  timezone: string;
}

export interface Last7Data {
  best_day: BestDay;
  categories: Category[];
  created_at: string;
  daily_average: number;
  daily_average_including_other_language: number;
  days_including_holidays: number;
  days_minus_holidays: number;
  dependencies: Category[];
  editors: Category[];
  end: string;
  holidays: number;
  human_readable_daily_average: string;
  human_readable_daily_average_including_other_language: string;
  human_readable_range: string;
  human_readable_total: string;
  human_readable_total_including_other_language: string;
  id: string;
  is_already_updating: boolean;
  is_cached: boolean;
  is_coding_activity_visible: boolean;
  is_including_today: boolean;
  is_other_usage_visible: boolean;
  is_stuck: boolean;
  is_up_to_string: boolean;
  is_up_to_string_pending_future: boolean;
  languages: Category[];
  machines: Category[];
  modified_at: string;
  operating_systems: Category[];
  percent_calculated: number;
  projects: Category[];
  range: string;
  start: string;
  status: string;
  timeout: number;
  timezone: string;
  total_seconds: number;
  total_seconds_including_other_language: number;
  user_id: string;
  username: string;
  writes_only: boolean;
}

export interface BestDay {
  string: string;
  text: string;
  total_seconds: number;
}

export interface Category {
  decimal: string;
  digital: string;
  hours: number;
  minutes: number;
  name: string;
  percent: number;
  text: string;
  total_seconds: number;
  machine_name_id?: string;
}

export interface NowData {
  cached_at: string;
  data: Data;
  has_team_features: boolean;
}

export interface Data {
  categories: Category[];
  dependencies: Category[];
  editors: Category[];
  grand_total: GrandTotal;
  languages: Category[];
  machines: Category[];
  operating_systems: Category[];
  projects: Category[];
  range: Range;
}

export interface Category {
  decimal: string;
  digital: string;
  hours: number;
  minutes: number;
  name: string;
  percent: number;
  seconds: number;
  text: string;
  total_seconds: number;
  machine_name_id?: string;
}

export interface GrandTotal {
  decimal: string;
  digital: string;
  hours: number;
  minutes: number;
  text: string;
  total_seconds: number;
}

export interface Range {
  string: string;
  end: string;
  start: string;
  text: string;
  timezone: string;
}
