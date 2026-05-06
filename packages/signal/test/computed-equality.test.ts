import { it, describe, expect } from "vitest";
import { signal, computed, effect, batch } from "../src";

describe("Computed equality optimization", () => {
  it("should not re-run effect when computed value unchanged (primitive)", () => {
    const source = signal({ c: 1, d: 2 });
    const derived = computed(() => source.value.c);
    let effectRunCount = 0;

    effect(() => {
      derived.value;
      effectRunCount++;
    });

    expect(effectRunCount).toBe(1);
    expect(derived.value).toBe(1);

    // source reference changes, but c stays the same
    source.value = { c: 1, d: 3 };
    expect(derived.value).toBe(1);
    expect(effectRunCount).toBe(1);
  });

  it("should re-run effect when computed value changes", () => {
    const source = signal({ c: 1, d: 2 });
    const derived = computed(() => source.value.c);
    let effectRunCount = 0;

    effect(() => {
      derived.value;
      effectRunCount++;
    });

    expect(effectRunCount).toBe(1);

    source.value = { c: 99, d: 2 };
    expect(derived.value).toBe(99);
    expect(effectRunCount).toBe(2);
  });

  it("should not increment version when computed value unchanged", () => {
    const source = signal({ c: 1, d: 2 });
    const derived = computed(() => source.value.c);

    expect(derived.value).toBe(1);
    const versionBefore = derived.version;

    source.value = { c: 1, d: 3 };
    expect(derived.value).toBe(1);
    expect(derived.version).toBe(versionBefore);
  });

  it("should increment version when computed value changes", () => {
    const source = signal({ c: 1, d: 2 });
    const derived = computed(() => source.value.c);

    expect(derived.value).toBe(1);
    const versionBefore = derived.version;

    source.value = { c: 99, d: 2 };
    expect(derived.value).toBe(99);
    expect(derived.version).toBe(versionBefore + 1);
  });

  it("should not trigger nested effect when intermediate computed value unchanged", () => {
    const source = signal({ c: 1, d: 2 });
    const mid = computed(() => source.value.c);
    const top = computed(() => mid.value * 10);
    let effectRunCount = 0;

    effect(() => {
      top.value;
      effectRunCount++;
    });

    expect(effectRunCount).toBe(1);
    expect(top.value).toBe(10);

    // c unchanged => mid unchanged => top unchanged
    source.value = { c: 1, d: 99 };
    expect(top.value).toBe(10);
    expect(effectRunCount).toBe(1);
  });

  it("should work with batch - no extra runs when value unchanged", () => {
    const source = signal({ c: 1, d: 2 });
    const derived = computed(() => source.value.c);
    let effectRunCount = 0;

    effect(() => {
      derived.value;
      effectRunCount++;
    });

    expect(effectRunCount).toBe(1);

    batch(() => {
      source.value = { c: 1, d: 3 };
      source.value = { c: 1, d: 4 };
      source.value = { c: 1, d: 5 };
    });

    expect(derived.value).toBe(1);
    expect(effectRunCount).toBe(1);
  });

  it("should work with batch - recompute when value changes", () => {
    const source = signal({ c: 1, d: 2 });
    const derived = computed(() => source.value.c);
    let effectRunCount = 0;

    effect(() => {
      derived.value;
      effectRunCount++;
    });

    expect(effectRunCount).toBe(1);

    batch(() => {
      source.value = { c: 1, d: 3 };
      source.value = { c: 5, d: 4 };
    });

    expect(derived.value).toBe(5);
    expect(effectRunCount).toBe(2);
  });

  it("should handle string equality", () => {
    const source = signal({ name: "foo", age: 1 });
    const name = computed(() => source.value.name);
    let effectRunCount = 0;

    effect(() => {
      name.value;
      effectRunCount++;
    });

    expect(effectRunCount).toBe(1);

    source.value = { name: "foo", age: 2 };
    expect(name.value).toBe("foo");
    expect(effectRunCount).toBe(1);
  });

  it("should handle boolean equality", () => {
    const source = signal({ active: true, count: 0 });
    const active = computed(() => source.value.active);
    let effectRunCount = 0;

    effect(() => {
      active.value;
      effectRunCount++;
    });

    expect(effectRunCount).toBe(1);

    source.value = { active: true, count: 1 };
    expect(active.value).toBe(true);
    expect(effectRunCount).toBe(1);
  });

  it("should handle NaN equality (NaN === NaN for Object.is)", () => {
    const source = signal({ val: NaN });
    const derived = computed(() => source.value.val);
    let effectRunCount = 0;

    effect(() => {
      derived.value;
      effectRunCount++;
    });

    expect(effectRunCount).toBe(1);

    source.value = { val: NaN };
    expect(Number.isNaN(derived.value)).toBe(true);
    // Object.is(NaN, NaN) is true, so effect should not re-run
    expect(effectRunCount).toBe(1);
  });

  it("should handle reference equality for objects", () => {
    const inner = { x: 1 };
    const source = signal({ ref: inner });
    const ref = computed(() => source.value.ref);
    let effectRunCount = 0;

    effect(() => {
      ref.value;
      effectRunCount++;
    });

    expect(effectRunCount).toBe(1);

    // same object reference
    source.value = { ref: inner };
    expect(ref.value).toBe(inner);
    expect(effectRunCount).toBe(1);
  });

  it("should detect reference change for objects", () => {
    const source = signal({ ref: { x: 1 } });
    const ref = computed(() => source.value.ref);
    let effectRunCount = 0;

    effect(() => {
      ref.value;
      effectRunCount++;
    });

    expect(effectRunCount).toBe(1);

    // different object reference, even if deeply equal
    source.value = { ref: { x: 1 } };
    expect(ref.value).toEqual({ x: 1 });
    // Object.is compares references for objects
    expect(effectRunCount).toBe(2);
  });
});
