import * as babelCore from "@babel/core";
import { identifierSignalDeclaration } from "./strategies/identifier-signal-declaration";
import { identifierSignalRead } from "./strategies/identifier-signal-read";
import { composeVisitors } from "./utils/compose-visitors";
import type { PluginObj } from "@babel/core";
import type { Config, GlobalState } from "./types";
import { patternSignalDeclaration } from "./strategies/pattern-signal-declaration";
import { functionAutoSignal } from "./strategies/function-auto-signal";
import { jsxAutoSignal } from "./strategies/jsx-auto-signal";
import { identifierSignalAssign } from "./strategies/identifier-signal-assign";

const defaultConfig: Config = {
  state: "new Signal.State",
  computed: "new Signal.Computed",
  polyfill: true,
  identifierSignalDeclaration: true,
  patternSignalDeclaration: true,
  identifierSignalRead: true,
  functionAutoSignal: true,
  jsxAutoSignal: true,
};

export const signalCompiler = (
  babel: typeof babelCore,
  config: Config
): PluginObj => {
  const globalState: GlobalState = {
    signalImported: false,
    createVarCount: 0,
  };

  config = {
    ...defaultConfig,
    ...config,
  };

  const strategies = [
    config.identifierSignalDeclaration
      ? identifierSignalDeclaration(babel, config, globalState)
      : null,
    config.patternSignalDeclaration
      ? patternSignalDeclaration(babel, config, globalState)
      : null,
    config.identifierSignalRead ? identifierSignalRead(babel) : null,
    config.functionAutoSignal ? functionAutoSignal(babel, config) : null,
    config.jsxAutoSignal ? jsxAutoSignal(babel) : null,
    config.identifierSignalAssign ? identifierSignalAssign(babel) : null,
  ].filter((i) => i) as babelCore.Visitor[];

  return {
    name: "signal-compiler",
    visitor: composeVisitors(...strategies),
  };
};
