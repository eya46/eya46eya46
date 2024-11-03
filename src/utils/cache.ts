const cache: { [key: string]: [number, unknown] } = {};

export function getCacheUpdateTime(key: string) {
  return cache[key]?.[0] || undefined;
}

export function setCache(key: string, data: unknown) {
  cache[key] = [Date.now(), data];
}

export function getCache(key: string) {
  return cache[key] || [];
}
