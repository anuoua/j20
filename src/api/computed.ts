import { Signal } from "signal-polyfill";

export class JComputed<T = unknown> extends Signal.Computed<T> {
  get value() {
    return this.get();
  }
}

export const computed = <T = unknown>(
  initial: () => T,
  options?: Signal.Options<T>
) => new JComputed(initial, options);
