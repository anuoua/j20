import { it, beforeEach, describe, expect } from "vitest";
import { signal } from "../src/api/signal";
import { instanceCreate } from "../src/h/instance";
import { createElement } from "../src/h/createElement";

const { body } = document;

beforeEach(() => {
  body.innerHTML = "";
});

describe("nodeAttributesEffect granularity", () => {
  it("changing one prop should not re-evaluate unrelated props", () => {
    const $a = signal("a1");
    const $b = signal("b1");
    let aReads = 0;
    let bReads = 0;

    const div = document.createElement("div");

    instanceCreate(() => {
      return createElement(
        div,
        () => ({
          get foo() {
            aReads++;
            return $a.value;
          },
          get bar() {
            bReads++;
            return $b.value;
          },
        }),
        undefined
      );
    });
    body.appendChild(div);

    // Initial render: each getter read once
    expect(aReads).toBe(1);
    expect(bReads).toBe(1);
    expect(div.getAttribute("foo")).toBe("a1");
    expect(div.getAttribute("bar")).toBe("b1");

    // Change only $a
    $a.value = "a2";

    expect(div.getAttribute("foo")).toBe("a2");

    // Per-key effect: only foo's getter is re-read, bar is untouched
    expect(aReads).toBe(2);
    expect(bReads).toBe(1);
  });

  it("changing prop to undefined should remove attribute", () => {
    const $a = signal("a1");

    const div = document.createElement("div");

    instanceCreate(() => {
      return createElement(
        div,
        () => ({
          get foo() {
            return $a.value;
          },
        }),
        undefined
      );
    });
    body.appendChild(div);

    expect(div.getAttribute("foo")).toBe("a1");

    $a.value = undefined as any;
    expect(div.hasAttribute("foo")).toBe(false);
  });

  it("spread props should still update correctly (fallback path)", () => {
    const $extra = signal({ baz: "b1" });

    const div = document.createElement("div");

    instanceCreate(() => {
      return createElement(
        div,
        () => ({
          get foo() {
            return "static-foo";
          },
          ...$extra.value,
        }),
        undefined
      );
    });
    body.appendChild(div);

    expect(div.getAttribute("foo")).toBe("static-foo");
    expect(div.getAttribute("baz")).toBe("b1");

    // Spread source changes
    $extra.value = { baz: "b2" };
    expect(div.getAttribute("baz")).toBe("b2");
  });

  it("multiple independent prop updates should be isolated", () => {
    const $a = signal(1);
    const $b = signal(1);
    const $c = signal(1);
    let aReads = 0;

    const div = document.createElement("div");

    instanceCreate(() => {
      return createElement(
        div,
        () => ({
          get a() {
            aReads++;
            return $a.value;
          },
          get b() {
            return $b.value;
          },
          get c() {
            return $c.value;
          },
        }),
        undefined
      );
    });
    body.appendChild(div);

    aReads = 0; // reset after initial render

    // Change b and c multiple times, a should never be re-read
    $b.value = 2;
    $c.value = 2;
    $b.value = 3;
    $c.value = 3;

    expect(aReads).toBe(0);
    expect(div.getAttribute("a")).toBe("1");
    expect(div.getAttribute("b")).toBe("3");
    expect(div.getAttribute("c")).toBe("3");
  });
});

describe("aria/data boolean attribute semantics", () => {
  it("renders aria-*/data-* booleans as literal true/false", () => {
    const div = document.createElement("div");

    instanceCreate(() => {
      return createElement(
        div,
        () => ({
          "aria-checked": true,
          "data-open": false,
        }),
        undefined
      );
    });
    body.appendChild(div);

    expect(div.getAttribute("aria-checked")).toBe("true");
    expect(div.getAttribute("data-open")).toBe("false");
  });

  it("updates aria-*/data-* booleans reactively", () => {
    const $open = signal(false);
    const div = document.createElement("div");

    instanceCreate(() => {
      return createElement(
        div,
        () => ({
          get "data-open"() {
            return $open.value;
          },
        }),
        undefined
      );
    });
    body.appendChild(div);

    expect(div.getAttribute("data-open")).toBe("false");

    $open.value = true;
    expect(div.getAttribute("data-open")).toBe("true");

    $open.value = false;
    expect(div.getAttribute("data-open")).toBe("false");
  });
});
