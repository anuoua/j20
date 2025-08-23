import { computed } from "../api/computed";
import { isSignal } from "../api/utils";
import { createComponent } from "../h/createComponent";
import { FC } from "../types";
import { For } from "./For";

export interface DynamicProps<T> {
  of?: T;
  children: JSX.Element | ((t: T) => JSX.Element);
}

export const Dynamic = ((
  propsGetter: (() => Omit<DynamicProps<any>, "children">) | undefined,
  childrenGetter: () => any
) => {
  const props = propsGetter ? propsGetter() : {};

  let count = 0;

  const list = computed(() => {
    "of" in props ? props.of : childrenGetter ? childrenGetter() : false;

    return [(count = (count + 1) % 2)];
  });

  return createComponent(
    For as (p: any) => any,
    () => ({
      of: list.value,
    }),
    () => (item: any) => {
      const children = childrenGetter();
      return typeof children === "function" ? children(item) : children;
    }
  );
}) as unknown as <T>(p: DynamicProps<T>) => JSX.Element;

(Dynamic as unknown as FC<DynamicProps<any>>).isLogic = true;
