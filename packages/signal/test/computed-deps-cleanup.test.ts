import { it, describe, expect } from "vitest";
import { signal, computed, Computed } from "../src";

describe("Computed dependency cleanup", () => {
  it("should clean up source._deps when computed dependency changes", () => {
    const flag = signal(true);
    const a = signal("a1");
    const b = signal("b2");
    let computeCount = 0;

    const c = computed(() => {
      computeCount++;
      if (flag.value) {
        return a.value;
      }
      return b.value;
    });

    expect(c.value).toBe("a1");
    expect(computeCount).toBe(1);
    expect(a._deps.has(c as Computed<unknown>)).toBe(true);

    flag.value = false;
    expect(c.value).toBe("b2");
    expect(computeCount).toBe(2);

    expect(a._deps.has(c as Computed<unknown>)).toBe(false);

    a.value = "a2";
    expect(computeCount).toBe(2);
  });

  it("should not recompute when stale source changes after dependency switch", () => {
    const flag = signal(true);
    const a = signal(1);
    const b = signal(10);
    let computeCount = 0;

    const c = computed(() => {
      computeCount++;
      return flag.value ? a.value : b.value;
    });

    expect(c.value).toBe(1);
    expect(computeCount).toBe(1);

    flag.value = false;
    expect(c.value).toBe(10);
    expect(computeCount).toBe(2);

    a.value = 2;
    expect(computeCount).toBe(2);
    expect(c.value).toBe(10);

    b.value = 20;
    expect(c.value).toBe(20);
    expect(computeCount).toBe(3);
  });

  it("should clean up source._deps on dispose", () => {
    const a = signal(1);
    const c = computed(() => a.value * 2);

    expect(c.value).toBe(2);
    expect(a._deps.has(c as Computed<unknown>)).toBe(true);

    (c as Computed<number>).dispose();

    expect(a._deps.has(c as Computed<unknown>)).toBe(false);
  });
});
