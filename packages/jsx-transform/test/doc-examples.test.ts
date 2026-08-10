import { expect, it } from "vitest";
import { transform } from "@babel/core";
import { j20JsxTransform } from "../src/index";
import { signalCompiler } from "signal-compiler";

// 文档「组件插槽」章节示例的回归测试，防止文档示例与编译行为脱节。
// 真实管线中 TS 注解由 oxc 先剥离，这里手动剥离（不影响编译语义）。
const stripTs = (code: string) =>
  code
    .replace(
      "($props: { title: string; Action?: FC<{ count: number }>; })",
      "($props)"
    )
    .replace(
      "($props: { children?: JSX.Element; bottom?: JSX.Element; })",
      "($props)"
    );

const pipe = (code: string) => {
  const s1 = transform(stripTs(code), {
    plugins: [
      ["@babel/plugin-syntax-jsx"],
      [j20JsxTransform, { importSource: "j20" }],
    ],
  })!.code!;
  const s2 = transform(s1, {
    plugins: [[signalCompiler, { importSource: "j20" }]],
  })!.code!;
  return { s1, s2 };
};

// 声明段：组件内通过 JSX 调用插槽（含可选判空），不是直接函数调用
const decl = `
const Panel = ($props: { title: string; Action?: FC<{ count: number }>; }) => {
  let $count = 0;
  const { Action } = $props;
  return (
    <div class="panel">
      <h2>{$props.title}</h2>
      {Action ? <Action count={$count} /> : null}
    </div>
  );
};
`;

// 使用段：大写属性名 + 匿名函数 + $ 解构参数 → 插槽被编译为组件
const use = `
<Panel title="计数器" Action={({ count: $count }) => <span>当前值：{$count}</span>} />
`;

it("doc: Panel 声明段 — 插槽经 JSX 调用、可选判空", () => {
  const { s2 } = pipe(decl);
  // JSX 调用（_jsx(Action, ...)），而不是直接函数调用 $props.Action(...)
  expect(s2).toContain("_jsx(Action, () => ({");
  expect(s2).not.toContain("$props.Action({");
  // 可选插槽判空 + 信号读取补 .value
  expect(s2).toContain("Action ? _jsx(Action");
  expect(s2).toContain("$count.value");
});

it("doc: 使用段 — 插槽函数被打标记并编译为组件", () => {
  const { s1, s2 } = pipe(use);
  expect(s1).toContain("/* @signal-component */");
  // 参数解构 → computed 派生信号，读取 → .value
  expect(s2).toContain("__$0.value[\"count\"]");
  expect(s2).toContain("$count.value");
});

// 静态内容：children 或小写属性，组件内直接解构、不转信号
const staticDecl = `
const Panel = ($props: { children?: JSX.Element; bottom?: JSX.Element; }) => {
  const { children, bottom } = $props;
  return (
    <div>
      {children}
      {bottom}
    </div>
  );
};
`;
const staticUse = `
<Panel bottom={<span>bottom</span>}>static content</Panel>
`;

it("doc: 静态内容 — children/小写属性，直接解构不转信号", () => {
  const d = pipe(staticDecl);
  const u = pipe(staticUse);
  // 组件内直接解构 $props.value，不产生 computed
  expect(d.s2).toContain("} = $props.value;");
  expect(d.s2).not.toContain("_computed");
  // children 与小写属性都是 lazy getter（使用时才初始化）
  expect(u.s1).toContain("get bottom()");
  expect(u.s1).toContain("get children()");
  // 静态内容不是插槽，不被标记
  expect(u.s1).not.toContain("@signal-component");
});

// 界面突变应交给 If，而不是用动态表达式（绑定对象不稳定）
it("doc: 静态内容 — 界面突变用 If，不用动态表达式", () => {
  const bad = pipe(
    `<Panel bottom={$visible ? <span>visible</span> : <div>invisible</div>} />`
  );
  const good = pipe(
    `<Panel bottom={<If of={$visible} else={<div>invisible</div>}><span>visible</span></If>} />`
  );
  // 两者都是 lazy getter、不被打插槽标记
  expect(bad.s1).not.toContain("@signal-component");
  expect(good.s1).not.toContain("@signal-component");
  // 三元：getter 内是条件表达式（绑定对象不稳定）
  expect(bad.s1).toContain("return $visible ? _jsx");
  // If：绑定的是单个稳定的 _jsx(If, ...) 对象
  expect(good.s1).toContain("return _jsx(If,");
});
