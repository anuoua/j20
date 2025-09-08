import * as babelCore from "@babel/core";
import { template } from "@babel/core";
import { isSignal } from "../utils/is-signal";
import { isDollar } from "../utils/is-dollar";

export const identifierSignalRead = (
  babel: typeof babelCore
): babelCore.Visitor => {
  const { types: t } = babel;

  const buildSignalGet = template.statement(`
    %%ID%%.value
  `);

  return {
    Identifier(path) {
      const inDollarDeclar =
        path.parent.type === "CallExpression" &&
        path.parent.callee.type === "Identifier" &&
        isDollar(path.parent.callee.name);

      const isObjectPatternProperty =
        path.parentPath.isProperty() &&
        path.parentPath.parentPath.isObjectPattern();

      const hasGetProperty =
        path.parentPath.parentPath &&
        // t.isCallExpression(path.parentPath.parentPath.node) &&
        t.isMemberExpression(path.parentPath.node) &&
        t.isIdentifier(path.parentPath.node.property) &&
        path.parentPath.node.property.name === "value";

      if (
        isSignal(path.node.name) &&
        path.isReferenced() &&
        !inDollarDeclar &&
        !isObjectPatternProperty &&
        !hasGetProperty
      ) {
        path.replaceWith(
          buildSignalGet({
            ID: path.node.name,
          })
        );
        path.skip();
      }
    },
  };
};
