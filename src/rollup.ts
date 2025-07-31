import type { Plugin } from "rollup";
import * as babelCore from "@babel/core";
import { createFilter } from "@rollup/pluginutils";
import type { FilterPattern } from "@rollup/pluginutils";
import { signalCompiler } from ".";

export interface ReassignOptions {
  include?: FilterPattern;
  exclude?: FilterPattern;
  sourcemap?: boolean;
}

export function signalCompilerRollup(options: ReassignOptions): Plugin {
  const { include, exclude, sourcemap = true } = options;

  const idFilter = createFilter(include, exclude);

  return {
    name: "signal-compiler",
    transform(code, id: string) {
      if (!idFilter(id)) return;

      const result = babelCore.transform(code, {
        presets: [["@babel/preset-react", {}]],
        plugins: [[
            signalCompiler,
            {
              state: "signal",
              computed: "computed",
              polyfill: false,
              identifierSignalDeclaration: true,
              patternSignalDeclaration: true,
              identifierSignalRead: true,
              functionAutoSignal: true,
              jsxAutoSignal: true,
            },
          ],],
      });

      return {
        code: result?.code ?? "",
        map: sourcemap ? result?.map : null,
      };
    },
  };
}