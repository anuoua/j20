import { signalCompilerRollup } from "signal-compiler/rollup";
import { j20JsxTransformRollup } from "@j20org/jsx-transform/rollup";
import { type PluginOption } from "vite";

export function j20({
  include = "src/**/*.{js,jsx,ts,tsx}",
}: {
  include?: string | string[];
} = {}): any {
  return [
    {
      name: "j20",
      config: () => {
        return {
          oxc: {
            jsx: "preserve"
          },
        };
      },
    } satisfies PluginOption,
    // JSX 转换必须先于 signal-compiler 执行：jsx-transform 要为行内组件
    // （render prop）附加 @signal-component 注释标记，signal-compiler 才能识别。
    j20JsxTransformRollup({
      include,
      config: {
        importSource: "j20",
      },
    }) as PluginOption,
    signalCompilerRollup({
      include,
      config: {
        importSource: "j20",
      },
    }) as PluginOption,
  ];
}
