import { computed } from "../api/computed";
import { createComponent } from "../h/createComponent";
import { FC } from "../types";
import { For } from "./For";

export interface IfProps {
  of: any;
  children: JSX.Element | ((t: boolean) => JSX.Element);
  else?: JSX.Element;
}

interface IfPropsInner {
  value: IfProps;
}

export const If: FC<IfProps> = (p) => {
  const props = p as unknown as IfPropsInner;

  const arr = computed(() => (!props.value.of ? [0] : [1]));

  return createComponent(For as (p: any) => any, () => ({
    get of() {
      return arr.value;
    },
    get children() {
      return (bool: 1 | 0) => {
        const propsValues = props.value;
        const children = propsValues.children;
        if (children && typeof children === "function") {
          return children(!!bool);
        }
        if (bool) {
          return children;
        } else {
          return propsValues.else;
        }
      };
    },
  }));
};

If.isLogic = true;
