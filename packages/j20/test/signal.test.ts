import { it, describe, expect } from "vitest";
import { signal, computed, effect } from "../src/signals";

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
});