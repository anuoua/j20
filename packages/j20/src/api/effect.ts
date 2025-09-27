import { effect as innerEffect, Effect } from "../signals/signal";
import { getCurrentInstance } from "../h/instance";

export const effect: typeof innerEffect = (effectFn) => {
  const effectInstance = innerEffect(effectFn);
  const currentInstance = getCurrentInstance();
  currentInstance?.disposes?.push(() => effectInstance.dispose());
  return effectInstance;
};

export { Effect };
