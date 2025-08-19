export const range = function* (start: number, end: number) {
  for (let i = start; i <= end; i++) {
    yield i;
  }
};

export function cacheGetterLazy<T extends object, K extends keyof T>(obj: T, prop: K): void {
  const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
  if (!descriptor || !descriptor.get) {
    throw new Error(`Property ${String(prop)} is not a getter.`);
  }
  const originalGetter = descriptor.get;

  let cached = false;
  let value: T[K];

  Object.defineProperty(obj, prop, {
    get(this: T): T[K] {
      if (!cached) {
        value = originalGetter.call(this); // 调用原始 getter，避免递归
        cached = true;
        // 重新定义为静态值
        Object.defineProperty(this, prop, {
          value: value,
          writable: true, // 可根据需要设置为 false
          enumerable: true,
          configurable: true
        });
      }
      return value;
    },
    enumerable: true,
    configurable: true
  });
}