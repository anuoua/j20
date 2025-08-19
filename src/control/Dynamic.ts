import { computed } from "../api/computed";
import { isSignal } from "../api/utils";
import { createComponent } from "../h/createComponent";
import { For } from "./For";

export interface DynamicProps<T> {
  of?: T,
  children: JSX.Element | ((t: T) => JSX.Element)
}

interface DynamicPropsInner<T> {
  value: DynamicProps<T>
}

export const Dynamic = <T>(p: DynamicProps<T>) => {
  const props = p as unknown as DynamicPropsInner<T>;

  let count = 0;

  const list = computed(() => [
    props.value.of
      ? props.value.of
      : (props.value.children && isSignal(props.value.children))
        ? (props.value.children as any).value
        : (count = (count + 1) % 2)
  ]);

  return createComponent(For, () => ({
    of: list.value,
  }), () => (item: T) => typeof props.value.children === "function" ? props.value.children(item) : props.value.children)
}