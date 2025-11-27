import { signalCompilerRollup } from "signal-compiler/rollup";
import { j20JsxTransformRollup } from "@j20org/jsx-transform/rollup";
import type { PluginOption } from "vite";

export function j20({
  include = "src/**/*.{js,jsx,ts,tsx}",
} = {}): PluginOption {
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
    }) as PluginOption,
    j20JsxTransformRollup({
      include,
      config: {
        importSource: "j20",
      },
    }) as PluginOption,
  ];
}
