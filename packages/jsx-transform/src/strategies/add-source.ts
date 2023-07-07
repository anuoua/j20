import * as babelCore from "@babel/core";
import { addNamed } from "@babel/helper-module-imports";
import type { Config } from "../types";

export const autoImport = (
  babel: typeof babelCore,
  config: Config
): babelCore.Visitor => {
  const { types: t, template } = babel;

  return {
    Program(path) {
      path.state = {};

      if (!path.scope.getBinding("jsx")) {
        const id = addNamed(path, "jsx", config.importSource, {
          nameHint: "jsx",
        });
        path.state.jsxVarName = id.name;
      } else {
        path.state.jsxVarName = "jsx";
      }

      if (!path.scope.getBinding("jsxs")) {
        const id = addNamed(path, "jsxs", config.importSource, {
          nameHint: "jsxs",
        });
        path.state.jsxsVarName = id.name;
      } else {
        path.state.jsxsVarName = "jsxs";
      }

      if (!path.scope.getBinding("Fragment")) {
        const id = addNamed(path, "Fragment", config.importSource, {
          nameHint: "Fragment",
        });
        path.state.fragmentVarName = id.name;
      } else {
        path.state.fragmentVarName = "Fragment";
      }

      if (!path.scope.getBinding("template")) {
        const id = addNamed(path, "template", config.importSource, {
          nameHint: "template",
        });
        path.state.templateVarName = id.name;
      } else {
        path.state.templateVarName = "template";
      }
    },
  };
};
