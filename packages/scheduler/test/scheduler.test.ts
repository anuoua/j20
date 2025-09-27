import { it, describe, expect, vi } from "vitest";
import { createScheduler, Priority } from "../src";

describe("Scheduler", () => {
  it("should create a scheduler", () => {
    const scheduler = createScheduler();
    expect(scheduler).toBeDefined();
    expect(typeof scheduler.addTask).toBe("function");
    expect(typeof scheduler.removeTask).toBe("function");
    expect(typeof scheduler.flush).toBe("function");
    expect(typeof scheduler.flushSync).toBe("function");
  });

  it("should add and execute sync tasks immediately", () => {
    const scheduler = createScheduler();
    const callback = vi.fn();

    scheduler.addTask(callback, "sync");

    expect(callback).toHaveBeenCalled();
  });

  it("should add and remove tasks", () => {
    const scheduler = createScheduler();
    const callback = vi.fn();

    const taskId = scheduler.addTask(callback, "async-normal");
    const result = scheduler.removeTask(taskId);

    expect(result).toBe(true);
    scheduler.flush();
    expect(callback).not.toHaveBeenCalled();
  });

  it("should execute async tasks with flush", () => {
    const scheduler = createScheduler();
    const callback = vi.fn();

    scheduler.addTask(callback, "async-normal");
    scheduler.flush();

    expect(callback).toHaveBeenCalled();
  });

  it("should execute sync and batch-sync tasks with flushSync", () => {
    const scheduler = createScheduler();
    const syncCallback = vi.fn();
    const batchSyncCallback = vi.fn();

    scheduler.addTask(syncCallback, "sync");
    scheduler.addTask(batchSyncCallback, "batch-sync");

    // sync任务已经执行了
    expect(syncCallback).toHaveBeenCalled();

    // 执行batch-sync任务
    scheduler.flushSync();
    expect(batchSyncCallback).toHaveBeenCalled();
  });

  it("should execute tasks in priority order", () => {
    const scheduler = createScheduler();
    const executionOrder: string[] = [];

    const createCallback = (name: string) => () => {
      executionOrder.push(name);
    };

    // 添加不同优先级的任务
    scheduler.addTask(createCallback("low"), "async-low");
    scheduler.addTask(createCallback("normal"), "async-normal");
    scheduler.addTask(createCallback("high"), "async-high");
    scheduler.addTask(createCallback("immediate"), "async-immediate");

    scheduler.flush();

    // 检查执行顺序是否正确
    expect(executionOrder).toEqual(["immediate", "high", "normal", "low"]);
  });

  it("should execute batch-sync tasks in creation order when same priority", () => {
    const scheduler = createScheduler();
    const executionOrder: string[] = [];

    const createCallback = (name: string) => () => {
      executionOrder.push(name);
    };

    // 添加相同优先级的任务
    scheduler.addTask(createCallback("first"), "batch-sync");
    scheduler.addTask(createCallback("second"), "batch-sync");
    scheduler.addTask(createCallback("third"), "batch-sync");

    scheduler.flushSync();

    // 检查执行顺序是否正确
    expect(executionOrder).toEqual(["first", "second", "third"]);
  });

  it("should execute async-immediate tasks with queueMicrotask", async () => {
    const scheduler = createScheduler();
    const callback = vi.fn();

    scheduler.addTask(callback, "async-immediate");

    // 等待微任务队列清空
    await new Promise<void>((resolve) => queueMicrotask(resolve));

    expect(callback).toHaveBeenCalled();
  });

  it("should execute async-high tasks with requestAnimationFrame", async () => {
    const scheduler = createScheduler();
    const callback = vi.fn();

    scheduler.addTask(callback, "async-high");

    // 等待下一帧
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

    expect(callback).toHaveBeenCalled();
  });

  it("should execute async-normal tasks with setTimeout", async () => {
    const scheduler = createScheduler();
    const callback = vi.fn();

    scheduler.addTask(callback, "async-normal");

    // 等待setTimeout执行
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(callback).toHaveBeenCalled();
  });

  it("should execute async-low tasks with delayed setTimeout", async () => {
    const scheduler = createScheduler();
    const callback = vi.fn();

    scheduler.addTask(callback, "async-low");

    // 等待setTimeout执行
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(callback).toHaveBeenCalled();
  });
});
