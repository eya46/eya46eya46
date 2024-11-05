const cache: { [key: string]: [number, unknown] } = {};

export function getCacheUpdateTime(key: string) {
  return cache[key]?.[0] || undefined;
}

export function setCache(key: string, data: unknown) {
  if (!key) return;
  cache[key] = [Date.now(), data];
}

export function getCache(key: string) {
  return cache[key] || [];
}

export type TimeChecker = (time: number) => boolean;

export function withCache(key: string, timeCheckers: TimeChecker | TimeChecker[]): MethodDecorator {
  // 确保 timeCheckers 是一个数组
  if (!Array.isArray(timeCheckers)) {
    timeCheckers = [timeCheckers];
  }

  return function <T>(target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void {
    const originalMethod = descriptor.value as (...args: any[]) => Promise<T>;

    descriptor.value = async function (...args: any[]): Promise<T> {
      const cachedData = getCache(key);

      if (cachedData.length > 0) {
        // 有缓存
        if (timeCheckers.every((check) => check(cachedData[0] as number))) {
          // 时间符合要求，返回缓存数据
          return cachedData[1] as T;
        } else {
          // 时间不符合要求，异步更新缓存
          originalMethod.apply(this, args).then((result) => setCache(key, result));
          return cachedData[1] as T; // 返回旧数据
        }
      } else {
        // 没有缓存，调用原函数并缓存结果
        const res = await originalMethod.apply(this, args);
        setCache(key, res);
        return res;
      }
    };
  };
}
