import * as babelCore from "@babel/core";
import type { types as T } from "@babel/core";
import * as g from "@babel/generator";

const { types: t, template } = babelCore;

const svgTags = [
  "animate",
  "animateMotion",
  "animateTransform",
  "circle",
  "clipPath",
  "defs",
  "desc",
  "ellipse",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feDistantLight",
  "feDropShadow",
  "feFlood",
  "feFuncA",
  "feFuncB",
  "feFuncG",
  "feFuncR",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMergeNode",
  "feMorphology",
  "feOffset",
  "fePointLight",
  "feSpecularLighting",
  "feSpotLight",
  "feTile",
  "feTurbulence",
  "filter",
  "foreignObject",
  "g",
  "image",
  "line",
  "linearGradient",
  "marker",
  "mask",
  "metadata",
  "mpath",
  "path",
  "pattern",
  "polygon",
  "polyline",
  "radialGradient",
  "rect",
  "script",
  "set",
  "stop",
  // "svg",
  "switch",
  "symbol",
  "text",
  "textPath",
  "tspan",
  "use",
  "view",
];

const conflictSvgTags = ["title", "script", "style", "a"];

export const jsxTransform = () // babel: typeof babelCore
: babelCore.Visitor => {
  return {
    JSXFragment: {
      enter(path) {
        path.replaceWith(
          t.jsxElement(
            t.jsxOpeningElement(
              t.jsxIdentifier(path.state.fragmentVarName),
              [],
              false
            ),
            t.jsxClosingElement(t.jsxIdentifier(path.state.fragmentVarName)),
            path.node.children,
            false
          )
        );
      },
    },

    JSXElement: {
      exit(path) {
        const name = path.get("openingElement").get("name");

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

        let isSvg = false;

        if (name.node.type === "JSXIdentifier") {
          if (svgTags.includes(name.node.name)) {
            isSvg = true;
          }
          if (
            conflictSvgTags.includes(name.node.name) &&
            path.parent.type === "JSXElement" &&
            path.parent.openingElement.name.type === "JSXIdentifier" &&
            path.parent.openingElement.name.name === "svg"
          ) {
            isSvg = true;
          }
        }

        const children: T.Expression[] = [];

        for (const child of path.get("children")) {
          switch (child.node.type) {
            case "JSXText": {
              const text = child.node.value.replace(/\n\s*/g, "");
              text && children.push(t.stringLiteral(text));
              break;
            }
            case "JSXExpressionContainer": {
              if (
                child.node.expression.type === "StringLiteral" ||
                child.node.expression.type === "NumericLiteral"
              ) {
                children.push(child.node.expression);
              } else if (child.node.expression.type !== "JSXEmptyExpression")
                children.push(
                  isCompatTag
                    ? template.expression(`() => %%EXP%%`)({
                        EXP: child.node.expression,
                      })
                    : child.node.expression
                );
              break;
            }
            case "JSXElement": {
              children.push(child.node);
              break;
            }
            case "JSXSpreadChild": {
              children.push(
                t.spreadElement(
                  child.node.expression
                ) as unknown as T.Expression
              );
              break;
            }
            default: {
              children.push(child.node);
              break;
            }
          }
        }

        let primitiveAttrs: Record<string, string | boolean | number>[] = [];
        let attrs: (T.ObjectMethod | T.SpreadElement)[] = [];
        for (const attr of path.get("openingElement").get("attributes")) {
          switch (attr.node.type) {
            case "JSXAttribute": {
              if (attr.node.name.type === "JSXIdentifier") {
                if (attr.node.value) {
                  const value =
                    attr.node.value.type === "JSXExpressionContainer"
                      ? attr.node.value.expression
                      : attr.node.value;
                  if (value.type !== "JSXEmptyExpression") {
                    if (
                      isCompatTag &&
                      (value.type === "StringLiteral" ||
                        value.type === "NumericLiteral")
                    ) {
                      primitiveAttrs.push({
                        key: attr.node.name.name,
                        value: value.value,
                      });
                    } else {
                      attrs.push(
                        t.objectMethod(
                          "get",
                          t.identifier(attr.node.name.name),
                          [],
                          t.blockStatement([t.returnStatement(value)])
                        )
                      );
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
                      t.objectMethod(
                        "get",
                        t.identifier(attr.node.name.name),
                        [],
                        t.blockStatement([
                          t.returnStatement(t.booleanLiteral(true)),
                        ])
                      )
                    );
                  }
                }
              }
              break;
            }
            case "JSXSpreadAttribute": {
              attrs.push(t.spreadElement(attr.node.argument));
              break;
            }
          }
        }

        const primitiveAttrsStr = primitiveAttrs
          .map((attr) => {
            const key = attr.key;
            const value = attr.value;
            return typeof value === "boolean" ? `${key}` : `${key}="${value}"`;
          })
          .join(" ");

        const attrsAst = template.expression(`%%ATTRS%%`)({
          ATTRS: t.objectExpression(attrs),
        });

        const attrsStr =
          attrs.length > 0 ? g.generate(attrsAst).code.slice(1, -1) : "";

        let jsx: T.Expression;
        let jsxTag: any;
        if (isCompatTag) {
          const temp = `\`<${tagName}${primitiveAttrsStr ? ` ${primitiveAttrsStr}` : ""}>\``;
          const id = addTemplate(path, temp);
          jsxTag = t.callExpression(id, isSvg ? [t.booleanLiteral(true)] : []);
        } else {
          jsxTag = t.identifier(tagName);
        }
        if (children.length > 0) {
          const multiple = children.length > 1;
          if (isCompatTag) {
            jsx = template.expression(`
                            ${multiple ? path.state.jsxsVarName : path.state.jsxVarName}(%%TAG%%, ${attrsStr ? `() => ({ ${attrsStr}})` : "undefined"}, () => %%CHILDREN%%)
                        `)({
              CHILDREN: multiple ? t.arrayExpression(children) : children[0],
              TAG: jsxTag,
            });
          } else {
            jsx = template.expression(`
                            ${multiple ? path.state.jsxsVarName : path.state.jsxVarName}(%%TAG%%, ${attrsStr || children.length ? `() => ({ ${attrsStr ? attrsStr + "," : ""} get children() { return %%CHILDREN%% } })` : ""})
                        `)({
              CHILDREN: multiple ? t.arrayExpression(children) : children[0],
              TAG: jsxTag,
            });
          }
        } else {
          jsx = template.expression(`
                        ${path.state.jsxVarName}(%%TAG%%${attrsStr ? `,() => ({${attrsStr}})` : ""})
                    `)({
            TAG: jsxTag,
          });
        }

        path.replaceWith(jsx);
      },
    },
  };
};

const buildJSXMemberExpressionTagName = (
  name: babelCore.NodePath<T.JSXMemberExpression>
) => {
  const arr: string[] = [];
  let path: babelCore.NodePath<T.JSXMemberExpression | T.JSXIdentifier> = name;
  while (true) {
    arr.push(path.get("property").node.name);
    const objectNode = path.get("object").node;
    if (objectNode.type === "JSXMemberExpression") {
      path = path.get("object");
    } else if (objectNode.type === "JSXIdentifier") {
      arr.push(objectNode.name);
      break;
    }
  }
  return arr.reverse().join(".");
};

const addTemplate = (
  path: babelCore.NodePath<T.JSXElement>,
  templateContent: string
) => {
  const { types: t, template } = babelCore;

  const programPath = path.find((p) =>
    p.isProgram()
  ) as babelCore.NodePath<T.Program>;

  const lastTemplateVariableIndex = programPath.node.body.findLastIndex(
    (i) =>
      i.type === "VariableDeclaration" &&
      i.declarations[0]?.id.type === "Identifier" &&
      i.declarations[0].id.name.startsWith("__tmpl")
  );

  const lastImportIndex = programPath.node.body.findLastIndex(
    (i) => i.type === "ImportDeclaration"
  );

  const lastIndex =
    lastTemplateVariableIndex === -1
      ? lastImportIndex === -1
        ? 0
        : lastImportIndex
      : lastTemplateVariableIndex;

  path.state.templateCount = (path.state.templateCount ?? 0) + 1;

  const existTemplateCount = path.state.templateMap?.[templateContent];

  const isExist = existTemplateCount != undefined;

  if (!isExist) {
    path.state.templateMap = {
      ...path.state.templateMap,
      [templateContent]: path.state.templateCount,
    };
  }

  const templateStatement = isExist
    ? (template.statement(
        `const __tmpl${path.state.templateCount} = __tmpl${existTemplateCount}`
      )() as T.VariableDeclaration)
    : (template.statement(
        `const __tmpl${path.state.templateCount} = ${path.state.templateVarName}(${templateContent})`
      )() as T.VariableDeclaration);

  if (lastIndex === -1) {
    programPath.node.body.unshift(templateStatement);
  } else {
    programPath.node.body.splice(lastIndex + 1, 0, templateStatement);
  }

  return templateStatement.declarations[0]?.id as T.Identifier;
};
