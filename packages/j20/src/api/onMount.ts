import { securityGetCurrentInstance } from "../h/instance";

export const onMount = (callback: () => (() => void) | void) => {
  const instance = securityGetCurrentInstance();

  if (!instance.mounts) {
    instance.mounts = [];
  }
  instance.mounts.push(callback);
};
