import * as babelCore from "@babel/core";
import { template } from "@babel/core";
import { isSignal } from "../utils/is-signal";

export const identifierSignalAssign = (
    babel: typeof babelCore
): babelCore.Visitor => {
    const { types: t } = babel;

    const buildSignalGet = template.statement(`
        %%ID%%.value
    `);

    return {
        AssignmentExpression(path) {
            const left = path.get('left');
            if (left.isIdentifier() && isSignal(left.node.name)) {
                left.replaceWith(
                    buildSignalGet({
                        ID: left.node,
                    })
                );
            }
        },
    };
};
