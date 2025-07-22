import { computed } from "../api/computed";
import { isJSignal } from "../api/utils";
import { instanceCreate, instanceGetElements } from "./instance";
import { createElement } from "./createElement";
import { getChildren, getProps } from "./utils";

export const createComponent = (tag: FC, props: Props) => {
  let [instance, fragment] = instanceCreate(() => {
    const propsSig = computed(() => {
      const newProps = getProps(props);
      newProps.children = newProps.children.value;
      return newProps;
    });
    return tag(propsSig);
  });

  return fragment;
};
