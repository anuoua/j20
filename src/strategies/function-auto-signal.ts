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

    FunctionDeclaration(path) {
      if (
        t.isIdentifier(path.node.id) &&
        isCustomHook(path.node.id.name)
      ) {
        if (
          path.node.body.type === 'BlockStatement'
        ) {
          for (const item of path.node.body.body) {
            if (t.isReturnStatement(item)) {
              item.argument = buildSignalWrap({ EXPR: item.argument });
            }
          }
        }
      }
    },

    ArrowFunctionExpression(path) {
      if (
        path.parent.type === "VariableDeclarator" &&
        path.parent.id.type === "Identifier" &&
        isCustomHook(path.parent.id.name)
      ) {
        if (t.isBlockStatement(path.node.body)) {
          for (const item of path.node.body.body) {
            if (t.isReturnStatement(item)) {
              item.argument = buildSignalWrap({ EXPR: item.argument });
            }
          }
        } else {
          path.node.body = buildSignalWrap({ EXPR: path.node.body });
        }
      }
    }
  };
};
