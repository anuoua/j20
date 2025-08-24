import { defineConfig } from "vite";
import { signalCompilerRollup } from "signal-compiler/rollup";

export default defineConfig({
  esbuild: {
    jsx: "preserve",
  },
  plugins: [
    signalCompilerRollup({
      include: "src/**/*.{js,jsx,ts,tsx}",
      config: {
        importSource: "j20",
      },
      jsx: {
        importSource: "j20",
      },
    }),
  ],
});
