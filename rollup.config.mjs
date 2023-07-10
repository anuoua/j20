import dts from "rollup-plugin-dts";
import esbuild from "rollup-plugin-esbuild";
import { defineConfig } from "rollup";
import { nodeResolve } from "@rollup/plugin-node-resolve";

const configGen = (format) => {
  let fileNameMap = {
    cjs: "cjs",
    esm: "mjs",
    umd: "global.js",
  };

  return defineConfig({
    external: "@vue/reactivity",
    input: "src/j20.ts",
    output: [
      {
        name: format === "umd" ? "J20" : undefined,
        dir: "dist",
        entryFileNames: `j20.${fileNameMap[format]}`,
        format,
        sourcemap: true,
      },
    ],
    plugins: [
      nodeResolve(),
      esbuild({
        sourceMap: true,
        target: "esnext",
      }),
    ],
  });
};

const dtsRollup = () =>
  defineConfig({
    input: "build/j20.d.ts",
    output: [{ file: `dist/j20.d.ts`, format: "es" }],
    plugins: [dts()],
  });

const config = [
  configGen("cjs"),
  configGen("esm"),
  configGen("umd"),
  dtsRollup(),
];

export default config;