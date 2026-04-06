export interface UptimeMonitor {
  id: number;
  name: string;
  sendUrl: number;
  type: string;
  status?: number; // 1 online, 0 offline, 2 pending, 3 maintenance
  ping?: number | null;
  time?: string;
  uptime24h?: number; // percentage e.g. 1 (100%), 0 (0%)
  heartbeats?: UptimeHeartbeat[]; // recent heartbeats for rendering tiles
}

export interface UptimeHeartbeat {
  status: number;
  time: string;
  msg: string;
  ping: number | null;
}

export interface UptimeHeartbeatResponse {
  heartbeatList: Record<string, UptimeHeartbeat[]>;
  uptimeList: Record<string, number>;
}

export interface UptimePublicGroup {
  id: number;
  name: string;
  weight: number;
  monitorList: UptimeMonitor[];
}

export interface UptimeConfig {
  slug: string;
  title: string;
  description: string | null;
  icon: string;
  theme: string;
  published: boolean;
  showTags: boolean;
  customCSS: string;
  footerText: string | null;
  showPoweredBy: boolean;
  googleAnalyticsId: string | null;
  showCertificateExpiry: boolean;
}

export interface UptimeData {
  config: UptimeConfig;
  incident: any | null;
  publicGroupList: UptimePublicGroup[];
  maintenanceList: any[];
}
