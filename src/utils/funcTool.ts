export function withCatch<T>(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor): void {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]): Promise<T | undefined> {
    console.log(`fetching ${propertyKey.toString()}`, new Date());
    try {
      return await originalMethod.apply(this, args);
    } catch (e) {
      console.error(`error fetching ${propertyKey.toString()}`, new Date());
      console.error(e);
      return undefined; // 返回 undefined
    }
  };
}
