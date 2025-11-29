import { computed } from "../api/computed";
import { createComponent } from "../h/createComponent";
import { FC } from "../types";
import { For } from "./For";

export interface ReplaceProps<T> {
  of: T;
  children: JSX.Element | ((t: T) => JSX.Element);
}

export interface ReplacePropsInner<T> {
  value: ReplaceProps<T>;
}

export const Replace = <T>(p: ReplaceProps<T>) => {
  const props = p as unknown as ReplacePropsInner<T>;

  let count = 0;

  const list = computed(() => {
    props.value.of;
    return [(count = (count + 1) % 2)];
  });

  return createComponent(For as (p: any) => any, () => ({
    of: list.value,
    get children() {
      return (item: any) => {
        const children = props.value.children;
        return typeof children === "function" ? children(item) : children;
      };
    },
  }));
};

(Replace as unknown as FC<ReplaceProps<any>>).isLogic = true;
