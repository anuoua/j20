import { template, types as t, NodePath } from "@babel/core";
import { JSXOpeningElement } from "@babel/types";

export function convertJSXIdentifier(
    node: t.JSXIdentifier | t.JSXMemberExpression | t.JSXNamespacedName,
    parent: t.JSXOpeningElement | t.JSXMemberExpression,
): t.ThisExpression | t.StringLiteral | t.MemberExpression | t.Identifier {
    if (t.isJSXIdentifier(node)) {
        if (node.name === "this" && t.isReferenced(node, parent)) {
            return t.thisExpression();
        } else if (t.isValidIdentifier(node.name, false)) {
            // @ts-expect-error cast AST type to Identifier
            node.type = "Identifier";
            return node as unknown as t.Identifier;
        } else {
            return t.stringLiteral(node.name);
        }
    } else if (t.isJSXMemberExpression(node)) {
        return t.memberExpression(
            convertJSXIdentifier(node.object, node),
            convertJSXIdentifier(node.property, node),
        );
    } else if (t.isJSXNamespacedName(node)) {
        /**
         * If the flag "throwIfNamespace" is false
         * print XMLNamespace like string literal
         */
        return t.stringLiteral(`${node.namespace.name}:${node.name.name}`);
    }

    // todo: this branch should be unreachable
    return node;
}

export function isCompatTagByOpeningPath(openingPath: NodePath<JSXOpeningElement>) {
    const tagExpr = convertJSXIdentifier(
        openingPath.node.name,
        openingPath.node,
    );

    let tagName: string;
    if (t.isIdentifier(tagExpr)) {
        tagName = tagExpr.name;
    } else if (t.isStringLiteral(tagExpr)) {
        tagName = tagExpr.value;
    }

    return !t.react.isCompatTag(tagName!)
}