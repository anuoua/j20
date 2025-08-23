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

export const If = ((
  propsGetter: () => Omit<IfProps, "children">,
  childrenGetter: () => any
) => {
  const props = propsGetter();

  const arr = computed(() => (!props.of ? [0] : [1]));

  return createComponent(
    For as (p: any) => any,
    () => ({
      get of() {
        return arr.value;
      },
    }),
    () => (bool: { value: 1 | 0 }) => {
      if (bool.value) {
        const children = childrenGetter();

        if (typeof children === "function") {
          return children(true);
        } else {
          return children;
        }
      } else {
        const elseCondition = props.else;

        if (typeof elseCondition === "function") {
          return elseCondition(false);
        } else {
          return elseCondition;
        }
      }
    }
  );
}) as unknown as FC<IfProps>;

If.isLogic = true;
