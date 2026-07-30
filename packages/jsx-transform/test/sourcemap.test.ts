import { expect, it } from "vitest";
import { transform } from "@babel/core";
import { j20JsxTransform } from "../src/index";

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
  // All fields except the generated column are delta-encoded across the whole
  // mappings string, so their running totals must be maintained continuously.
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
      // field 0 is the generated column; we don't need it here.
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

// Source laid out with user expressions on known lines. Attribute expressions
// (line 3) are the case that used to collapse to the JSX opening under the old
// `generate()` -> `template.expression()` codegen, losing their source position.
const source = [
  "const App = () => {};", // 1
  "const el =", // 2
  "  <App foo={$a} bar={fn}>", // 3 <- reactive attributes
  "    <div>{$child}</div>", // 4 <- reactive child
  "    {$expr}", // 5 <- expression child
  "  </App>;", // 6
].join("\n");

const trans = (code: string) =>
  transform(code, {
    filename: "input.js",
    sourceFileName: "input.js",
    sourceMaps: true,
    plugins: [
      ["@babel/plugin-syntax-jsx"],
      [j20JsxTransform, { importSource: "source" }],
    ],
  })!;

it("preserves source positions for reactive attribute values", () => {
  const result = trans(source);
  const lines = originalSourceLines(result.map!.mappings);

  // Every line that holds a user-written expression must be reachable from the
  // generated sourcemap. Before the direct-AST refactor, line 3 (attributes)
  // mapped to line 2 and was missing here.
  const expected = [3, 4, 5];
  const missing = expected.filter((l) => !lines.has(l));
  expect(missing, `lines ${missing.join(", ")} not referenced in sourcemap`).toEqual([]);
});

it("keeps every mapping within the source's own line range", () => {
  const result = trans(source);
  const lines = originalSourceLines(result.map!.mappings);
  const totalLines = source.split("\n").length;
  for (const line of lines) {
    expect(line).toBeGreaterThanOrEqual(1);
    expect(line).toBeLessThanOrEqual(totalLines);
  }
});
