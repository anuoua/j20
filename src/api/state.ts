import { Signal } from "signal-polyfill";

export class JState<T = unknown> extends Signal.State<T> {
  get value() {
    return this.get();
  }
  set value(value: T) {
    this.set(value);
  }
}

export const state = <T = unknown>(
  initialValue: T,
  options?: Signal.Options<T>
) => new JState(initialValue, options);
