import { it, describe, expect } from "vitest";
import { signal, computed, effect, Signal, Computed, Effect } from "../src";

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
});
