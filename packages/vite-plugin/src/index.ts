import { signalCompilerRollup } from "signal-compiler/rollup";
import { j20JsxTransformRollup } from "@j20org/jsx-transform/rollup";

export default function j20Preset({
  include = "src/**/*.{js,jsx,ts,tsx}",
} = {}) {
  return [
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
