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
      return () => (item: any) => {
        const bool = !!item.value;
        const propsValues = props.value;
        if (bool) {
          // children 是惰性 thunk：解包后才可能是用户函数（带 true 参数）
          const children = (propsValues.children as any)();
          if (children && typeof children === "function") {
            return children(true);
          }
          return children;
        }
        // 未渲染分支不调用 children thunk：调用会创建子组件（副作用），
        // 把共享的 children fragment 内容搬进被丢弃的节点。
        return propsValues.else;
      };
    },
  }));
};

If.isLogic = true;
