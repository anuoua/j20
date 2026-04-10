import { it, describe, expect } from "vitest";
import { signal, effect } from "../src";

describe("Effect dependency cleanup", () => {
  it("should remove stale dependencies when effect re-runs", () => {
    const flag = signal(true);
    const a = signal("a1");
    const b = signal("b1");
    let runCount = 0;
    let lastValue = "";

    effect(() => {
      runCount++;
      if (flag.value) {
        lastValue = a.value;
      } else {
        lastValue = b.value;
      }
    });

    expect(runCount).toBe(1);
    expect(lastValue).toBe("a1");

    a.value = "a2";
    expect(runCount).toBe(2);
    expect(lastValue).toBe("a2");

    flag.value = false;
    expect(runCount).toBe(3);
    expect(lastValue).toBe("b1");

    a.value = "a3";
    expect(runCount).toBe(3);

    b.value = "b2";
    expect(runCount).toBe(4);
    expect(lastValue).toBe("b2");
  });

  it("should not leak memory by growing deps indefinitely", () => {
    const flag = signal(0);
    const signals = [signal("s0"), signal("s1"), signal("s2")];
    let runCount = 0;

    const eff = effect(() => {
      runCount++;
      signals[flag.value].value;
    }) as any;

    expect(eff._deps.size).toBe(2);

    flag.value = 1;
    expect(eff._deps.size).toBe(2);

    flag.value = 2;
    expect(eff._deps.size).toBe(2);

    expect(runCount).toBe(3);
  });
});
