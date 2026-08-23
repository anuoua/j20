import { instanceCreate } from "./instance";
import { computed } from "../api/computed";
import { untrack } from "../api/untrack";
import { FC } from "../types";

// 组件实例的创建是副作用（建实例、读 context、执行函数体），但它可能被
// 任何求值上下文触发——JSX 编译把 children 放进 props 的 getter，rest 收集/
// 对象展开会强制求值该 getter，从而在某个 computed/effect 的计算过程中
// 创建子组件。若不隔离，子组件函数体内读取的信号会注册到「触发者」上
// （依赖泄漏），导致父组件状态变化时 children 被无谓重挂载。
//
// 因此在 runner 内用 untrack 包住组件函数调用：创建过程中读到的信号不再
// 捕获到触发者（currentReaction 置空）。组件内部的 effect/computed 各自
// 维护 currentReaction，响应式不受影响；只有「函数体直接读信号」这一路径
// 被隔离，而函数体只执行一次、本就无重跑机制，隔离它是安全的。
export const createComponent = (tag: FC, props: undefined | (() => any)) => {
  const runner = () =>
    untrack(() => tag(computed(() => (props ? props() : {}))));

  let [, fragment] = instanceCreate(runner as any);
  return fragment;
};
