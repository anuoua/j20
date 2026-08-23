import { it, expect, beforeEach, describe } from "vitest";
import { signal } from "../src/api/signal";
import { computed } from "../src/api/computed";
import { effect } from "../src/api/effect";
import { createContext, $useContext } from "../src/api/context";
import { createElement } from "../src/h/createElement";
import { instanceCreate } from "../src/h/instance";

const { body } = document;

beforeEach(() => {
  body.innerHTML = "";
});

// 回归：组件对 $props 做 rest 解构（const { className, ...$rest } = $props）
// 时，JS 的 rest 收集会强制求值 props 对象上剩余的 getter。旧编译策略把
// children 放进 getter，求值即创建子组件实例——若创建发生在某个
// computed/effect 的求值上下文里，子组件函数体内读取的信号会被注册到该
// 反应上（依赖泄漏）。新策略下 children 是惰性 thunk，rest 解构只拷贝函数
// 引用、不再触发创建，问题从根上消除；但 createComponent 仍保留 untrack
// 作为通用防御（组件创建副作用不捕获到触发者）。本测试继续验证该防御。
//
// 本测试手写旧编译产物形态（不依赖 babel）：Root 内 $rest 为 computed，
// `<div {...$rest}>` 的粗粒度属性 effect 读取 $rest.value（模拟 spread），
// children 为 getter。断言：点击后文本更新、子组件不重挂载、无异常抛出。
describe("props rest destructuring", () => {
  it("should not leak children deps nor remount children on state change", () => {
    const Ctx = createContext<{ count: number } | undefined>(undefined);

    let innerRuns = 0;
    const Inner = () => {
      innerRuns++;
      // 编译器形态：$useContext(Ctx) → $useContext(computed(() => Ctx))
      const ctx = $useContext(computed(() => Ctx));
      if (!ctx) throw new Error("Inner must be within Root");
      // 模拟真实产物中组件创建链的立即读取：控制组件（If/For）创建时其内部
      // effect 会同步执行并读到 context 值——该读取发生在触发者（$rest）的
      // 求值上下文里，修复前会泄漏 $state 依赖，状态变化时导致重挂载。
      void ctx.value.count;
      // 模拟 <div>count= {ctx.value.count}</div> 的编译产物：
      //   外层惰性箭头 + 内层函数 child（getChildren 用 effect 包裹内层函数，
      //   文本随 ctx.value.count 原地更新）
      return createElement(
        document.createElement("div"),
        undefined,
        () => [() => "count=" + ctx.value.count]
      );
    };

    // 模拟编译产物：<Root className="repro"><Inner /></Root>
    const Root = ($props: any) => {
      // const { className: $className, ...$rest } = $props
      //   → const $rest = computed(() => { const { className, ...___1 } = __$0.value; return ___1; })
      const $rest = computed(() => {
        const { className: _c, ...rest } = $props.value;
        return rest;
      });
      const $state = signal({ count: 0 });

      return createElement(
        Ctx as any,
        () => ({
          get value() {
            return $state.value;
          },
          get children() {
            // <div {...$rest}>：属性是 spread（非 getter），nodeAttributesEffect
            // 会退化为粗粒度 effect，首次执行即读取 $rest.value——rest 收集
            // 强制求值 children getter，创建 Inner（依赖泄漏的源头）。
            effect(() => {
              void $rest.value;
            });
            const div = document.createElement("div");
            const btn = document.createElement("button");
            btn.onclick = () => {
              $state.value = { count: $state.value.count + 1 };
            };
            btn.textContent = "+";
            div.append(btn);
            // {$props.children} → 函数 child
            return [() => $props.value.children, div];
          },
        }),
        undefined
      );
    };

    const [, fragment] = instanceCreate(() =>
      createElement(
        Root as any,
        () => ({
          get className() {
            return "repro";
          },
          get children() {
            return createElement(Inner as any, undefined, undefined);
          },
        }),
        undefined
      )
    );
    body.appendChild(fragment);

    expect(body.textContent).toContain("count=0");
    const runsBefore = innerRuns;

    const btn = body.querySelector("button")!;
    expect(() => btn.click()).not.toThrow();

    expect(body.textContent).toContain("count=1");
    // 子组件不应因父组件状态变化被重挂载
    expect(innerRuns).toBe(runsBefore);
  });

  it("logic components reading signals synchronously in body should not leak deps", () => {
    // 自定义逻辑组件（isLogic）的函数体同步执行；若它在 rest 解构的求值
    // 上下文里被创建，body 直接读信号会泄漏到触发者（$rest）。模拟：
    //   get children() { return _jsx(MyLogic, ...) }
    const gState = signal({ count: 0 });

    let logicRuns = 0;
    const MyLogic = ((props: any) => {
      logicRuns++;
      void gState.value.count; // body 直接读信号（逻辑组件同步执行路径）
      const div = document.createElement("div");
      div.textContent = "logic:" + gState.value.count;
      return div;
    }) as any;
    MyLogic.isLogic = true;

    const Root = ($props: any) => {
      const $rest = computed(() => {
        const { className: _c, ...rest } = $props.value;
        return rest;
      });

      return createElement(
        document.createElement("div"),
        () => ({}),
        () => {
          // <div {...$rest}>：粗粒度属性 effect 读取 $rest.value，rest 收集
          // 强制求值 children getter → 创建 MyLogic（泄漏源）。
          effect(() => {
            void $rest.value;
          });
          const btn = document.createElement("button");
          btn.onclick = () => {
            gState.value = { count: gState.value.count + 1 };
          };
          btn.textContent = "+";
          return [() => $props.value.children, btn];
        }
      );
    };

    const [, fragment] = instanceCreate(() =>
      createElement(
        Root as any,
        () => ({
          get className() {
            return "repro";
          },
          get children() {
            return createElement(MyLogic, () => ({}), undefined);
          },
        }),
        undefined
      )
    );
    body.appendChild(fragment);

    expect(body.textContent).toContain("logic:0");
    const runsBefore = logicRuns;

    const btn = body.querySelector("button")!;
    expect(() => btn.click()).not.toThrow();

    // 逻辑组件不应因父组件状态变化被重建
    expect(logicRuns).toBe(runsBefore);
  });
});
