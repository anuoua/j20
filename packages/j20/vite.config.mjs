import { defineConfig } from "vite";
import { signalCompilerRollup } from "signal-compiler/rollup";

export default defineConfig({
  esbuild: {
    jsx: "preserve",
  },
  plugins: [
    signalCompilerRollup({
      include: "example/**/*.{js,jsx,ts,tsx}",
      config: {
        importSource: "../src",
      },
      jsx: {
        importSource: "../src",
      },
    }),
  ],
});
