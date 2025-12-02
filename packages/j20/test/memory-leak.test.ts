import { it, beforeEach, describe, expect, vi } from "vitest";
import { createElement } from "../src/h/createElement";
import { signal } from "../src/api/signal";
import { For } from "../src/control/For";
import { If } from "../src/control/If";
import { Switch, Case, Default } from "../src/control/Switch";
import { Replace } from "../src/control/Replace";
import { instanceCreate, instanceDestroy } from "../src/h/instance";

const { body } = document;

beforeEach(() => {
  body.innerHTML = "";
});

describe("Memory Leak Prevention", () => {
  it("should clean up dispose functions when instance is destroyed", () => {
    const disposeFn = vi.fn();
    let instance: any;
    let fragment: any;

    [instance, fragment] = instanceCreate(() => {
      const div = document.createElement("div");
      // 模拟添加一个 dispose 函数
      const currentInst = instanceCreate(() => div)[0];
      if (!currentInst.disposes) currentInst.disposes = [];
      currentInst.disposes.push(disposeFn);
      return div;
    });

    // 确保 root 实例也有 disposes 数组
    if (!instance.disposes) instance.disposes = [];

    // 销毁实例
    instanceDestroy(instance, instance);

    expect(disposeFn).toHaveBeenCalled();
    expect(instance.disposes?.length).toBe(0);
  });

  it("should handle errors in dispose functions gracefully", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const errorFn = vi.fn(() => {
      throw new Error("Dispose error");
    });
    const successFn = vi.fn();

    let instance: any;

    [instance] = instanceCreate(() => {
      return document.createElement("div");
    });

    if (!instance.disposes) instance.disposes = [];
    instance.disposes.push(errorFn);
    instance.disposes.push(successFn);

    // 销毁实例，即使第一个 dispose 函数抛出错误，第二个也应该被执行
    instanceDestroy(instance, instance);

    expect(errorFn).toHaveBeenCalled();
    expect(successFn).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("should clear children references after destruction", () => {
    let parent: any;
    let child1: any;
    let child2: any;

    [parent] = instanceCreate(() => {
      return document.createElement("div");
    });

    [child1] = instanceCreate(() => document.createElement("div"), parent);
    [child2] = instanceCreate(() => document.createElement("div"), parent);

    expect(parent.children).toHaveLength(2);

    // 销毁第一个子实例
    instanceDestroy(parent, child1);

    // 验证子实例的引用已被清空
    expect(parent.children).toHaveLength(1);
    expect(parent.children[0]).toBe(child2);
  });

  it("should prevent dispose from running multiple times on same instance", () => {
    const disposeFn = vi.fn();
    let instance: any;

    [instance] = instanceCreate(() => {
      return document.createElement("div");
    });

    if (!instance.disposes) instance.disposes = [];
    instance.disposes.push(disposeFn);

    // 第一次销毁
    instanceDestroy(instance, instance);
    expect(disposeFn).toHaveBeenCalledTimes(1);
    expect(instance.disposes?.length).toBe(0);

    // 再次销毁应该不会执行 dispose（因为数组已被清空）
    instanceDestroy(instance, instance);
    expect(disposeFn).toHaveBeenCalledTimes(1);
  });

  it("should clean up nested instances properly", () => {
    const disposeFn1 = vi.fn();
    const disposeFn2 = vi.fn();
    const disposeFn3 = vi.fn();

    let root: any;
    let child: any;
    let grandchild: any;

    [root] = instanceCreate(() => document.createElement("div"));
    [child] = instanceCreate(() => document.createElement("div"), root);
    [grandchild] = instanceCreate(() => document.createElement("div"), child);

    if (!root.disposes) root.disposes = [];
    if (!child.disposes) child.disposes = [];
    if (!grandchild.disposes) grandchild.disposes = [];

    root.disposes.push(disposeFn1);
    child.disposes.push(disposeFn2);
    grandchild.disposes.push(disposeFn3);

    // 销毁根实例应该递归清理所有子实例
    instanceDestroy(root, root);

    expect(disposeFn1).toHaveBeenCalled();
    expect(disposeFn2).toHaveBeenCalled();
    expect(disposeFn3).toHaveBeenCalled();
    expect(root.disposes?.length).toBe(0);
    expect(root.children?.length).toBe(0);
  });

  it("should handle For component destruction without memory leaks", () => {
    const items = signal([1, 2, 3]);
    const disposeFn = vi.fn();

    const [instance, fragment] = instanceCreate(() => {
      return createElement(
        For as any,
        () => ({
          of: items.value,
          children: (item: any) => {
            const div = document.createElement("div");
            div.textContent = item.toString();
            return div;
          },
        }),
        undefined
      );
    });

    document.body.appendChild(fragment);

    // 模拟添加 dispose
    if (!instance.disposes) instance.disposes = [];
    instance.disposes.push(disposeFn);

    // 销毁实例
    instanceDestroy(instance, instance);

    expect(disposeFn).toHaveBeenCalled();
    expect(instance.disposes?.length).toBe(0);
    if (instance.children) {
      expect(instance.children.length).toBe(0);
    }
  });

  it("should destroy instances from leaf nodes first (bottom-up)", () => {
    const destroyOrder: string[] = [];

    let root: any;
    let child1: any;
    let child2: any;
    let grandchild1: any;
    let grandchild2: any;

    [root] = instanceCreate(() => document.createElement("div"));
    [child1] = instanceCreate(() => document.createElement("div"), root);
    [child2] = instanceCreate(() => document.createElement("div"), root);
    [grandchild1] = instanceCreate(() => document.createElement("div"), child1);
    [grandchild2] = instanceCreate(() => document.createElement("div"), child2);

    // 添加 dispose 函数来记录销毁顺序
    if (!root.disposes) root.disposes = [];
    if (!child1.disposes) child1.disposes = [];
    if (!child2.disposes) child2.disposes = [];
    if (!grandchild1.disposes) grandchild1.disposes = [];
    if (!grandchild2.disposes) grandchild2.disposes = [];

    root.disposes.push(() => destroyOrder.push("root"));
    child1.disposes.push(() => destroyOrder.push("child1"));
    child2.disposes.push(() => destroyOrder.push("child2"));
    grandchild1.disposes.push(() => destroyOrder.push("grandchild1"));
    grandchild2.disposes.push(() => destroyOrder.push("grandchild2"));

    // 销毁根实例
    instanceDestroy(root, root);

    // 验证销毁顺序：深度优先遍历，子节点先销毁
    // 树结构：root → [child1 → [grandchild1], child2 → [grandchild2]]
    // 销毁顺序应该是：grandchild1, child1, grandchild2, child2, root
    expect(destroyOrder[0]).toBe("grandchild1");
    expect(destroyOrder[1]).toBe("child1");
    expect(destroyOrder[2]).toBe("grandchild2");
    expect(destroyOrder[3]).toBe("child2");
    expect(destroyOrder[4]).toBe("root");
    expect(destroyOrder.length).toBe(5);
  });

  it("should destroy only specified subtree while preserving siblings", () => {
    const destroyOrder: string[] = [];

    let root: any;
    let child1: any;
    let child2: any;
    let grandchild1: any;

    [root] = instanceCreate(() => document.createElement("div"));
    [child1] = instanceCreate(() => document.createElement("div"), root);
    [child2] = instanceCreate(() => document.createElement("div"), root);
    [grandchild1] = instanceCreate(() => document.createElement("div"), child1);

    // 添加 dispose 函数
    if (!root.disposes) root.disposes = [];
    if (!child1.disposes) child1.disposes = [];
    if (!child2.disposes) child2.disposes = [];
    if (!grandchild1.disposes) grandchild1.disposes = [];

    root.disposes.push(() => destroyOrder.push("root"));
    child1.disposes.push(() => destroyOrder.push("child1"));
    child2.disposes.push(() => destroyOrder.push("child2"));
    grandchild1.disposes.push(() => destroyOrder.push("grandchild1"));

    // 只销毁 child1 及其子树
    instanceDestroy(root, child1);

    // 验证只有 child1 的子树被销毁
    expect(destroyOrder).toContain("grandchild1");
    expect(destroyOrder).toContain("child1");
    expect(destroyOrder).not.toContain("root");
    expect(destroyOrder).not.toContain("child2");

    // 验证 child1 已从 root.children 中移除
    expect(root.children).toHaveLength(1);
    expect(root.children[0]).toBe(child2);
  });
});
