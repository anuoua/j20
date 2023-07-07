import { defineConfig } from "tsdown";

export default defineConfig([
  {
    entry: ["./src/index.ts"],
    outDir: "dist",
    skipNodeModulesBundle: true,
    dts: true,
  },
  {
    entry: ["./src/rollup.ts"],
    external: ["."],
    outDir: "dist",
    skipNodeModulesBundle: true,
    dts: true,
  },
]);
