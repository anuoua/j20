import { expect, it } from "vitest";
import { transform } from "@babel/core";
import { j20JsxTransform } from "../src/index";

const trans = (code: string) =>
  transform(code, {
    plugins: [
      ["@babel/plugin-syntax-jsx"],
      [j20JsxTransform, { importSource: "source" }],
    ],
  })!.code!;

it("marks capitalized attr + anonymous fn + $ param", () => {
  const out = trans(
    `const el = <Widget Header={({ msg: $msg }) => $msg} />;`
  );
  expect(out).toContain("/* @signal-component */");
});

it("marks anonymous function expressions too", () => {
  const out = trans(
    `const el = <Widget Header={function ({ msg: $msg }) { return $msg; }} />;`
  );
  expect(out).toContain("/* @signal-component */");
});

it("does not mark lowercase attribute names", () => {
  const out = trans(`const el = <Widget onChange={({ e: $e }) => $e} />;`);
  expect(out).not.toContain("@signal-component");
});

it("does not mark functions without $ bindings in params", () => {
  const out = trans(`const el = <Widget Header={({ msg }) => msg} />;`);
  expect(out).not.toContain("@signal-component");
});

it("does not mark non-function values", () => {
  const out = trans(`const el = <Widget Header="str" />;`);
  expect(out).not.toContain("@signal-component");
});

it("does not mark named function expressions", () => {
  const out = trans(
    `const el = <Widget Header={function named({ msg: $msg }) { return $msg; }} />;`
  );
  expect(out).not.toContain("@signal-component");
});

it("marker is a block comment, not a line comment (ASI safety)", () => {
  const out = trans(`const el = <Widget Header={({ msg: $msg }) => $msg} />;`);
  expect(out).toContain("/* @signal-component */");
  expect(out).not.toContain("// @signal-component");
});
