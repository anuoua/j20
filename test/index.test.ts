import { it, expect } from "bun:test";
import { transform } from "@babel/core";
import { signalCompiler } from "../src/index";

const from = `
let $a = 1, $b = 2;
let $c = 1;
let { a: { $ddd: { b: [$bb], c: [,$cc] } = 8, p: $p } = 3 } = {};

const $d = $a + $b;

const { a: [$aaa, ...$rest], b: { he, he2: $he2, $ki, ...$rest2 } } = {}

const $useClip = ({ x: $x, y: $y, ...$rest }) => {}

function $useClip2({ x: $x, y: $y, ...$rest }) {}

const $useClip3 = ($x, $y) => {};

const { k: $k } = $useClip3($a + 1, $b);

const hello = <div style={$k} className="p-1" abc num={1} {...{ ...$a, ...$b }}></div>
`;

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
