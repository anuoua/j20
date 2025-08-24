import { untracked } from "@preact/signals-core";

export const untrackedReturn = <T extends () => any>(fn: T) => {
  let res: ReturnType<T>;
  untracked(() => (res = fn()));
  return res!;
};
