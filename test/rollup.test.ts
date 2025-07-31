import { describe, it, expect } from "vitest";
import type { InputOptions, OutputOptions } from "rollup";
import { rollup } from "rollup";
import { signalCompilerRollup } from "../src/rollup";

describe("test", () => {
  it("transform", async () => {
    const inputOptions: InputOptions = {
      input: "./test/code.js",
      plugins: [
        signalCompilerRollup({}),
      ],
    //   external: ["test", "test2"],
    };
    const outputOptions: OutputOptions = {
      file: "bundle.js",
      format: "esm",
    };

    const bundle = await rollup(inputOptions);

    const { output } = await bundle.generate(outputOptions);

    for (let chunk of output) {
      // @ts-ignore
      expect(chunk.code).toMatchSnapshot();
    }
  });
});