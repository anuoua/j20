import { it, beforeEach, describe, expect, vi } from "vitest";
import { signal } from "../src/api/signal";
import { instanceCreate } from "../src/h/instance";
import { createElement } from "../src/h/createElement";

const { body } = document;

beforeEach(() => {
  body.innerHTML = "";
});

describe("Native event listener options", () => {
  it("unset should pass capture option to removeEventListener", () => {
    const handler = () => {};
    const $handler = signal<
      { handleEvent: () => void; capture: true } | undefined
    >({
      handleEvent: handler,
      capture: true,
    });

    const div = document.createElement("div");
    const removeSpy = vi.spyOn(div, "removeEventListener");

    const [, fragment] = instanceCreate(() => {
      return createElement(
        div,
        () => ({
          get onNativeClick() {
            return $handler.value;
          },
        }),
        undefined
      );
    });

    body.appendChild(fragment);

    removeSpy.mockClear();

    // Remove the event listener by clearing the prop
    $handler.value = undefined;

    expect(removeSpy).toHaveBeenCalledTimes(1);
    const call = removeSpy.mock.calls[0]!;
    expect(call[0]).toBe("click");
    // Per spec, a capture-phase listener must be removed with capture:true
    const options = call[2];
    expect(options).toEqual({ capture: true });
  });

  it("update should pass capture option to removeEventListener when replacing", () => {
    const handler1 = () => {};
    const handler2 = () => {};
    const $handler = signal<{ handleEvent: () => void; capture: true }>({
      handleEvent: handler1,
      capture: true,
    });

    const div = document.createElement("div");
    const removeSpy = vi.spyOn(div, "removeEventListener");

    const [, fragment] = instanceCreate(() => {
      return createElement(
        div,
        () => ({
          get onNativeClick() {
            return $handler.value;
          },
        }),
        undefined
      );
    });

    body.appendChild(fragment);

    removeSpy.mockClear();

    // Replace the handler with a different one (triggers update path)
    $handler.value = { handleEvent: handler2, capture: true };

    expect(removeSpy).toHaveBeenCalledTimes(1);
    const call = removeSpy.mock.calls[0]!;
    expect(call[0]).toBe("click");
    expect(call[2]).toEqual({ capture: true });
  });
});
