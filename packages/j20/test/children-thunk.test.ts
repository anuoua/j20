// 新 children 编译策略（children: () => expr 惰性 thunk + isLogic 标记）的
// 运行时链路回归：组件 children thunk 经 {children} 挂载到 DOM、嵌套传递、
// 静态内容内的响应式叶子保持响应式。

import { it, expect } from "vitest";
import { createElement } from "../src/h/createElement";
import { instanceCreate } from "../src/h/instance";
import { signal } from "../src/api/signal";

const { body } = document;

// 模拟编译产物（决策 2 新形态）：
// <Panel>{$props.children}</Panel>  +  <Panel><span>hi</span></Panel>
it("component children thunk renders via {children} (isLogic untrack path)", () => {
  body.innerHTML = "";
  const Panel = (props: any) =>
    createElement(
      document.createElement("div"),
      () => ({}),
      () => [() => props.value.children] // <div>{children}</div>
    );

  const [, fragment] = instanceCreate(() =>
    createElement(
      Panel as any,
      () => ({ children: () => "hi" }), // children: () => expr
      undefined
    )
  );
  body.appendChild(fragment);
  expect(body.textContent).toContain("hi");
});

it("nested component children thunk chain", () => {
  body.innerHTML = "";
  const Inner = (props: any) =>
    createElement(
      document.createElement("span"),
      () => ({}),
      () => [() => props.value.children]
    );
  const Panel = (props: any) =>
    createElement(
      Inner as any,
      () => ({ children: () => props.value.children }), // <Inner>{children}</Inner>
      undefined
    );

  const [, fragment] = instanceCreate(() =>
    createElement(
      Panel as any,
      () => ({ children: () => "nested" }),
      undefined
    )
  );
  body.appendChild(fragment);
  expect(body.textContent).toContain("nested");
});

it("static content with reactive leaf inside children stays reactive", () => {
  body.innerHTML = "";
  const $text = signal("a");
  const Panel = (props: any) =>
    createElement(
      document.createElement("div"),
      () => ({}),
      () => [() => props.value.children]
    );

  const [, fragment] = instanceCreate(() =>
    createElement(
      Panel as any,
      // <Panel><span>{$text}</span></Panel> → children: () => _jsx(span, undefined, () => [() => $text.value])
      () => ({
        children: () =>
          createElement(
            document.createElement("span"),
            () => ({}),
            () => [() => $text.value]
          ),
      }),
      undefined
    )
  );
  body.appendChild(fragment);
  expect(body.textContent).toBe("a");
  $text.value = "b";
  expect(body.textContent).toBe("b");
});
