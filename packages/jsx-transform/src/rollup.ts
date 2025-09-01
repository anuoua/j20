import type { Plugin } from "rollup";
import * as babelCore from "@babel/core";
import { createFilter } from "@rollup/pluginutils";
import type { FilterPattern } from "@rollup/pluginutils";
import { j20JsxTransform } from ".";
import { Config } from "./types";

export interface Options {
  include?: FilterPattern;
  exclude?: FilterPattern;
  sourcemap?: boolean;
  config?: Config;
}

export function j20JsxTransformRollup(options: Options): Plugin {
  const { include, exclude, sourcemap = true } = options;

  const idFilter = createFilter(include, exclude);

  return {
    name: "jsx-transform",
    transform(code, id: string) {
      if (!idFilter(id)) return;

      const result = babelCore.transform(code, {
        plugins: [
          ["@babel/plugin-syntax-jsx"],
          [j20JsxTransform, { ...options.config }],
        ],
      });

      return {
        code: result?.code ?? "",
        map: sourcemap ? result?.map : null,
      };
    },
  };
}
