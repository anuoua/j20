import * as babelCore from "@babel/core";
import jsxSyntax from "@babel/plugin-syntax-jsx";
import type { PluginObj } from "@babel/core";
import { composeVisitors } from "./utils/compose-visitors";
import type { Config } from "./types";
import { jsxTransform } from "./strategies/jsx-transform";
import { autoImport } from "./strategies/add-source";

const defaultConfig: Config = {
  autoImport: true,
  importSource: "j20",
};

export const j20JsxTransform = (
  babel: typeof babelCore,
  config: Config
): PluginObj => {
  config = { ...defaultConfig, ...config };

  const strategies: babelCore.Visitor[] = [
    config.autoImport ? autoImport(babel, config) : null,
    jsxTransform(),
  ].filter((i): i is babelCore.Visitor => i !== null);

  return {
    name: "j20-jsx-transform",
    inherits: jsxSyntax.default,
    visitor: composeVisitors(strategies),
  };
};

export type { Config };
