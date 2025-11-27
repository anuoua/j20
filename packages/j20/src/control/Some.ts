import { computed } from "../api/computed";
import { createComponent } from "../h/createComponent";
import { For } from "./For";

export interface SomeProps<T> {
  of: T;
  children: (v: Exclude<T, undefined | null>) => JSX.Element;
  none?: JSX.Element;
}

interface SomePropsInner<T> {
  value: SomeProps<T>;
}

// 实现
function Some<T>(p: SomeProps<T>): JSX.Element {
  const props = p as unknown as SomePropsInner<T>;

  const resSig = computed(() => props.value.of);

  const arr = computed(() => (resSig.value != null ? [1] : [0]));

  return createComponent(For as (p: any) => any, () => ({
    get of() {
      return arr.value;
    },
    get children() {
      return (bool: 1 | 0) => {
        const propsValues = props.value;
        const { children } = propsValues;
        if (bool) {
          return children(computed(() => resSig.value) as any);
        } else {
          return propsValues.none;
        }
      };
    },
  }));
}

Some.isLogic = true;

export { Some };
