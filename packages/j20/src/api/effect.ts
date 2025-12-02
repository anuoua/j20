import { effect as innerEffect, Effect } from "@j20org/signal";
import { securityGetCurrentInstance } from "../h/instance";

export const effect: typeof innerEffect = (effectFn) => {
  const effectInstance = innerEffect(effectFn);
  const currentInstance = securityGetCurrentInstance();
  if (!currentInstance.disposes) currentInstance.disposes = [];
  currentInstance.disposes.push(() => effectInstance.dispose());
  return effectInstance;
};

export { Effect };
