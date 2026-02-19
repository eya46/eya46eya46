import dayjs from "dayjs";

export function formatSpeed(bytes: number): string {
  if (bytes < 1024) return bytes.toFixed(0) + " B/s";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " K/s";
  if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + " M/s";
  return (bytes / 1024 / 1024 / 1024).toFixed(2) + " G/s";
}

export function barColor(pct: number): string {
  if (pct > 90) return "bg-red-500";
  if (pct > 70) return "bg-orange-400";
  return "bg-green-500";
}

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KiB", "MiB", "GiB", "TiB"];
  let i = 0;
  let v = bytes;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return v.toFixed(i === 0 ? 0 : 2) + " " + units[i];
}

export function formatUptime(seconds: number): string {
  if (seconds <= 0) return "-";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}天${hours}小时`;
  return `${hours}小时${minutes}分`;
}

export function formatTime(ts: number): string {
  if (ts <= 0) return "-";
  return dayjs.unix(ts).format("YYYY-MM-DD HH:mm:ss");
}

export function formatDateTime(v: string | number | Date): string {
  return dayjs(v).format("YYYY-MM-DD HH:mm:ss");
}
