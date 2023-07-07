import { instanceCreate } from "./instance";
import { computed } from "../api/computed";
import { FC } from "../types";

export const createComponent = (tag: FC, props: undefined | (() => any)) => {
  const runner = () => tag(computed(() => (props ? props() : {})));

  let [, fragment] = instanceCreate(runner as any);
  return fragment;
};
