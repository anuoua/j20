import { UnwrapRef, ref } from "@vue/reactivity";

type SignalFn = {
  <T>(init: T): [() => T, (val: T) => void];
  <T>(): [() => T | undefined, (val: T | undefined) => void];
};

export const signal: SignalFn = <T>(init?: T) => {
  let state = ref(init);
  const getter = () => state.value;
  getter.__isSignal = true;
  const setter = (val: UnwrapRef<T>) => (state.value = val);
  return [getter, setter];
};
