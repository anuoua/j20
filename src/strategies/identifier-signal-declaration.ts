import * as babelCore from "@babel/core";
import { isSignal } from "../utils/is-signal";
import { autoImport } from "../utils/auto-import";
import type { Config, GlobalState } from "../types";
import { isCustomHook } from "../utils/is-custom-hook";

export const identifierSignalDeclaration = (
  babel: typeof babelCore,
  config: Config,
  globalState: GlobalState
): babelCore.Visitor => {
  const buildStateAssignment = babel.template.expression(`
    ${config.state}(%%EXPR%%)
  `);

  const buildComputedAssignment = babel.template.expression(`
    ${config.computed}(() => %%EXPR%%)
  `);

  const buildFakeComputedAssignment = babel.template.expression(`
    { get value() { return %%EXPR%% } }
  `);

  const buildImportSignal = babel.template.statement(`
    import { Signal } from 'signal-polyfill'
  `);

  const { types: t } = babel;

  return {
    VariableDeclaration(path) {
      const { node } = path;

      autoImport(path, config, globalState);

      node.declarations.forEach((declearation) => {
        if (t.isIdentifier(declearation.id)) {
          const confirmSignalToTransform = isSignal(declearation.id.name);
          // const confirmSignalToTransform =
          //   isSignal(declearation.id.name) ||
          //   (isCustomHook(declearation.id.name) &&
          //     declearation.init?.type &&
          //     declearation.init.type !== "ArrowFunctionExpression" &&
          //     declearation.init.type !== "FunctionExpression");

          if (node.kind === "let" && confirmSignalToTransform) {
            declearation.init = buildStateAssignment({
              EXPR: declearation.init,
            });
          } else if (node.kind === "const" && confirmSignalToTransform) {
            const isCustomHookName = declearation.init && declearation.init.type === "CallExpression" && declearation.init.callee.type === "Identifier" && isCustomHook(declearation.init.callee.name)
            declearation.init = isCustomHookName ? buildFakeComputedAssignment({
              EXPR: declearation.init,
            }) : buildComputedAssignment({
              EXPR: declearation.init,
            });
          }
        }
      });
    },
  };
};
