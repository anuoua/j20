import { isCustomHook } from "./is-custom-hook";
import { isDollar } from "./is-dollar";

export const isSignal = (id: string) => {
  return id.startsWith("$") && !isDollar(id) && !isCustomHook(id);
};
