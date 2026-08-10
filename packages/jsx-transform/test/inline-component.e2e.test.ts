import { expect, it } from "vitest";
import { transform } from "@babel/core";
import { j20JsxTransform } from "../src/index";
import { signalCompiler } from "signal-compiler";

// 与 example/Todo.tsx 相同的真实 JSX 用法：行内组件作为 JSX 属性值
const jsxSource = `
const App = () => (
  <TodoItem
    Insert={({ value: $value }) => {
      let $msg = "msg";
      return <div>{$value}{$msg}</div>;
    }}
  />
);
`;

it("e2e: jsx-transform 打标记 → signal-compiler 编译行内组件", () => {
  const step1 = transform(jsxSource, {
    plugins: [["@babel/plugin-syntax-jsx"], [j20JsxTransform, { importSource: "j20" }]],
  })!.code!;
  console.log("=====STEP1 (jsx-transform)=====");
  console.log(step1);

  const step2 = transform(step1, {
    plugins: [[signalCompiler, { importSource: "j20" }]],
  })!.code!;
  console.log("=====STEP2 (signal-compiler)=====");
  console.log(step2);

  expect(step1).toContain("/* @signal-component */");
  expect(step2).toContain("_computed(() => __$0.value[\"value\"])");
  expect(step2).not.toContain("value: $value"); // 参数已重写为临时变量
});
