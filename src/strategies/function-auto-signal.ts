import * as babelCore from "@babel/core";
import { isCustomHook } from "../utils/is-custom-hook";
import type { Config } from "../types";

export const functionAutoSignal = (
  babel: typeof babelCore,
  config: Config
): babelCore.Visitor => {
  const { types: t, template } = babel;

  const buildSignalWrap = template.expression(`
    ${config.computed}(() => %%EXPR%%)
  `);

  return {
    CallExpression(path) {
      if (
        t.isIdentifier(path.node.callee) &&
        isCustomHook(path.node.callee.name)
      ) {
        path.node.arguments.forEach((argument, index) => {
          path.node.arguments[index] = buildSignalWrap({ EXPR: argument });
        });
      }
    },
  };
};
