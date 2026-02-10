import { defineConfig } from "rollup";
import { dts } from "rollup-plugin-dts";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default defineConfig([
  {
    input: "_dist/index.js",
    output: [
      {
        file: "dist/index.js",
        format: "es",
        sourcemap: true,
      },
    ],
    plugins: [
      nodeResolve(),
    ],
  },
  {
    input: "_dist/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "es", sourcemap: true }],
    plugins: [nodeResolve(),dts()],
  },
  {
    input: "_dist/jsx-runtime.js",
    external: ["./index"],
    output: [
      {
        file: "dist/jsx-runtime.js",
        format: "es",
        sourcemap: true,
      },
    ],
    plugins: [],
  },
  {
    input: "_dist/jsx-runtime.d.ts",
    external: ["./index"],
    output: [{ file: "dist/jsx-runtime.d.ts", format: "es", sourcemap: true }],
    plugins: [dts()],
  }
]);
