import * as babelCore from "@babel/core";
import { isCompatTagByOpeningPath } from "../transform-jsx-react/utils";

export const jsxAutoSignal = (
    babel: typeof babelCore
): babelCore.Visitor => {
    const { types: t } = babel;

    return {
        JSXExpressionContainer(path) {
            if (path.node.expression.type === "JSXEmptyExpression") return;

            if (path.parentPath.type === "JSXElement") {
                const openingPath = path.parentPath.get("openingElement");
                if (!isCompatTagByOpeningPath(openingPath)) {
                    path.node.expression = t.callExpression(
                        t.identifier('computed'),
                        [
                            t.arrowFunctionExpression([], path.node.expression)
                        ]
                    );
                }
            }
        }
    };
};
