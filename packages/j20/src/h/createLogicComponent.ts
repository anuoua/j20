import { computed } from "../api/computed";
import { untrack } from "../api/untrack";
import { FC } from "../types";

// 与 createComponent 同理：逻辑组件的函数体（isLogic 组件，如 If/For/Switch/
// Consumer/Provider）在调用方上下文里同步执行，若该上下文是某个 computed/
// effect 的求值（如 rest 解构强制求值 children getter），函数体内直接读取的
// 信号会泄漏到触发者上。用 untrack 包住函数体执行，隔离「函数体直接读信号」
// 路径；内部创建的 effect/computed 各自维护 currentReaction，响应式不受影响。
export const createLogicComponent = (
  tag: FC,
  props: undefined | (() => any)
) => {
  return untrack(() => tag(computed(() => (props ? props() : {}))));
};
