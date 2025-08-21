import { computed } from "../api/computed";
import { isSignal } from "../api/utils";
import { createComponent } from "../h/createComponent";
import { FC } from "../types";
import { For } from "./For";

export interface DynamicProps<T> {
  of?: T;
  children: JSX.Element | ((t: T) => JSX.Element);
}

interface DynamicPropsInner<T> {
  value: DynamicProps<T>;
}

export const Dynamic = <T>(p: DynamicProps<T>) => {
  const props = p as unknown as DynamicPropsInner<T>;

  let count = 0;

  const list = computed(() => {
    "of" in props.value
      ? props.value.of
      : "children" in props.value
      ? props.value.children
      : false;

    return [(count = (count + 1) % 2)];
  });

  return createComponent(
    For as (p: any) => any,
    () => ({
      of: list.value,
    }),
    () => (item: T) => {
      const children = props.value.children;
      return typeof children === "function" ? children(item) : children;
    }
  );
};

(Dynamic as unknown as FC<DynamicProps<any>>).isLogic = true;
