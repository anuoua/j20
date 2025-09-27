import { it, describe, expect } from "vitest";
import { signal } from "../src/signals";
import { effect } from "../src/api/effect";
import { instanceCreate, getCurrentInstance } from "../src/h/instance";

describe("Effect dispose integration", () => {
  it("should register effect dispose function to current instance", () => {
    let effectRunCount = 0;
    const count = signal(0);
    
    // 创建一个实例并在此上下文中创建effect
    const [instance, fragment] = instanceCreate(() => {
      // 在实例上下文中创建effect
      effect(() => {
        count.value;
        effectRunCount++;
      });
    });
    
    // 验证effect已注册到实例的dispose数组
    expect(instance.disposes.length).toBe(1);
    
    // 验证effect正常工作
    expect(effectRunCount).toBe(1);
    
    count.value = 1;
    expect(effectRunCount).toBe(2);
    
    // 调用实例的dispose函数
    instance.disposes.forEach(dispose => dispose());
    
    // 验证effect已被正确dispose
    count.value = 2;
    expect(effectRunCount).toBe(2); // 不应该再增加
  });
});