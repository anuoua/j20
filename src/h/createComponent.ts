import { instanceCreate } from "./instance";
import { computed } from "../api/computed";

export const createComponent = (
  tag: FC,
  props: undefined | (() => any),
  children: undefined | (() => any),
) => {
  let [, fragment] = instanceCreate(() =>
    tag(
      computed(() => ({
        ...props?.(),
        get children() {
          return children?.();
        },
      })),
    ),
  );
  return fragment;
};
