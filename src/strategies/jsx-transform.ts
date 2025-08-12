import * as babelCore from "@babel/core";
import * as g from '@babel/generator'

export const jsxTransform = (
    babel: typeof babelCore
): babelCore.Visitor => {
    const { types: t, template } = babel;

    return {
        Program(path) {
            if (!path.scope.getBinding("__child_cache")) {
                const index = path.node.body.findLastIndex(i => i.type === "ImportDeclaration");
                if (index === -1) {
                    path.node.body.unshift(template.statement`
                        const __child_cache = [];
                    `());
                } else {
                    path.node.body.splice(index + 1, 0, template.statement`
                        const __child_cache = [];
                    `());
                }
            }
        },

        JSXFragment(path) {
            path.replaceWith(t.jsxElement(
                t.jsxOpeningElement(
                    t.jsxIdentifier(path.scope.getData("fragmentVarName")),
                    [],
                    false
                ),
                t.jsxClosingElement(
                    t.jsxIdentifier(path.scope.getData("fragmentVarName")),
                ),
                path.node.children,
                false
            ));
        },

        JSXElement(path) {
            const name = path.get('openingElement').get("name");

            let isCompatTag = false;
            let tagName = "";

            switch (name.node.type) {
                case "JSXIdentifier": {
                    isCompatTag = t.react.isCompatTag(name.node.name);
                    tagName = name.node.name;
                    break;
                }
                case "JSXMemberExpression": {
                    isCompatTag = true;
                    tagName = buildJSXMemberExpressionTagName(name as any);
                    break;
                }
                case "JSXNamespacedName": {
                    throw new Error("JSXNamespacedName is not supported");
                }
            }

            const children: babelCore.types.Expression[] = [];
            let childCacheCount = path.scope.getData("childCacheCount") ?? path.scope.setData("childCacheCount", 0);

            for (const child of path.get('children')) {
                switch (child.node.type) {
                    case "JSXText": {
                        const text = child.node.value.replace(/\n\s*/g, '');
                        text && children.push(t.stringLiteral(text));
                        break;
                    }
                    case "JSXExpressionContainer": {
                        if (child.node.expression.type !== "JSXEmptyExpression") children.push(child.node.expression)
                        break;
                    }
                    case "JSXElement": {
                        children.push(child.node);
                        break;
                    }
                    case "JSXSpreadChild": {
                        children.push(t.spreadElement(child.node.expression) as unknown as babelCore.types.Expression);
                        break;
                    }
                    default: {
                        path.scope.setData("childCacheCount", path.scope.getData("childCacheCount") + 1);
                        const childCache = t.memberExpression(
                            t.identifier('__child_cache'),
                            t.numericLiteral(path.scope.getData("childCacheCount")),
                            true
                        );
                        children.push(t.logicalExpression("??", childCache, t.assignmentExpression("=", t.cloneNode(childCache, true), child.node)));
                        break;
                    }
                }
            }

            let primitiveAttrs: Record<string, string | boolean | number>[] = [];
            let attrs: (babelCore.types.ObjectMethod | babelCore.types.SpreadElement)[] = [];
            for (const attr of path.get('openingElement').get('attributes')) {
                switch (attr.node.type) {
                    case "JSXAttribute": {
                        if (attr.node.name.type === "JSXIdentifier") {
                            if (attr.node.value) {
                                const value = attr.node.value.type === "JSXExpressionContainer" ? attr.node.value.expression : attr.node.value;
                                if (value.type !== "JSXEmptyExpression") {
                                    if (isCompatTag && (value.type === "StringLiteral" || value.type === "NumericLiteral")) {
                                        primitiveAttrs.push({
                                            key: attr.node.name.name,
                                            value: value.value,
                                        });
                                    } else {
                                        attrs.push(
                                            t.objectMethod("get", t.identifier(attr.node.name.name), [], t.blockStatement([
                                                t.returnStatement(value),
                                            ])),
                                        )
                                    }
                                }
                            } else {
                                if (isCompatTag) {
                                    primitiveAttrs.push({
                                        key: attr.node.name.name,
                                        value: true,
                                    });
                                } else {
                                    attrs.push(
                                        t.objectMethod("get", t.identifier(attr.node.name.name), [], t.blockStatement([
                                            t.returnStatement(t.booleanLiteral(true)),
                                        ])),
                                    )
                                }
                            }
                        }
                        break;
                    }
                    case "JSXSpreadAttribute": {
                        attrs.push(
                            t.spreadElement(attr.node.argument)
                        )
                        break;
                    }
                }
            }

            const primitiveAttrsStr = primitiveAttrs.map(attr => {
                const key = attr.key;
                const value = attr.value;
                return typeof value === "boolean" ? `${key}` : `${key}="${value}"`
            }).join(' ');

            const attrsAst = template.expression(`%%ATTRS%%`)({
                ATTRS: t.objectExpression(attrs),
            });

            const attrsStr = attrs.length > 0
                ? g.generate(attrsAst).code.slice(1, -1)
                : '';

            let jsx: babelCore.types.Expression;
            if (children.length > 0) {
                const multiple = children.length > 1;
                jsx = template.expression(`
                    ${multiple ? path.scope.getData("jsxsVarName") : path.scope.getData("jsxVarName")}(${isCompatTag ? `\`<${tagName}${primitiveAttrsStr ? ` ${primitiveAttrsStr}` : ''}>\`` : tagName}, computed(() => ({
                        ${attrsStr ? `${attrsStr},` : ''}
                        get children() { return %%CHILDREN%% }
                    })))
                `)({
                    CHILDREN: multiple ? t.arrayExpression(children) : children[0],
                })
            } else {
                jsx = template.expression(`
                    ${path.scope.getData("jsxVarName")}(${tagName})
                `)();
            }

            path.replaceWith(jsx);
        }
    };
};

const buildJSXMemberExpressionTagName = (name: babelCore.NodePath<babelCore.types.JSXMemberExpression>) => {
    const arr: string[] = [];
    let path: babelCore.NodePath<babelCore.types.JSXMemberExpression | babelCore.types.JSXIdentifier> = name;
    while (true) {
        arr.push(path.get('property').node.name);
        const objectNode = path.get('object').node;
        if (objectNode.type === 'JSXMemberExpression') {
            path = path.get('object');
        } else if (objectNode.type === 'JSXIdentifier') {
            arr.push(objectNode.name);
            break;
        }
    }
    return arr.reverse().join('.');
}
