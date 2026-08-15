import { it, beforeEach, describe, expect } from "vitest";
import { signal } from "../src/api/signal";
import { instanceCreate } from "../src/h/instance";
import { createElement } from "../src/h/createElement";

const { body } = document;

beforeEach(() => {
  body.innerHTML = "";
});

describe("input value binding", () => {
  it("updates input value when signal changes", () => {
    const $text = signal("hello");
    const input = document.createElement("input");
    input.type = "text";

    instanceCreate(() =>
      createElement(
        input,
        () => ({
          get value() {
            return $text.value;
          },
        }),
        undefined
      )
    );
    body.appendChild(input);

    expect(input.value).toBe("hello");

    $text.value = "world";
    expect(input.value).toBe("world");
  });

  it("clears input value after user typed (dirty value flag)", () => {
    const $text = signal("");
    const input = document.createElement("input");
    input.type = "text";

    instanceCreate(() =>
      createElement(
        input,
        () => ({
          get value() {
            return $text.value;
          },
        }),
        undefined
      )
    );
    body.appendChild(input);

    // simulate user typing: sets the dirty value flag
    input.value = "abc";
    input.dispatchEvent(new Event("input"));
    $text.value = "abc"; // what the onInput handler would do

    // programmatic clear (what Enter key handler does)
    $text.value = "";

    expect(input.value).toBe("");
  });

  it("toggles checkbox checked via property, not attribute", () => {
    const $on = signal(false);
    const input = document.createElement("input");
    input.type = "checkbox";

    instanceCreate(() =>
      createElement(
        input,
        () => ({
          get checked() {
            return $on.value;
          },
        }),
        undefined
      )
    );
    body.appendChild(input);

    expect(input.checked).toBe(false);

    // simulate user clicking the checkbox (dirty flag on checked)
    input.click();
    expect(input.checked).toBe(true);
    $on.value = true; // what onChange handler would do

    // programmatic revert
    $on.value = false;
    expect(input.checked).toBe(false);
  });
});
