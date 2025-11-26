import { it, describe, expect } from "vitest";
import { signal, computed, effect, Signal, Computed, Effect } from "../src";

describe("Signal Performance", () => {
  it("should avoid duplicate dependency tracking", () => {
    const count = signal(0);
    let effectRunCount = 0;

    // 创建一个effect，多次访问同一个信号
    const eff = effect(() => {
      // 多次访问同一个信号
      count.value;
      count.value;
      count.value;
      effectRunCount++;
    });

    // 验证effect只运行一次
    expect(effectRunCount).toBe(1);

    // 验证依赖关系只建立一次
    expect(count._deps.size).toBe(1);

    // 更新信号
    count.value = 1;

    // 验证effect只运行一次
    expect(effectRunCount).toBe(2);
  });

  it("should optimize computed value tracking", () => {
    const a = signal(1);
    const b = signal(2);
    let computedRunCount = 0;

    // 创建一个computed，多次访问依赖信号
    const c = computed(() => {
      computedRunCount++;
      // 多次访问同一个信号
      return a.value + a.value + b.value;
    });

    // 第一次访问computed值
    expect(c.value).toBe(4);
    expect(computedRunCount).toBe(1);

    // 再次访问computed值，不应该重新计算
    expect(c.value).toBe(4);
    expect(computedRunCount).toBe(1);

    // 更新依赖信号
    a.value = 3;

    // 再次访问computed值，应该重新计算
    expect(c.value).toBe(8);
    expect(computedRunCount).toBe(2);
  });

  it("should optimize effect execution", () => {
    const count = signal(0);
    let effectRunCount = 0;
    let cleanupRunCount = 0;

    // 创建一个effect，返回清理函数
    const eff = effect(() => {
      count.value;
      effectRunCount++;
      return () => {
        cleanupRunCount++;
      };
    });

    // 验证effect运行一次，清理函数未运行
    expect(effectRunCount).toBe(1);
    expect(cleanupRunCount).toBe(0);

    // 更新信号，触发effect重新执行
    count.value = 1;

    // 验证effect运行两次，清理函数运行一次
    expect(effectRunCount).toBe(2);
    expect(cleanupRunCount).toBe(1);

    // dispose effect
    eff.dispose();

    // 验证清理函数运行两次
    expect(cleanupRunCount).toBe(2);
  });

  it("should handle complex dependency chains efficiently", () => {
    const a = signal(1);
    const b = signal(2);

    // 创建多层computed
    const c = computed(() => a.value + b.value);
    const d = computed(() => c.value * 2);
    const e = computed(() => d.value + 1);

    let effectRunCount = 0;

    // 创建effect依赖最终computed值
    effect(() => {
      e.value;
      effectRunCount++;
    });

    // 验证effect运行一次
    expect(effectRunCount).toBe(1);

    // 更新基础信号
    a.value = 3;

    // 验证effect运行两次
    expect(effectRunCount).toBe(2);

    // 再次更新基础信号
    b.value = 4;

    // 验证effect运行三次
    expect(effectRunCount).toBe(3);
  });

  it("should track version numbers correctly", () => {
    const a = signal(1);
    const b = computed(() => a.value * 2);

    // 验证初始版本号
    expect((a as Signal<number>).version).toBe(0);
    expect((b as Computed<number>).version).toBe(0);

    // 更新信号
    a.value = 2;

    // 验证信号版本号增加
    expect((a as Signal<number>).version).toBe(1);

    // 访问computed值触发计算
    expect(b.value).toBe(4);

    // 验证computed版本号增加
    expect((b as Computed<number>).version).toBe(1);
  });

  it("should optimize effect dependency checking with versions", () => {
    const a = signal(1);
    const b = signal(2);
    let effectRunCount = 0;

    // 创建effect
    const eff = effect(() => {
      a.value;
      b.value;
      effectRunCount++;
    }) as Effect;

    // 验证effect运行一次
    expect(effectRunCount).toBe(1);

    // 验证依赖版本号被正确记录
    expect(eff._depVersions.size).toBe(2);

    // 再次运行effect，依赖未变化
    // 注意：这里只是验证版本号机制，实际effect不会重新运行
    // 因为我们没有改变信号值

    // 更新一个依赖
    a.value = 3;

    // 验证effect运行两次
    expect(effectRunCount).toBe(2);

    // 验证依赖版本号检查功能
    expect(eff.hasDepsChanged()).toBe(true);
  });
});
