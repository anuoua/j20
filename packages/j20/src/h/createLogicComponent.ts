import { computed } from "../api/computed";
import { FC } from "../types";

export const createLogicComponent = (
  tag: FC,
  props: undefined | (() => any)
) => {
  return tag(computed(() => (props ? props() : {})));
};
