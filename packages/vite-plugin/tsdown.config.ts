import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/index.ts"],
  outDir: "dist",
  skipNodeModulesBundle: true,
  external: ["signal-compiler/rollup", "@j20org/jsx-transform/rollup"],
  dts: true,
});
