import type { Plugin } from "rollup";
import * as babelCore from "@babel/core";
import { createFilter } from "@rollup/pluginutils";
import type { FilterPattern } from "@rollup/pluginutils";
import { signalCompiler } from ".";
import { Config } from "./types";
import transformJsxReact from "./transform-jsx-react";

export interface ReassignOptions {
  include?: FilterPattern;
  exclude?: FilterPattern;
  sourcemap?: boolean;
  config: Config
}

export function signalCompilerRollup(options: ReassignOptions): Plugin {
  const { include, exclude, sourcemap = true } = options;

  const idFilter = createFilter(include, exclude);

  return {
    name: "signal-compiler",
    transform(code, id: string) {
      if (!idFilter(id)) return;

      const result = babelCore.transform(code, {
        plugins: [
          ["@babel/plugin-syntax-jsx"],
          [transformJsxReact, {
            runtime: 'automatic'
          }],
          [
            signalCompiler,
            { ...options.config },
          ],
        ],
      });

      return {
        code: result?.code ?? "",
        map: sourcemap ? result?.map : null,
      };
    },
  };
}