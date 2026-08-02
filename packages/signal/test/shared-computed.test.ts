import { it, describe, expect } from "vitest";
import { signal, computed, effect } from "../src/signal";

describe("shared computed invalidation", () => {
  it("runs every effect observing a shared computed", () => {
    const $a = signal(1);
    const $double = computed(() => $a.value * 2);

    let runs1 = 0;
    let runs2 = 0;

    effect(() => {
      $double.value;
      runs1++;
    });
    effect(() => {
      $double.value;
      runs2++;
    });

    expect(runs1).toBe(1);
    expect(runs2).toBe(1);

    $a.value = 2;

    // 两个 effect 都依赖同一个 computed，都应该被触发
    expect(runs1).toBe(2);
    expect(runs2).toBe(2);
  });

  it("skips effects when the shared computed recomputes to the same value", () => {
    const $a = signal(1);
    const $same = computed(() => $a.value % 2); // 恒为 1

    let runs = 0;
    effect(() => {
      $same.value;
      runs++;
    });

    expect(runs).toBe(1);

    $a.value = 3; // $same 仍为 1，effect 不应重跑
    expect(runs).toBe(1);
  });
});
