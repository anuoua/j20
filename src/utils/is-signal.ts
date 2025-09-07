import { isCustomHook } from "./is-custom-hook";

export const isSignal = (id: string) => {
  return id.startsWith("$") && id.length > 1 && !isCustomHook(id);
};
