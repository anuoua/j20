export interface RefObject<T> {
  current: T | null;
}
export function ref<T>(init: T): RefObject<T>;
export function ref<T>(): RefObject<T>;
export function ref<T>(init?: T) {
  return {
    current: init ?? null,
  };
}
