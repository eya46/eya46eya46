export interface NezhaHost {
  platform: string;
  platform_version: string;
  arch: string;
  mem_total: number;
  disk_total: number;
  cpu: string[];
  gpu: string[];
  swap_total: number;
  boot_time: number;
  version: string;
}

export interface NezhaState {
  cpu: number;
  mem_used: number;
  disk_used: number;
  net_in_speed: number;
  net_out_speed: number;
  uptime: number;
  swap_used: number;
  load_1: number;
  load_5: number;
  load_15: number;
  net_in_transfer: number;
  net_out_transfer: number;
  tcp_conn_count: number;
  udp_conn_count: number;
  process_count: number;
}

export interface NezhaRawServer {
  id: number;
  name: string;
  country_code: string;
  last_active: string;
  host: NezhaHost | null;
  state: NezhaState | null;
}

export interface NezhaRawData {
  now: number;
  servers: NezhaRawServer[];
}

export interface ProcessedServer {
  id: number;
  name: string;
  online: boolean;
  platform: string;
  arch: string;
  cpu: number;
  memPct: number;
  diskPct: number;
  netInSpeed: number;
  netOutSpeed: number;
  uptime: number;
  version: string;
  platformVersion: string;
  cpuInfo: string[];
  gpuInfo: string[];
  memTotal: number;
  memUsed: number;
  diskTotal: number;
  diskUsed: number;
  swapTotal: number;
  swapPct: number;
  load1: number;
  load5: number;
  load15: number;
  netInTransfer: number;
  netOutTransfer: number;
  countryCode: string;
  bootTime: number;
  lastActive: string;
  tcpConn: number;
  udpConn: number;
  processCount: number;
}

export interface NezhaData {
  total: number;
  online: number;
  offline: number;
  servers: ProcessedServer[];
}
