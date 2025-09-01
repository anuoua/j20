import { expect, it } from "vitest";
import { transform } from "@babel/core";
import { j20JsxTransform } from "../src/index";
import * as fs from "node:fs";
import { resolve } from "node:path";
import { config } from "./config";

const pairs = fs.readdirSync(resolve(__dirname, "./pairs/"));

const trans = (code: string) =>
  transform(code, {
    plugins: [["@babel/plugin-syntax-jsx"], [j20JsxTransform, { ...config }]],
  });

for (const pair of pairs) {
  const source = fs
    .readFileSync(resolve(__dirname, `./pairs/${pair}/source.js`), {
      encoding: "utf-8",
    })
    .toString();

  const dist = fs
    .readFileSync(resolve(__dirname, `./pairs/${pair}/dist.js`), {
      encoding: "utf-8",
    })
    .toString();

  it(`pair: ${pair}`, () => {
    expect(trans(source)!.code).toBe(dist);
  });
}
