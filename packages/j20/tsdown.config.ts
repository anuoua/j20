import { defineConfig } from "tsdown";

export default defineConfig([
  {
    entry: ["./src/index.ts"],
    noExternal: ["@j20/signal"],
    outDir: "dist",
    skipNodeModulesBundle: true,
  },
  {
    entry: ["./src/jsx-runtime.ts"],
    external: ["./index"],
    outDir: "dist",
    skipNodeModulesBundle: true,
  },
]);
