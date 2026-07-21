import { it, describe, expect } from "vitest";
import { signal, computed, effect, batch } from "../src";

describe("Glitch freedom", () => {
  it("effect reads signal + derived computed: single run on change", () => {
    const a = signal(1);
    const d = computed(() => a.value * 2);
    const runs: Array<[number, number]> = [];

    effect(() => {
      runs.push([a.value, d.value]);
    });

    expect(runs).toEqual([[1, 2]]);

    a.value = 3;

    // Bug #1 from spec: previously produced [[1,2],[3,2],[3,6]]
    expect(runs).toEqual([[1, 2], [3, 6]]);
  });

  it("diamond dependency: single run, no intermediate stale value", () => {
    const a = signal(1);
    const b = computed(() => a.value * 2);
    const c = computed(() => a.value * 3);
    const d = computed(() => b.value + c.value);
    const runs: number[] = [];

    effect(() => {
      runs.push(d.value);
    });

    expect(runs).toEqual([5]);

    a.value = 10;

    // Bug from spec: previously produced [5, 23, 50]
    expect(runs).toEqual([5, 50]);
  });

  it("multi-level diamond: consistent value per run", () => {
    const a = signal(1);
    const b = computed(() => a.value + 1);
    const c = computed(() => a.value * 2);
    const d = computed(() => b.value + c.value);
    const e = computed(() => d.value * 10);
    const runs: number[] = [];

    effect(() => {
      runs.push(e.value);
    });

    // a=1 -> b=2, c=2 -> d=4 -> e=40
    expect(runs).toEqual([40]);

    a.value = 5;
    // a=5 -> b=6, c=10 -> d=16 -> e=160
    expect(runs).toEqual([40, 160]);
  });

  it("batched diamond: single run after batch exits", () => {
    const a = signal(1);
    const b = computed(() => a.value * 2);
    const c = computed(() => a.value * 3);
    const d = computed(() => b.value + c.value);
    const runs: number[] = [];

    effect(() => {
      runs.push(d.value);
    });

    expect(runs).toEqual([5]);

    batch(() => {
      a.value = 10;
      a.value = 20;
    });

    // a=20 -> b=40, c=60 -> d=100
    expect(runs).toEqual([5, 100]);
  });
});
