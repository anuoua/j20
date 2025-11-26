import { defineConfig } from "rollup";
import { dts } from "rollup-plugin-dts";

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
    plugins: [],
  },
  {
    input: "_dist/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [dts()],
    sourcemap: true,
  },
  {
    input: "_dist/rollup.js",
    output: [
      {
        file: "dist/rollup.js",
        format: "es",
        sourcemap: true,
      },
    ],
    plugins: [],
  },
  {
    input: "_dist/rollup.d.ts",
    output: [{ file: "dist/rollup.d.ts", format: "es" }],
    plugins: [dts()],
    sourcemap: true,
  }
]);
