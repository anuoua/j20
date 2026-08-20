import type { Plugin } from "rollup";
import type { FilterPattern } from "@rollup/pluginutils";
import type { Config } from ".";
import * as babelCore from "@babel/core";
import { createFilter } from "@rollup/pluginutils";
import { j20JsxTransform } from "./index";

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
        // 必须开启 sourcemap，否则 transform 返回 map:null，rollup 会沿用
        // 上游（oxc/esbuild）的旧 map —— 旧 map 对应的是未经 JSX 转换的代码，
        // 行号错位，最终 bundle 的 sourcemap 就会漂移（<For> 等 JSX 密集区尤甚）。
        sourceMaps: true,
        filename: id,
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
