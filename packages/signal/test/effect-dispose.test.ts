import { it, describe, expect } from "vitest";
import { signal, effect } from "../src";

describe("Effect dispose", () => {
  it("should properly dispose of effects", () => {
    let effectRunCount = 0;
    const count = signal(0);
    
    // 创建一个effect
    const effectInstance = effect(() => {
      count.value;
      effectRunCount++;
    });
    
    // 验证effect正常工作
    expect(effectRunCount).toBe(1);
    
    count.value = 1;
    expect(effectRunCount).toBe(2);
    
    // 调用dispose函数
    effectInstance.dispose();
    
    // 验证effect已被正确dispose
    count.value = 2;
    expect(effectRunCount).toBe(2); // 不应该再增加
  });

  it("should handle cleanup functions in effects", () => {
    let cleanupRun = false;
    let effectRunCount = 0;
    const count = signal(0);

    const effectInstance = effect(() => {
      count.value;
      effectRunCount++;
      
      return () => {
        cleanupRun = true;
      };
    });

    expect(effectRunCount).toBe(1);
    expect(cleanupRun).toBe(false);

    count.value = 1;
    expect(effectRunCount).toBe(2);
    expect(cleanupRun).toBe(true); // 前一次运行的清理函数应该被调用

    cleanupRun = false; // 重置cleanupRun变量

    // 当effect被dispose时，它会执行清理函数
    effectInstance.dispose();
    expect(cleanupRun).toBe(true); // dispose会执行清理函数
    
    count.value = 2;

    // effect和清理函数都不应再运行
    expect(effectRunCount).toBe(2);
  });

  it("should dispose multiple effects independently", () => {
    let effect1RunCount = 0;
    let effect2RunCount = 0;
    const count = signal(0);

    const effectInstance1 = effect(() => {
      count.value;
      effect1RunCount++;
    });

    const effectInstance2 = effect(() => {
      count.value;
      effect2RunCount++;
    });

    expect(effect1RunCount).toBe(1);
    expect(effect2RunCount).toBe(1);

    count.value = 1;
    expect(effect1RunCount).toBe(2);
    expect(effect2RunCount).toBe(2);

    // 只dispose第一个effect
    effectInstance1.dispose();

    count.value = 2;
    expect(effect1RunCount).toBe(2); // 不应再增加
    expect(effect2RunCount).toBe(3); // 应该继续增加
  });
});