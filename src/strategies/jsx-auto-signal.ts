import * as babelCore from "@babel/core";

export const jsxAutoSignal = (
    babel: typeof babelCore
): babelCore.Visitor => {
    const { types: t } = babel;

    return {
        JSXExpressionContainer(path) {
            if (path.node.expression.type === "JSXEmptyExpression") return;
            path.node.expression = t.callExpression(
                t.identifier('computed'),
                [
                    t.arrowFunctionExpression([], path.node.expression)
                ]
            );
        }
    };
};
