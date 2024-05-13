import * as babelCore from "@babel/core";
import { isCustomHook } from "../utils/is-custom-hook";
import type { Config } from "../types";

export const jsxAutoSignal = (
  babel: typeof babelCore,
  config: Config
): babelCore.Visitor => {
  const { types: t, template } = babel;

  const buildSignalWrap = template.expression(`
    ${config.computed}(() => %%EXPR%%)
  `);

  const buildPlainWrap = template.expression(`
    {
      value: %%EXPR%%
    }
  `);

  return {
    JSXOpeningElement(path) {
      path.node.attributes.forEach((attribute, index) => {
        if (t.isJSXAttribute(attribute)) {
          if (attribute.value == null) {
            attribute.value = t.jsxExpressionContainer(
              buildPlainWrap({
                EXPR: "true",
              })
            );
            return;
          }
          switch (attribute.value.type) {
            case "JSXExpressionContainer": {
              if (t.isJSXExpressionContainer(attribute.value)) {
                if (t.isLiteral(attribute.value.expression)) {
                  attribute.value.expression = buildPlainWrap({
                    EXPR: attribute.value.expression,
                  });
                } else {
                  attribute.value.expression = buildSignalWrap({
                    EXPR: attribute.value.expression,
                  });
                }
              }
              break;
            }
            case "StringLiteral": {
              attribute.value = t.jsxExpressionContainer(
                buildPlainWrap({
                  EXPR: attribute.value,
                })
              );
              break;
            }
          }
        } else if (t.isJSXSpreadAttribute(attribute)) {
          attribute.argument = buildSignalWrap({
            EXPR: attribute.argument,
          });
        }
      });
    },
  };
};
