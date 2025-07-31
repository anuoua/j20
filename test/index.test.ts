import { it, expect } from "vitest";
import { transform } from "@babel/core";
import { signalCompiler } from "../src/index";
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const from = readFileSync(resolve(__dirname, './code.js'), {
  encoding: 'utf-8'
}).toString();

it("compiler", async () => {
  const res2 = transform(from, {
    presets: [["@babel/preset-react", {}]],
    plugins: [
      [
        signalCompiler,
        {
          state: "signal",
          computed: "computed",
          polyfill: false,
          identifierSignalDeclaration: true,
          patternSignalDeclaration: true,
          identifierSignalRead: true,
          functionAutoSignal: true,
          jsxAutoSignal: true,
        },
      ],
    ],
  });

  expect(res2!.code).toMatchSnapshot();
});
