import { instanceCreate } from "./instance";
import { computed } from "../api/computed";
import { FC } from "../types";
import { mergeObjectsWithDescriptors } from "../utils";

export const createComponent = (
  tag: FC,
  props: undefined | (() => any),
  children: undefined | (() => any)
) => {
  let [, fragment] = instanceCreate(() =>
    tag(
      computed(() =>
        mergeObjectsWithDescriptors(props ? props() : {}, {
          get children() {
            return children?.();
          },
        })
      )
      // computed(() => ({
      //   ...props?.(),
      //   get children() {
      //     return children?.();
      //   },
      // }))
    )
  );
  return fragment;
};
