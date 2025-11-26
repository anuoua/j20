import { signalCompilerRollup } from "signal-compiler/rollup";
import { j20JsxTransformRollup } from "@j20org/jsx-transform/rollup";

export function j20({ include = "src/**/*.{js,jsx,ts,tsx}" } = {}) {
  return [
    {
      name: "j20",
      config: () => {
        return {
          esbuild: {
            jsx: "preserve",
          },
        };
      },
    },
    signalCompilerRollup({
      include,
      config: {
        importSource: "j20",
      },
    }),
    j20JsxTransformRollup({
      include,
      config: {
        importSource: "j20",
      },
    }),
  ];
}
