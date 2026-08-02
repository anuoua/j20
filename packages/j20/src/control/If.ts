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
      return (item: any) => {
        const bool = !!item.value;
        const propsValues = props.value;
        if (bool) {
          const children = propsValues.children;
          if (children && typeof children === "function") {
            return children(true);
          }
          return children;
        }
        // 未渲染分支不读取 children：读取会创建子组件（副作用），
        // 把共享的 children fragment 内容搬进被丢弃的节点。
        return propsValues.else;
      };
    },
  }));
};

If.isLogic = true;
