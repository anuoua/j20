import * as babelCore from "@babel/core";
import type { types as T, NodePath } from "@babel/core";
import type { PluginState } from "../types";
import { getState } from "../utils/state";
import { isConflictSvgTag, isSvgTagName } from "../utils/svg";

const { types: t } = babelCore;

/**
 * A lowercase-leading tag name is a DOM ("compat") tag; everything else
 * (capitalised identifier, member expression, the synthetic fragment tag) is
 * treated as a component.
 */
const isDomTagName = (name: string): boolean => /^[a-z]/.test(name);

const jsxMemberToExpression = (
  node: T.JSXMemberExpression | T.JSXIdentifier
): T.Expression => {
  if (node.type === "JSXIdentifier") return t.identifier(node.name);
  return t.memberExpression(
    jsxMemberToExpression(node.object),
    t.identifier(node.property.name),
    false
  );
};

const hasSvgAncestor = (path: NodePath<T.JSXElement>): boolean => {
  let parent: NodePath | null = path.parentPath;
  while (parent) {
    if (parent.isJSXElement()) {
      const name = parent.node.openingElement.name;
      if (name.type === "JSXIdentifier" && name.name === "svg") return true;
    }
    parent = parent.parentPath;
  }
  return false;
};

const getter = (key: string, value: T.Expression): T.ObjectMethod =>
  t.objectMethod(
    "get",
    t.identifier(key),
    [],
    t.blockStatement([t.returnStatement(value)])
  );

type PrimitiveAttr = { key: string; value: string | number | boolean };

const formatStaticAttrs = (attrs: PrimitiveAttr[]): string => {
  if (attrs.length === 0) return "";
  return (
    " " +
    attrs
      .map((a) =>
        typeof a.value === "boolean" ? a.key : `${a.key}="${a.value}"`
      )
      .join(" ")
  );
};

const collectChildren = (
  path: NodePath<T.JSXElement>,
  isDom: boolean
): T.Expression[] => {
  const children: T.Expression[] = [];
  for (const childPath of path.get("children")) {
    const node = childPath.node;
    switch (node.type) {
      case "JSXText": {
        const text = node.value.replace(/\n\s*/g, "");
        if (text) children.push(t.stringLiteral(text));
        break;
      }
      case "JSXExpressionContainer": {
        const expr = node.expression;
        if (expr.type === "JSXEmptyExpression") break;
        if (
          expr.type === "StringLiteral" ||
          expr.type === "NumericLiteral"
        ) {
          children.push(expr);
        } else if (isDom) {
          // wrap reactive expression so the runtime can track it
          children.push(t.arrowFunctionExpression([], expr));
        } else {
          children.push(expr);
        }
        break;
      }
      case "JSXSpreadChild": {
        children.push(
          t.spreadElement(node.expression) as unknown as T.Expression
        );
        break;
      }
      default:
        // nested JSX elements have already been replaced by their call
        // expression by the time the parent's exit runs (bottom-up).
        children.push(node as T.Expression);
    }
  }
  return children;
};

const childrenValue = (children: T.Expression[]): T.Expression =>
  children.length > 1 ? t.arrayExpression(children) : children[0]!;

interface CallParts {
  isDom: boolean;
  tagExpr: T.Expression;
  members: (T.ObjectMethod | T.SpreadElement)[];
  children: T.Expression[];
}

const buildCall = (
  callee: T.Identifier,
  { isDom, tagExpr, members, children }: CallParts
): T.CallExpression => {
  const hasAttrs = members.length > 0;
  const propsArrow = (extra: T.ObjectMethod[]): T.Expression =>
    t.arrowFunctionExpression([], t.objectExpression([...members, ...extra]));

  // DOM node: children are the 3rd argument.
  if (isDom) {
    if (children.length > 0) {
      return t.callExpression(callee, [
        tagExpr,
        hasAttrs ? propsArrow([]) : t.identifier("undefined"),
        t.arrowFunctionExpression([], childrenValue(children)),
      ]);
    }
    return hasAttrs
      ? t.callExpression(callee, [tagExpr, propsArrow([])])
      : t.callExpression(callee, [tagExpr]);
  }

  // Component: children live as a `children` getter inside props.
  if (children.length > 0) {
    return t.callExpression(callee, [
      tagExpr,
      propsArrow([getter("children", childrenValue(children))]),
    ]);
  }
  return hasAttrs
    ? t.callExpression(callee, [tagExpr, propsArrow([])])
    : t.callExpression(callee, [tagExpr]);
};

const isTemplateDecl = (stmt: T.Statement): boolean => {
  if (stmt.type !== "VariableDeclaration") return false;
  const id = stmt.declarations[0]?.id;
  return !!id && id.type === "Identifier" && id.name.startsWith("__tmpl");
};

const addTemplate = (
  path: NodePath<T.JSXElement>,
  state: PluginState,
  content: string
): T.Identifier => {
  const programPath = path.find((p) => p.isProgram()) as
    | NodePath<T.Program>
    | null;
  if (!programPath) throw new Error("program node not found");

  state.templateCount += 1;
  const n = state.templateCount;

  const existing = state.templateMap[content];
  const isAlias = existing !== undefined;
  if (!isAlias) state.templateMap[content] = n;

  const init: T.Expression = isAlias
    ? t.identifier(`__tmpl${existing}`)
    : t.callExpression(t.identifier(state.templateVarName), [
        t.templateLiteral(
          [t.templateElement({ raw: content, cooked: content }, true)],
          []
        ),
      ]);

  const decl = t.variableDeclaration("const", [
    t.variableDeclarator(t.identifier(`__tmpl${n}`), init),
  ]);

  const body = programPath.node.body;
  const lastTemplate = body.findLastIndex(isTemplateDecl);
  const lastImport = body.findLastIndex(
    (s) => s.type === "ImportDeclaration"
  );
  body.splice(Math.max(lastTemplate, lastImport) + 1, 0, decl);

  return t.identifier(`__tmpl${n}`);
};

export const jsxTransform = (): babelCore.Visitor => {
  return {
    JSXFragment: {
      enter(path) {
        const { fragmentVarName } = getState(path);
        const tag = t.jsxIdentifier(fragmentVarName);
        path.replaceWith(
          t.jsxElement(
            t.jsxOpeningElement(tag, [], false),
            t.jsxClosingElement(tag),
            path.node.children,
            false
          )
        );
      },
    },

    JSXElement: {
      exit(path) {
        const state = getState(path);
        const nameNode = path.node.openingElement.name;

        let isDom: boolean;
        let tagExpr: T.Expression;
        let tagName = "";

        switch (nameNode.type) {
          case "JSXIdentifier":
            isDom = isDomTagName(nameNode.name);
            tagName = nameNode.name;
            tagExpr = t.identifier(nameNode.name);
            break;
          case "JSXMemberExpression":
            isDom = false;
            tagExpr = jsxMemberToExpression(nameNode);
            break;
          default:
            throw new Error("JSXNamespacedName is not supported");
        }

        const children = collectChildren(path, isDom);

        const primitiveAttrs: PrimitiveAttr[] = [];
        const members: (T.ObjectMethod | T.SpreadElement)[] = [];

        for (const attrPath of path.get("openingElement").get("attributes")) {
          const attr = attrPath.node;
          switch (attr.type) {
            case "JSXAttribute": {
              if (attr.name.type !== "JSXIdentifier") {
                throw new Error(
                  "JSX attribute names with namespaces are not supported"
                );
              }
              const key = attr.name.name;
              const raw = attr.value;
              if (!raw) {
                if (isDom) {
                  primitiveAttrs.push({ key, value: true });
                } else {
                  members.push(getter(key, t.booleanLiteral(true)));
                }
                break;
              }
              const value: T.Expression | T.JSXEmptyExpression =
                raw.type === "JSXExpressionContainer" ? raw.expression : raw;
              if (value.type === "JSXEmptyExpression") break;
              if (
                isDom &&
                (value.type === "StringLiteral" ||
                  value.type === "NumericLiteral")
              ) {
                primitiveAttrs.push({ key, value: value.value });
              } else {
                members.push(getter(key, value as T.Expression));
              }
              break;
            }
            case "JSXSpreadAttribute":
              members.push(t.spreadElement(attr.argument));
              break;
            default:
              break;
          }
        }

        let isSvg = false;
        if (nameNode.type === "JSXIdentifier") {
          if (isSvgTagName(nameNode.name)) {
            isSvg = true;
          } else if (
            isConflictSvgTag(nameNode.name) &&
            hasSvgAncestor(path)
          ) {
            isSvg = true;
          }
        }

        if (isDom) {
          const content = `<${tagName}${formatStaticAttrs(primitiveAttrs)}>`;
          tagExpr = t.callExpression(
            addTemplate(path, state, content),
            isSvg ? [t.booleanLiteral(true)] : []
          );
        }

        const callee = t.identifier(
          children.length > 1 ? state.jsxsVarName : state.jsxVarName
        );

        path.replaceWith(
          buildCall(callee, { isDom, tagExpr, members, children })
        );
      },
    },
  };
};
