import { build } from "bun";

build({
  entrypoints: ["./src/index.ts"],
  external: ["@babel/core", "@babel/preset-react"],
  outdir: "dist",
  target: "node",
});
