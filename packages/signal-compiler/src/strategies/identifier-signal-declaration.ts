import * as babelCore from "@babel/core";
import { isSignal } from "../utils/is-signal";
import type { Config, GlobalState } from "../types";

export const identifierSignalDeclaration = (
  babel: typeof babelCore,
  config: Config,
  globalState: GlobalState
): babelCore.Visitor => {
  const buildStateAssignment = babel.template.expression(`
    %%SIGNAL%%(%%EXPR%%)
  `);

  const buildComputedAssignment = babel.template.expression(`
    %%COMPUTED%%(() => %%EXPR%%)
  `);

  const { types: t } = babel;

  return {
    VariableDeclaration(path) {
      const { node } = path;

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
              SIGNAL: t.identifier(path.state.signalVarName),
              EXPR: declearation.init,
            });
          } else if (node.kind === "const" && confirmSignalToTransform) {
            declearation.init = buildComputedAssignment({
              COMPUTED: t.identifier(path.state.computedVarName),
              EXPR: declearation.init,
            });
          }
        }
      });
    },
  };
};
