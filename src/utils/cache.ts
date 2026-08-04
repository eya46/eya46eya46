const cache: { [key: string]: [number, unknown] } = {};
const inflight = new Map<string, Promise<unknown>>();

const WAIT_TIMEOUT = Symbol("cache-max-wait");

export const DEFAULT_PAGE_WAIT_MS = 1500;
export const DEFAULT_UPSTREAM_TIMEOUT_MS = 600_000;

export function getCacheUpdateTime(key: string) {
  return cache[key]?.[0] || undefined;
}

export function setCache(key: string, data: unknown) {
  if (!key) return;
  if (data === undefined) return;
  cache[key] = [Date.now(), data];
}

export function getCache(key: string) {
  return cache[key] || [];
}

export type TimeChecker = (time: number) => boolean;

export type WithCacheOptions = {
  maxWaitMs?: number;
};

export function isAbortError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { name?: string; code?: string; message?: string };
  return e.name === "AbortError" || e.code === "ABORT_ERR" || /aborted/i.test(e.message ?? "");
}

export function logUpstreamError(scope: string, error: unknown) {
  if (isAbortError(error)) {
    console.warn(`[${scope}] upstream aborted (slow network or safety timeout), keeping stale cache if any`);
    return;
  }
  console.error(`[${scope}] upstream failed:`, error);
}

export function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = DEFAULT_UPSTREAM_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const parent = init.signal;
  const onParentAbort = () => controller.abort();
  if (parent) {
    if (parent.aborted) {
      controller.abort();
    } else {
      parent.addEventListener("abort", onParentAbort, { once: true });
    }
  }

  return fetch(url, { ...init, signal: controller.signal }).finally(() => {
    clearTimeout(timer);
    parent?.removeEventListener("abort", onParentAbort);
  });
}

function isStale(time: number, timeCheckers: TimeChecker[]) {
  return timeCheckers.some((check) => check(time));
}

function runFetcher<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  const pending = (async () => {
    const result = await fetcher();
    if (result !== undefined) {
      setCache(key, result);
    }
    return result;
  })().finally(() => {
    if (inflight.get(key) === pending) {
      inflight.delete(key);
    }
  });

  inflight.set(key, pending);
  return pending;
}

async function settleWithMaxWait<T>(pending: Promise<T>, maxWaitMs: number, key: string): Promise<T | undefined> {
  if (maxWaitMs <= 0) {
    pending.catch((err) => logUpstreamError(`cache:${key}`, err));
    return getCache(key)[1] as T | undefined;
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      pending,
      new Promise<typeof WAIT_TIMEOUT>((resolve) => {
        timer = setTimeout(() => resolve(WAIT_TIMEOUT), maxWaitMs);
      }),
    ]);

    if (result === WAIT_TIMEOUT) {
      pending.catch((err) => logUpstreamError(`cache:${key}`, err));
      return getCache(key)[1] as T | undefined;
    }
    return result as T;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function withCache(
  key: string,
  timeCheckers: TimeChecker | TimeChecker[],
  options: WithCacheOptions = {}
): MethodDecorator {
  const checkers = Array.isArray(timeCheckers) ? timeCheckers : [timeCheckers];
  const maxWaitMs = options.maxWaitMs ?? DEFAULT_PAGE_WAIT_MS;

  return function <T>(_target: object, _propertyKey: string | symbol, descriptor: PropertyDescriptor): void {
    const originalMethod = descriptor.value as (...args: any[]) => Promise<T>;

    descriptor.value = async function (...args: any[]): Promise<T | undefined> {
      const cachedData = getCache(key);
      const fetcher = () => originalMethod.apply(this, args) as Promise<T>;

      if (cachedData.length > 0) {
        if (isStale(cachedData[0] as number, checkers)) {
          runFetcher(key, fetcher).catch((err) => logUpstreamError(`cache:${key}`, err));
        }
        return cachedData[1] as T;
      }

      const pending = runFetcher(key, fetcher);
      return settleWithMaxWait(pending, maxWaitMs, key);
    };
  };
}

/** 直接调业务方法预热，不要再包 runFetcher（会和装饰器内的 inflight 死锁） */
export function warmCache(key: string, fetcher: () => Promise<unknown>): void {
  if (getCache(key).length > 0) return;
  void fetcher().catch((err) => logUpstreamError(`cache-warm:${key}`, err));
}
