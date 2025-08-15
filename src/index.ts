// @ts-ignore
import jsx from "@babel/plugin-syntax-jsx";
import * as babelCore from "@babel/core";
import { identifierSignalDeclaration } from "./strategies/identifier-signal-declaration";
import { identifierSignalRead } from "./strategies/identifier-signal-read";
import { composeVisitors } from "./utils/compose-visitors";
import type { PluginObj } from "@babel/core";
import type { Config, GlobalState } from "./types";
import { patternSignalDeclaration } from "./strategies/pattern-signal-declaration";
import { functionAutoSignal } from "./strategies/function-auto-signal";
import { jsxTransform } from "./strategies/jsx-transform";
import { identifierSignalAssign } from "./strategies/identifier-signal-assign";
import { autoImport } from "./strategies/add-source";

const defaultConfig: Config = {
  autoImport: true,
  importSource: "j20",
  identifierSignalDeclaration: true,
  patternSignalDeclaration: true,
  identifierSignalRead: true,
  functionAutoSignal: true,
  jsxTransform: true,
  identifierSignalAssign: true,
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
    config.identifierSignalAssign ? identifierSignalAssign(babel) : null,
    config.autoImport ? autoImport(babel, config) : null,
    config.jsxTransform ? jsxTransform() : null,
  ].filter((i) => i) as babelCore.Visitor[];

  return {
    name: "signal-compiler",
    inherits: jsx,
    visitor: composeVisitors(strategies),
  };
};
