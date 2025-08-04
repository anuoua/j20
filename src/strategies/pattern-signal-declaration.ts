import * as babelCore from "@babel/core";
import { isSignal } from "../utils/is-signal";
import { hasSignalInPattern } from "../utils/has-signal-in-pattern";
import { isCustomHook } from "../utils/is-custom-hook";
import type { types as Types } from "@babel/core";
import type { Config, GlobalState } from "../types";

const { types: t, template } = babelCore;

const buildPatternToMemberExpressionWithInit = template.expression(`
  (%%OBJECT%%[%%PROPERTY%%] ?? %%INIT%%)
`);

const buildPatternToMemberExpression = template.expression(`
  %%OBJECT%%[%%PROPERTY%%]
`);

const buildPatternToRestExpression = template.expression(`
  %%OBJECT%%.slice(%%PROPERTY%%)
`);

export const patternSignalDeclaration = (
  babel: typeof babelCore,
  config: Config,
  globalState: GlobalState
): babelCore.Visitor => {
  const buildComputedAssignment = template.expression(`
    ${config.computed}(() => %%EXPR%%)
  `);

  const buildFakeComputedAssignment = babel.template.expression(`
    { get value() { return %%EXPR%% } }
  `);

  return {
    ArrowFunctionExpression(path) {
      if (!path.parentPath.isVariableDeclarator()) return;
      if (
        !(
          t.isIdentifier(path.parentPath.node.id) &&
          isCustomHook(path.parentPath.node.id.name)
        )
      ) {
        return;
      }
      path.node.params.forEach((param, index) => {
        if (!(t.isObjectPattern(param) || t.isArrayPattern(param))) return;
        if (!hasSignalInPattern(param)) return;

        const varName = `$__${globalState.createVarCount++}`;

        path.node.params[index] = t.identifier(varName);

        buildPattern(param, varName, "const", (exp: Types.Statement) => {
          if (t.isExpression(path.node.body)) {
            path.node.body = t.blockStatement([
              exp,
              t.expressionStatement(path.node.body),
            ]);
          } else if (t.isBlockStatement(path.node.body)) {
            path.node.body.body.unshift(exp);
          }
        });
      });
    },

    FunctionDeclaration(path) {
      if (!t.isIdentifier(path.node.id)) return;
      path.node.params.forEach((param, index) => {
        if (!(t.isObjectPattern(param) || t.isArrayPattern(param))) return;
        if (!hasSignalInPattern(param)) return;

        const varName = `$__${globalState.createVarCount++}`;

        path.node.params[index] = t.identifier(varName);

        buildPattern(param, varName, "const", (exp: Types.Statement) => {
          path.node.body.body.unshift(exp);
        });
      });
    },

    VariableDeclaration(path) {
      const { node } = path;

      node.declarations.forEach((declearation) => {
        if (
          t.isObjectPattern(declearation.id) ||
          t.isArrayPattern(declearation.id)
        ) {
          if (node.kind === "let" || node.kind === "const") {
            if (hasSignalInPattern(declearation.id)) {
              const declearationId = declearation.id;

              const varName = `$__${globalState.createVarCount++}`;

              declearation.id = t.identifier(varName);

              const isCustomHookName = declearation.init && declearation.init.type === "CallExpression" && declearation.init.callee.type === "Identifier" && isCustomHook(declearation.init.callee.name)

              declearation.init = isCustomHookName ? buildFakeComputedAssignment({
                EXPR: declearation.init,
              }) : buildComputedAssignment({
                EXPR: declearation.init,
              });

              buildPattern(
                declearationId,
                varName,
                node.kind,
                (exp: Types.Expression | Types.Statement) => {
                  path.insertAfter(exp);
                }
              );
            }
          }
        }
      });
    },
  };
};

const buildPattern = (
  pattern: Types.ObjectPattern | Types.ArrayPattern,
  object: string | Types.Expression,
  kind: "let" | "const",
  insertHandler: (exp: Types.Statement) => void
) => {
  switch (pattern.type) {
    case "ObjectPattern": {
      const omitKeys: string[] = [];
      pattern.properties.forEach((property) => {
        if (t.isObjectProperty(property)) {
          if (t.isIdentifier(property.key)) omitKeys.push(property.key.name);
          switch (property.value.type) {
            case "Identifier": {
              const expression = buildPatternToMemberExpression({
                OBJECT: object,
                PROPERTY: `"${(property.key as Types.Identifier).name}"`,
              });

              const insertNode = template.statement(`
                ${kind} %%VAR_NAME%% = %%INIT%%
              `)({
                VAR_NAME: property.value.name,
                INIT: expression,
              });

              insertHandler(insertNode);
              break;
            }
            case "AssignmentPattern": {
              if (t.isIdentifier(property.value.left)) {
                const expression = buildPatternToMemberExpressionWithInit({
                  OBJECT: object,
                  PROPERTY: `"${(property.value.left as Types.Identifier).name
                    }"`,
                  INIT: property.value.right,
                });

                const insertNode = template.statement(`
                  ${kind} %%VAR_NAME%% = %%INIT%%
                `)({
                  VAR_NAME: (property.value.left as Types.Identifier).name,
                  INIT: expression,
                });

                insertHandler(insertNode);
              } else if (
                t.isArrayPattern(property.value.left) ||
                t.isObjectPattern(property.value.left)
              ) {
                const expression = buildPatternToMemberExpressionWithInit({
                  OBJECT: object,
                  PROPERTY: `"${(property.key as Types.Identifier).name}"`,
                  INIT: property.value.right,
                });
                buildPattern(
                  property.value.left,
                  expression,
                  kind,
                  insertHandler
                );
              }
              break;
            }
            case "ArrayPattern":
            case "ObjectPattern": {
              const expression = buildPatternToMemberExpression({
                OBJECT: object,
                PROPERTY: `"${(property.key as Types.Identifier).name}"`,
              });
              buildPattern(property.value, expression, kind, insertHandler);
              break;
            }
          }
        } else if (t.isRestElement(property)) {
          if (t.isIdentifier(property.argument)) {
            const expression = object;

            const insertNode = template.statement(`
              ${kind} %%VAR_NAME%% = (() => {
                const { ${omitKeys
                .map((key, index) =>
                  isSignal(key) ? `${key}: __${index}` : key
                )
                .join(",")}, ...__${omitKeys.length} } = %%INIT%%;
                return __${omitKeys.length};
              })()
            `)({
                  VAR_NAME: property.argument.name,
                  INIT: expression,
                });

            insertHandler(insertNode);
          }
        }
      });
      break;
    }
    case "ArrayPattern": {
      pattern.elements.forEach((element, elementIndex) => {
        if (element === null) return;

        switch (element.type) {
          case "Identifier": {
            const expression = buildPatternToMemberExpression({
              OBJECT: object,
              PROPERTY: `"${elementIndex}"`,
            });

            const insertNode = template.statement(`
              ${kind} %%VAR_NAME%% = %%INIT%%
            `)({
              VAR_NAME: element.name,
              INIT: expression,
            });

            insertHandler(insertNode);
            break;
          }
          case "AssignmentPattern": {
            const expression = buildPatternToMemberExpressionWithInit({
              OBJECT: object,
              PROPERTY: `"${elementIndex}"`,
              INIT: element.right,
            });

            const insertNode = template.statement(`
              ${kind} %%VAR_NAME%% = %%INIT%%
            `)({
              VAR_NAME: (element.left as Types.Identifier).name,
              INIT: expression,
            });

            insertHandler(insertNode);
            break;
          }
          case "RestElement": {
            const expression = buildPatternToRestExpression({
              OBJECT: object,
              PROPERTY: `${elementIndex}`,
            });
            const insertNode = template.statement(`
              ${kind} %%VAR_NAME%% = %%INIT%%
            `)({
              VAR_NAME: (element.argument as Types.Identifier).name,
              INIT: expression,
            });
            insertHandler(insertNode);
            break;
          }
          case "ArrayPattern":
          case "ObjectPattern": {
            const expression = buildPatternToMemberExpression({
              OBJECT: object,
              PROPERTY: `"${elementIndex}"`,
            });
            buildPattern(element, expression, kind, insertHandler);
            break;
          }
        }
      });
      break;
    }
  }
};
