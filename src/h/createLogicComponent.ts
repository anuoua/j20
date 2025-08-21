import { FC } from "../types";
import { mergeObjectsWithDescriptors } from "../utils";

export const createLogicComponent = (
  tag: FC,
  props: undefined | (() => any),
  children: undefined | (() => any)
) => {
  return tag({
    get value() {
      return mergeObjectsWithDescriptors(props?.() ?? {}, {
        get children() {
          return children?.();
        },
      });
    },
  });
};
