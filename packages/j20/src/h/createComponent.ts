import { instanceCreate } from "./instance";
import { computed } from "../api/computed";
import { FC } from "../types";

export const createComponent = (tag: FC, props: undefined | (() => any)) => {
  const runner: FC = () => tag(computed(() => (props ? props() : {})));

  runner.customElement = tag.customElement;

  let [, fragment] = instanceCreate(runner as any);
  return fragment;
};
