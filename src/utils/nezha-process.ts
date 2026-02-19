import type { NezhaRawData, NezhaData, ProcessedServer } from "../types/nezha";

export const ONLINE_THRESHOLD = 30000;

export function processRawData(raw: NezhaRawData): NezhaData {
  const now = raw.now;
  const processed = raw.servers.map((s): ProcessedServer => {
    const online = now - Date.parse(s.last_active) <= ONLINE_THRESHOLD;
    const cpu = s.state?.cpu ?? 0;
    const memPct = s.host?.mem_total ? (s.state!.mem_used / s.host.mem_total) * 100 : 0;
    const diskPct = s.host?.disk_total ? (s.state!.disk_used / s.host.disk_total) * 100 : 0;
    const swapTotal = s.host?.swap_total ?? 0;
    const swapUsed = s.state?.swap_used ?? 0;
    const swapPct = swapTotal > 0 ? (swapUsed / swapTotal) * 100 : 0;
    return {
      id: s.id,
      name: s.name,
      online,
      platform: s.host?.platform || "",
      arch: s.host?.arch || "",
      cpu,
      memPct,
      diskPct,
      netInSpeed: s.state?.net_in_speed || 0,
      netOutSpeed: s.state?.net_out_speed || 0,
      uptime: s.state?.uptime ?? 0,
      version: s.host?.version || "",
      platformVersion: s.host?.platform_version || "",
      cpuInfo: s.host?.cpu || [],
      gpuInfo: s.host?.gpu || [],
      memTotal: s.host?.mem_total ?? 0,
      memUsed: s.state?.mem_used ?? 0,
      diskTotal: s.host?.disk_total ?? 0,
      diskUsed: s.state?.disk_used ?? 0,
      swapTotal,
      swapPct,
      load1: s.state?.load_1 ?? 0,
      load5: s.state?.load_5 ?? 0,
      load15: s.state?.load_15 ?? 0,
      netInTransfer: s.state?.net_in_transfer ?? 0,
      netOutTransfer: s.state?.net_out_transfer ?? 0,
      countryCode: s.country_code || "",
      bootTime: s.host?.boot_time ?? 0,
      lastActive: s.last_active,
      tcpConn: s.state?.tcp_conn_count ?? 0,
      udpConn: s.state?.udp_conn_count ?? 0,
      processCount: s.state?.process_count ?? 0,
    };
  });

  processed.sort((a, b) => (a.online === b.online ? 0 : a.online ? -1 : 1));

  const onlineCount = processed.filter((s) => s.online).length;

  return {
    total: processed.length,
    online: onlineCount,
    offline: processed.length - onlineCount,
    servers: processed,
  };
}
