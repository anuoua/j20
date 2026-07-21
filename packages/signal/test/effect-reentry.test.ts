import { it, describe, expect } from "vitest";
import { signal, effect, batch } from "../src";

describe("Effect reentry", () => {
  it("effect modifying another signal: dependent effect runs in same flush cycle", () => {
    const a = signal(0);
    const b = signal(0);
    const runs: string[] = [];

    effect(() => {
      a.value;
      runs.push("A");
      if (a.value > 0) b.value = a.value * 10;
    });

    effect(() => {
      b.value;
      runs.push("B");
    });

    expect(runs).toEqual(["A", "B"]);

    runs.length = 0;
    a.value = 1;
    // A runs, writes b -> B should run in the same flush cycle
    expect(runs).toEqual(["A", "B"]);
  });

  it("effect writing non-self signal inside batch: deferred correctly", () => {
    const a = signal(0);
    const b = signal(0);
    const order: string[] = [];

    effect(() => {
      a.value;
      order.push("A");
      b.value = a.value;
    });

    effect(() => {
      b.value;
      order.push("B");
    });

    expect(order).toEqual(["A", "B"]);

    order.length = 0;
    batch(() => {
      a.value = 5;
    });
    expect(order).toEqual(["A", "B"]);
  });

  it("effect writing its own dependent signal: no stack overflow", () => {
    const a = signal(0);
    let count = 0;

    effect(() => {
      const v = a.value;
      count++;
      if (v < 3) {
        a.value = v + 1;
      }
    });

    expect(a.value).toBe(3);
    expect(count).toBeGreaterThanOrEqual(3);
  });
});
