import { computed } from "../api/computed";
import { untrackedReturn } from "../api/untracked-return";
import { createComponent } from "../h/createComponent";
import { FC } from "../types";
import { For } from "./For";

export interface IfProps {
  of: any;
  children: JSX.Element | ((t: true) => JSX.Element);
  else?: JSX.Element | ((t: false) => JSX.Element);
}

interface IfPropsInner {
  value: IfProps;
}

export const If: FC<IfProps> = (p) => {
  const arr = computed(() =>
    !(p as unknown as IfPropsInner).value.of ? [0] : [1]
  );

  return createComponent(
    For as (p: any) => any,
    () => ({
      get of() {
        return arr.value;
      },
    }),
    () => (bool: { value: 1 | 0 }) => {
      const propsUnwrapped = untrackedReturn(
        () => (p as unknown as IfPropsInner).value
      );

      if (bool.value) {
        const children = propsUnwrapped.children;

        if (typeof children === "function") {
          return children(true);
        } else {
          return children;
        }
      } else {
        const elseCondition = propsUnwrapped.else;

        if (typeof elseCondition === "function") {
          return elseCondition(false);
        } else {
          return elseCondition;
        }
      }
    }
  );
};

If.isLogic = true;
