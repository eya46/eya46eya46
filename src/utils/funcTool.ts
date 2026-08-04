import { logUpstreamError } from "./cache.ts";

export function withCatch<T>(_target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor): void {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]): Promise<T | undefined> {
    try {
      return await originalMethod.apply(this, args);
    } catch (e) {
      logUpstreamError(propertyKey.toString(), e);
      return undefined;
    }
  };
}
