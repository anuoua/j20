import { expect, it } from "vitest";
import { j20JsxTransformRollup } from "../src/rollup";

const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const b64: Record<string, number> = {};
for (let i = 0; i < B64.length; i++) b64[B64[i]] = i;

const decodeVlq = (input: string, from: number): [number, number] => {
  let shift = 0;
  let result = 0;
  let pos = from;
  let continuation: boolean;
  do {
    const digit = b64[input[pos++]!];
    continuation = (digit & 32) !== 0;
    result += (digit & 31) << shift;
    shift += 5;
  } while (continuation);
  const negate = (result & 1) !== 0;
  result >>= 1;
  return [negate ? -result : result, pos];
};

/** Returns the 1-indexed original (source) lines referenced by a sourcemap. */
const originalSourceLines = (mappings: string): Set<number> => {
  const lines = new Set<number>();
  let srcIdx = 0;
  let srcLine = 0;
  let srcCol = 0;
  let nameIdx = 0;

  for (const lineStr of mappings.split(";")) {
    if (lineStr.length === 0) continue;
    for (const segStr of lineStr.split(",")) {
      if (segStr.length === 0) continue;
      let pos = 0;
      const fields: number[] = [];
      while (pos < segStr.length) {
        let value: number;
        [value, pos] = decodeVlq(segStr, pos);
        fields.push(value);
      }
      if (fields.length >= 4) {
        srcIdx += fields[1]!;
        srcLine += fields[2]!;
        srcCol += fields[3]!;
        if (fields.length >= 5) nameIdx += fields[4]!;
        lines.add(srcLine + 1);
      }
    }
  }
  void srcIdx;
  void srcCol;
  void nameIdx;
  return lines;
};

// 复现「<For> children 是函数」的 sourcemap 漂移：<For> 的 JSX 密集区必须被
// rollup 插件产出的 map 覆盖。回归前 transform 返回 map:null，rollup 会沿用
// 上游旧 map，最终 bundle 的该区域行号完全错位。
const source = [
  "import { For } from \"source\";", // 1
  "export const App = () => {", // 2
  "  const $items = [1, 2, 3];", // 3
  "  return (", // 4
  "    <For of={$items}>", // 5
  "      {($item) => (", // 6 <- children 函数
  "        <Item", // 7
  "          text={$item}", // 8 <- 函数体内的 JSX 属性
  "        />", // 9
  "      )}", // 10
  "    </For>", // 11
  "  );", // 12
  "};", // 13
].join("\n");

const plugin = j20JsxTransformRollup({
  include: ["**/*.tsx"],
  config: { importSource: "source" },
});

it("rollup transform returns a sourcemap (not null)", () => {
  const result = plugin.transform!(source, "input.tsx") as {
    code: string;
    map: object | null;
  };
  expect(result.map).not.toBeNull();
});

it("maps the <For> children function region to the correct source lines", () => {
  const result = plugin.transform!(source, "input.tsx") as {
    code: string;
    map: { mappings: string } | null;
  };
  expect(result.map).not.toBeNull();

  // children 函数（第 6 行 `{($item) => (`）和函数体内的 JSX 属性表达式
  // （第 8 行 `text={$item}`）必须能在 map 中被引用到。回归前 map 为 null，
  // rollup 沿用上游旧 map，这些行全部漂移/丢失。
  const lines = originalSourceLines(result.map!.mappings);
  const missing = [6, 8].filter((l) => !lines.has(l));
  expect(missing, `lines ${missing.join(", ")} not referenced in sourcemap`).toEqual([]);
});
