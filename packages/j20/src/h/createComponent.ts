import { instanceCreate } from "./instance";
import { computed } from "../api/computed";
import { FC } from "../types";

export const createComponent = (tag: FC, props: undefined | (() => any)) => {
  let [, fragment] = instanceCreate(() =>
    tag(computed(() => (props ? props() : {})))
  );
  return fragment;
};
