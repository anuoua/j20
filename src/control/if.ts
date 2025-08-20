import { computed } from "../api/computed";
import { untrackedReturn } from "../api/untracked-return";
import { createComponent } from "../h/createComponent";
import { FC } from "../types";
import { For } from "./For";

export interface IfProps {
  of: any;
  children: JSX.Element | ((t: boolean) => JSX.Element);
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
      of: arr.value,
    }),
    () => (bool: { value: 1 | 0 }) => {
      const props = untrackedReturn(() => (p as unknown as IfPropsInner).value);
      if (typeof props.children === "function") {
        return props.children(bool.value === 1);
      } else {
        return props.children;
      }
    }
  );
};
