import * as babelCore from "@babel/core";
import { addNamed } from "@babel/helper-module-imports";
import type { Config, PluginState } from "../types";

export const autoImport = (
  _babel: typeof babelCore,
  config: Config
): babelCore.Visitor => {
  return {
    Program(path) {
      const ensure = (name: string): string => {
        if (path.scope.getBinding(name)) return name;
        return addNamed(path, name, config.importSource, { nameHint: name }).name;
      };

      const state: PluginState = {
        jsxVarName: ensure("jsx"),
        jsxsVarName: ensure("jsxs"),
        fragmentVarName: ensure("Fragment"),
        templateVarName: ensure("template"),
        templateCount: 0,
        templateMap: {},
      };

      path.state = state;
    },
  };
};
