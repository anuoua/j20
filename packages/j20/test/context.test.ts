import { it, beforeEach, describe, expect } from "vitest";
import { createContext } from "../src/api/context";
import { instanceCreate } from "../src/h/instance";
import { createElement } from "../src/h/createElement";

const { body } = document;

beforeEach(() => {
  body.innerHTML = "";
});

describe("Context", () => {
  it("Consumer inside a Provider should receive the provider's value", () => {
    const Theme = createContext("light");

    const captured: any[] = [];

    const [, fragment] = instanceCreate(() => {
      return createElement(
        Theme as any,
        () => ({
          value: "dark",
          get children() {
            return createElement(
              (Theme as any).Consumer as any,
              () => ({
                get children() {
                  return () => (val: any) => {
                    captured.push(val?.value ?? val);
                    const div = document.createElement("div");
                    div.textContent = "theme=" + (val?.value ?? val);
                    return div;
                  };
                },
              }),
              undefined
            );
          },
        }),
        undefined
      );
    });

    body.appendChild(fragment);

    expect(captured).toEqual(["dark"]);
  });

  it("should find the nearest matching provider among multiple different providers", () => {
    const CtxA = createContext("defaultA");
    const CtxB = createContext("defaultB");

    const capturedB: any[] = [];

    const [, fragment] = instanceCreate(() => {
      return createElement(
        CtxA as any,
        () => ({
          value: "A-value",
          get children() {
            return createElement(
              CtxB as any,
              () => ({
                value: "B-value",
                get children() {
                  return createElement(
                    (CtxB as any).Consumer as any,
                    () => ({
                      get children() {
                        return () => (val: any) => {
                          capturedB.push(val?.value ?? val);
                          return document.createElement("div");
                        };
                      },
                    }),
                    undefined
                  );
                },
              }),
              undefined
            );
          },
        }),
        undefined
      );
    });

    body.appendChild(fragment);

    expect(capturedB).toEqual(["B-value"]);
  });

  it("should return default value when no matching provider exists in the chain", () => {
    const CtxA = createContext("defaultA");
    const CtxB = createContext("defaultB");

    const capturedB: any[] = [];

    const [, fragment] = instanceCreate(() => {
      return createElement(
        CtxA as any,
        () => ({
          value: "A-value",
          get children() {
            return createElement(
              (CtxB as any).Consumer as any,
              () => ({
                get children() {
                  return () => (val: any) => {
                    capturedB.push(val?.value ?? val);
                    return document.createElement("div");
                  };
                },
              }),
              undefined
            );
          },
        }),
        undefined
      );
    });

    body.appendChild(fragment);

    expect(capturedB).toEqual(["defaultB"]);
  });
});
