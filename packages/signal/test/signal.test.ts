import { it, describe, expect } from "vitest";
import {
  signal,
  computed,
  effect,
  Signal,
  Computed,
  Effect,
  untrack,
} from "../src";

describe("Signal System", () => {
  it("should handle basic signal operations", () => {
    const count = signal(0);
    expect(count.value).toBe(0);

    count.value = 1;
    expect(count.value).toBe(1);
  });

  it("should handle computed values", () => {
    const count = signal(0);
    const doubled = computed(() => count.value * 2);

    expect(doubled.value).toBe(0);

    count.value = 2;
    expect(doubled.value).toBe(4);
  });

  it("should handle effects", () => {
    const count = signal(0);
    let effectRunCount = 0;

    const eff = effect(() => {
      count.value;
      effectRunCount++;
    });

    expect(effectRunCount).toBe(1);

    count.value = 1;
    expect(effectRunCount).toBe(2);

    eff.dispose();
    count.value = 2;
    expect(effectRunCount).toBe(2); // Should not run after dispose
  });

  it("should handle nested computed values", () => {
    const a = signal(1);
    const b = computed(() => a.value + 1);
    const c = computed(() => b.value + 1);

    expect(c.value).toBe(3);

    a.value = 2;
    expect(c.value).toBe(4);
  });

  it("should handle effect cleanup", () => {
    const count = signal(0);
    let cleanupCalled = false;
    let effectRunCount = 0;

    const eff = effect(() => {
      count.value;
      effectRunCount++;
      return () => {
        cleanupCalled = true;
      };
    });

    expect(effectRunCount).toBe(1);
    expect(cleanupCalled).toBe(false);

    count.value = 1;
    expect(effectRunCount).toBe(2);
    expect(cleanupCalled).toBe(true);

    cleanupCalled = false;
    eff.dispose();
    expect(cleanupCalled).toBe(true);
  });

  it("should handle complex dependency chains", () => {
    const a = signal(1);
    const b = signal(2);
    const c = computed(() => a.value + b.value);
    const d = computed(() => c.value * 2);

    let effectRunCount = 0;
    let lastDValue = 0;

    effect(() => {
      lastDValue = d.value;
      effectRunCount++;
    });

    expect(effectRunCount).toBe(1);
    expect(lastDValue).toBe(6);

    a.value = 3;
    expect(effectRunCount).toBe(2);
    expect(lastDValue).toBe(10);

    b.value = 4;
    expect(effectRunCount).toBe(3);
    expect(lastDValue).toBe(14);
  });

  it("should track effect dependencies with version numbers", () => {
    const count = signal(0);
    let effectRunCount = 0;

    const eff = effect(() => {
      // 访问信号但不使用其值
      count.value;
      effectRunCount++;
    }) as Effect;

    // 验证effect运行一次
    expect(effectRunCount).toBe(1);

    // 验证依赖版本号被正确记录
    expect(eff._depVersions.size).toBe(1);

    // 更新信号值
    count.value = 1;

    // 验证effect运行两次
    expect(effectRunCount).toBe(2);
  });

  it("should maintain consistent dependency tracking", () => {
    const count = signal(0);
    const doubled = computed(() => count.value * 2);

    // 创建effect依赖computed值
    const eff = effect(() => {
      doubled.value;
    }) as Effect;

    // 验证依赖关系被正确建立
    expect(count._deps.size).toBe(1); // computed依赖count
    expect(doubled._deps.size).toBe(1); // effect依赖computed
    expect(eff._deps.size).toBe(1); // effect依赖computed
  });

  it("should handle computed disposal", () => {
    const count = signal(0);
    const doubled = computed(() => count.value * 2);

    // 访问computed值以确保它被计算
    expect(doubled.value).toBe(0);

    // dispose computed
    (doubled as Computed<number>).dispose();

    // 验证disposed状态
    expect(doubled.disposed).toBe(true);

    // 尝试访问disposed computed应该抛出错误
    expect(() => {
      doubled.value;
    }).toThrow("Cannot access value of disposed computed");
  });

  it("untrack should not track code, but effect inside still works", () => {
    const count = signal(0);
    const tracked = signal(0);
    let innerEffectRunCount = 0;
    let untrackCode1Ran = false;
    let untrackCode2Ran = false;

    // 在 untrack 中执行代码
    untrack(() => {
      // code 1: 不追踪 tracked 信号
      untrackCode1Ran = true;
      tracked.value; // 虽然访问了 tracked，但不会建立依赖

      // 在 untrack 内创建 effect，effect 本身仍然生效
      const innerEff = effect(() => {
        count.value; // effect 依赖 count
        innerEffectRunCount++;
      });

      // code 2: 不追踪 tracked 信号
      untrackCode2Ran = true;
      tracked.value; // 虽然访问了 tracked，但不会建立依赖
    });

    expect(untrackCode1Ran).toBe(true);
    expect(untrackCode2Ran).toBe(true);
    expect(innerEffectRunCount).toBe(1); // inner effect 运行过一次

    // 修改 tracked，inner effect 不会运行（因为没有依赖 tracked）
    tracked.value = 1;
    expect(innerEffectRunCount).toBe(1);

    // 修改 count，inner effect 应该运行（因为 effect 依赖 count）
    count.value = 1;
    expect(innerEffectRunCount).toBe(2);
  });

  it("untrack prevents dependency tracking in outer effect", () => {
    const outerSignal = signal(0);
    const innerSignal = signal(0);
    let outerEffectRunCount = 0;

    // 外层 effect
    const outerEff = effect(() => {
      outerEffectRunCount++;

      untrack(() => {
        // 在 untrack 中访问 innerSignal，不建立依赖
        innerSignal.value;
      });

      // 访问 outerSignal，建立依赖
      outerSignal.value;
    });

    expect(outerEffectRunCount).toBe(1);

    // 修改 innerSignal，outer effect 不应该运行
    innerSignal.value = 1;
    expect(outerEffectRunCount).toBe(1);

    // 修改 outerSignal，outer effect 应该运行
    outerSignal.value = 1;
    expect(outerEffectRunCount).toBe(2);
  });

  it("untrack should not affect nested effect dependencies", () => {
    const signal1 = signal(0);
    const signal2 = signal(0);
    let innerEffectRunCount = 0;

    untrack(() => {
      // 在 untrack 中创建 effect，该 effect 应该正常追踪依赖
      const innerEff = effect(() => {
        signal1.value; // effect 依赖 signal1
        innerEffectRunCount++;
      });

      // untrack 中的其他代码不追踪
      signal2.value;
    });

    expect(innerEffectRunCount).toBe(1);

    // 修改 signal1，inner effect 应该运行
    signal1.value = 1;
    expect(innerEffectRunCount).toBe(2);

    // 修改 signal2，inner effect 不应该运行
    signal2.value = 1;
    expect(innerEffectRunCount).toBe(2);
  });
});
