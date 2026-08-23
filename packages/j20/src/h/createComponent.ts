import { instanceCreate } from "./instance";
import { computed } from "../api/computed";
import { untrack } from "../api/untrack";
import { FC } from "../types";

// 组件实例的创建是副作用（建实例、读 context、执行函数体），但它可能被
// 任何求值上下文触发——JSX 编译把 children 编译成惰性 thunk（函数属性），
// rest 收集/对象展开只会拷贝函数引用、不会触发创建，因此 children 的创建
// 被推迟到显式调用时（组件 body 内或 getChildren 挂载时）。
//
// 仍在 runner 内用 untrack 包住组件函数调用：创建过程中读到的信号不再
// 捕获到触发者（currentReaction 置空）。组件内部的 effect/computed 各自
// 维护 currentReaction，响应式不受影响；只有「函数体直接读信号」这一路径
// 被隔离，而函数体只执行一次、本就无重跑机制，隔离它是安全的。
//
// children thunk 在此处打上 isLogic 标记：getChildren 遇到带标记的函数时
// 按逻辑组件创建（untrack 一次性调用，静态内容约定）。
export const createComponent = (tag: FC, props: undefined | (() => any)) => {
  const runner = () =>
    untrack(() =>
      tag(
        computed(() => {
          const p = props ? props() : {};
          if (p && typeof p.children === "function") {
            p.children.isLogic = true;
          }
          return p;
        })
      )
    );

  let [, fragment] = instanceCreate(runner as any);
  return fragment;
};
