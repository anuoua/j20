// @ts-ignore
import jsx from "@babel/plugin-syntax-jsx";
import * as babelCore from "@babel/core";
import { composeVisitors } from "./utils/compose-visitors";
import type { PluginObj } from "@babel/core";
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
  config = {
    ...defaultConfig,
    ...config,
  };

  const strategies = [
    config.autoImport ? autoImport(babel, config) : null,
    jsxTransform(),
  ].filter((i) => i) as babelCore.Visitor[];

  return {
    name: "signal-compiler",
    inherits: jsx,
    visitor: composeVisitors(strategies),
  };
};
