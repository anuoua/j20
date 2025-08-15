import * as babelCore from "@babel/core";
import type { types as T } from "@babel/core";
import * as g from '@babel/generator'

const { types: t, template } = babelCore;

export const jsxTransform = (
    // babel: typeof babelCore
): babelCore.Visitor => {

    return {
        Program: {
            exit(path) {
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
            }
        },

        JSXFragment: {
            exit(path) {
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
            }
        },

        JSXElement: {
            exit(path) {
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
                        isCompatTag = false;
                        tagName = buildJSXMemberExpressionTagName(name as any);
                        break;
                    }
                    case "JSXNamespacedName": {
                        throw new Error("JSXNamespacedName is not supported");
                    }
                }

                const children: T.Expression[] = [];
                path.scope.getData("childCacheCount") ?? path.scope.setData("childCacheCount", 0);

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
                            children.push(t.spreadElement(child.node.expression) as unknown as T.Expression);
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
                let attrs: (T.ObjectMethod | T.SpreadElement)[] = [];
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

                let jsx: T.Expression;
                let elStr: any;
                if (isCompatTag) {
                    const temp = `\`<${tagName}${primitiveAttrsStr ? ` ${primitiveAttrsStr}` : ''}>\``;
                    const id = addTemplate(path, temp);
                    elStr = t.callExpression(id, []);
                } else {
                    elStr = t.identifier(tagName);
                }
                if (children.length > 0) {
                    const multiple = children.length > 1;
                    jsx = template.expression(`
                    ${multiple ? path.scope.getData("jsxsVarName") : path.scope.getData("jsxVarName")}(%%TAG%%, computed(() => ({
                        ${attrsStr ? `${attrsStr},` : ''}
                        get children() { return %%CHILDREN%% }
                    })))
                `)({
                        CHILDREN: multiple ? t.arrayExpression(children) : children[0],
                        TAG: elStr,
                    })
                } else {
                    jsx = template.expression(`
                        ${path.scope.getData("jsxVarName")}(%%TAG%%)
                    `)({
                        TAG: elStr,
                    });
                }

                path.replaceWith(jsx);
            }
        }
    };
};

const buildJSXMemberExpressionTagName = (name: babelCore.NodePath<T.JSXMemberExpression>) => {
    const arr: string[] = [];
    let path: babelCore.NodePath<T.JSXMemberExpression | T.JSXIdentifier> = name;
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

const addTemplate = (path: babelCore.NodePath<T.JSXElement>, templateContent: string) => {
    const { types: t, template } = babelCore;

    const programPath = path.find(p => p.isProgram()) as babelCore.NodePath<T.Program>;

    const lastTemplateVariableIndex = programPath.node.body.findLastIndex(i =>
        i.type === "VariableDeclaration" &&
        i.declarations[0]?.id.type === "Identifier" &&
        i.declarations[0].id.name.startsWith("__tmpl")
    )

    const lastImportIndex = programPath.node.body.findLastIndex(i => i.type === "ImportDeclaration");

    const lastIndex = lastTemplateVariableIndex === -1 ? lastImportIndex === -1 ? 0 : lastImportIndex : lastTemplateVariableIndex;

    path.scope.setData("templateCount", (path.scope.getData("templateCount") ?? 0) + 1);

    const isExist = path.scope.getData("templateMap")?.[templateContent] != undefined;

    if (!isExist) {
        path.scope.setData("templateMap", {
            ...path.scope.getData("templateMap"),
            [templateContent]: path.scope.getData("templateCount")
        });
    }

    const templateStatement = isExist ?
        template.statement(`const __tmpl${path.scope.getData("templateCount")} = __tmpl${path.scope.getData("templateCount") - 1}`)() as T.VariableDeclaration :
        template.statement(`const __tmpl${path.scope.getData("templateCount")} = ${path.scope.getData("templateVarName")}(${templateContent})`)() as T.VariableDeclaration;

    if (lastIndex === -1) {
        programPath.node.body.unshift(
            templateStatement
        )
    } else {
        programPath.node.body.splice(lastIndex + 1, 0, templateStatement);
    }

    return templateStatement.declarations[0].id as T.Identifier;
}
