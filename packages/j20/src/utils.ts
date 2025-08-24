export const range = function* (start: number, end: number) {
  for (let i = start; i <= end; i++) {
    yield i;
  }
};

export function cacheGetterLazy<T extends object, K extends keyof T>(
  obj: T,
  prop: K
): void {
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
          configurable: true,
        });
      }
      return value;
    },
    enumerable: true,
    configurable: true,
  });
}

/**
 * Merges multiple objects while preserving property descriptors, including getters and setters.
 * This ensures lazy evaluation for getters. If there are duplicate keys, later objects override earlier ones.
 *
 * @param {...objects} objects - The objects to merge.
 * @returns A new object with merged property descriptors.
 */
export function mergeObjectsWithDescriptors(...objects: object[]): object {
  // Start with an empty descriptors object
  let mergedDescriptors: PropertyDescriptorMap = {};

  // Merge descriptors from each object, overriding duplicates
  for (const obj of objects) {
    if (obj === null || obj === undefined) continue;
    const descriptors = Object.getOwnPropertyDescriptors(obj);
    mergedDescriptors = { ...mergedDescriptors, ...descriptors };
  }

  // Create a new object with the merged descriptors
  return Object.defineProperties({}, mergedDescriptors);
}
