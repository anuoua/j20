import { it, beforeEach, describe, expect } from "vitest";
import { signal } from "../src/api/signal";
import { instanceCreate } from "../src/h/instance";
import { createElement } from "../src/h/createElement";

const { body } = document;

beforeEach(() => {
  body.innerHTML = "";
});

describe("getChildren reactive type switching", () => {
  it("text → text: should update text node in place", () => {
    const $val = signal("hello");
    const div = document.createElement("div");

    const [, fragment] = instanceCreate(() => {
      return createElement(div, undefined, () => [() => $val.value]);
    });
    body.appendChild(fragment);

    expect(div.textContent).toBe("hello");

    $val.value = "world";
    expect(div.textContent).toBe("world");
    expect(div.childNodes).toHaveLength(1);
  });

  it("text → element: should replace text node with element, no lingering text", () => {
    const $val = signal<any>("hello");
    const div = document.createElement("div");

    const [, fragment] = instanceCreate(() => {
      return createElement(div, undefined, () => [() => $val.value]);
    });
    body.appendChild(fragment);

    expect(div.textContent).toBe("hello");

    const span = document.createElement("span");
    span.textContent = "world";
    $val.value = span;

    // Old text "hello" must be gone, span must be in the DOM
    expect(div.textContent).toBe("world");
    expect(div.querySelector("span")).not.toBeNull();
    // No leftover text node alongside the span
    expect(div.childNodes).toHaveLength(1);
    expect(div.firstChild).toBe(span);
  });

  it("text → element → text: should round-trip cleanly", () => {
    const $val = signal<any>("first");
    const div = document.createElement("div");

    const [, fragment] = instanceCreate(() => {
      return createElement(div, undefined, () => [() => $val.value]);
    });
    body.appendChild(fragment);

    expect(div.textContent).toBe("first");

    const span = document.createElement("span");
    span.textContent = "node-phase";
    $val.value = span;
    expect(div.firstChild).toBe(span);
    expect(div.textContent).toBe("node-phase");

    $val.value = "second";
    expect(div.textContent).toBe("second");
    expect(div.childNodes).toHaveLength(1);
    expect(div.firstChild?.nodeType).toBe(Node.TEXT_NODE);
  });

  it("element (initial) → should be static (effect disposed, no reactive update)", () => {
    const initialSpan = document.createElement("span");
    initialSpan.textContent = "initial";
    const $val = signal<any>(initialSpan);
    const div = document.createElement("div");

    const [, fragment] = instanceCreate(() => {
      return createElement(div, undefined, () => [() => $val.value]);
    });
    body.appendChild(fragment);

    expect(div.firstChild).toBe(initialSpan);

    // Per docs, element interpolation is non-reactive
    const newSpan = document.createElement("span");
    newSpan.textContent = "new";
    $val.value = newSpan;

    expect(div.firstChild).toBe(initialSpan);
  });
});
