import { it, beforeEach, describe, expect, vi } from "vitest";
import { signal } from "../src/api/signal";
import { onMount } from "../src/api/onMount";
import { instanceCreate, instanceDestroy } from "../src/h/instance";
import { createRoot } from "../src/h/createRoot";

const { body } = document;

beforeEach(() => {
  body.innerHTML = "";
  vi.clearAllMocks();
});

describe("onMount", () => {
  it("应该在组件挂载后执行回调函数", async () => {
    const mountSpy = vi.fn();

    const [instance, fragment] = instanceCreate(() => {
      onMount(() => {
        mountSpy();
      });

      return (() => {
        const div = document.createElement("div");
        div.textContent = "Hello World";
        return div;
      })();
    });

    document.body.appendChild(fragment);

    // onMount 使用 requestAnimationFrame，所以需要等待下一帧
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mountSpy).toHaveBeenCalledTimes(1);
  });

  it("应该正确执行清理函数", async () => {
    const mountSpy = vi.fn();
    const cleanupSpy = vi.fn();

    const [instance, fragment] = instanceCreate(() => {
      onMount(() => {
        mountSpy();
        return cleanupSpy;
      });

      return (() => {
        const div = document.createElement("div");
        div.textContent = "Hello World";
        return div;
      })();
    });

    document.body.appendChild(fragment);

    // 等待挂载完成
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mountSpy).toHaveBeenCalledTimes(1);
    expect(cleanupSpy).not.toHaveBeenCalled();

    // 销毁实例
    instanceDestroy(instance, instance);

    expect(cleanupSpy).toHaveBeenCalledTimes(1);
  });

  it("应该在组件卸载前执行清理函数", async () => {
    const mountSpy = vi.fn();
    const cleanupSpy = vi.fn();

    const [instance, fragment] = instanceCreate(() => {
      onMount(() => {
        mountSpy();
        return cleanupSpy;
      });

      return (() => {
        const div = document.createElement("div");
        div.textContent = "Hello World";
        return div;
      })();
    });

    document.body.appendChild(fragment);

    // 等待挂载完成
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mountSpy).toHaveBeenCalledTimes(1);

    // 销毁实例
    instanceDestroy(instance, instance);

    expect(cleanupSpy).toHaveBeenCalledTimes(1);
  });

  it("应该处理没有返回清理函数的情况", async () => {
    const mountSpy = vi.fn();

    const [instance, fragment] = instanceCreate(() => {
      onMount(() => {
        mountSpy();
        // 没有返回清理函数
      });

      return (() => {
        const div = document.createElement("div");
        div.textContent = "Hello World";
        return div;
      })();
    });

    document.body.appendChild(fragment);

    // 等待挂载完成
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mountSpy).toHaveBeenCalledTimes(1);

    // 销毁实例不应该报错
    expect(() => {
      instanceDestroy(instance, instance);
    }).not.toThrow();
  });

  it("应该支持多个 onMount 调用", async () => {
    const mountSpy1 = vi.fn();
    const mountSpy2 = vi.fn();
    const cleanupSpy1 = vi.fn();
    const cleanupSpy2 = vi.fn();

    const [instance, fragment] = instanceCreate(() => {
      onMount(() => {
        mountSpy1();
        return cleanupSpy1;
      });

      onMount(() => {
        mountSpy2();
        return cleanupSpy2;
      });

      return (() => {
        const div = document.createElement("div");
        div.textContent = "Hello World";
        return div;
      })();
    });

    document.body.appendChild(fragment);

    // 等待挂载完成
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mountSpy1).toHaveBeenCalledTimes(1);
    expect(mountSpy2).toHaveBeenCalledTimes(1);

    // 销毁实例
    instanceDestroy(instance, instance);

    expect(cleanupSpy1).toHaveBeenCalledTimes(1);
    expect(cleanupSpy2).toHaveBeenCalledTimes(1);
  });

  it("应该在组件快速销毁时正确处理", async () => {
    const mountSpy = vi.fn();
    const cleanupSpy = vi.fn();

    const [instance, fragment] = instanceCreate(() => {
      onMount(() => {
        mountSpy();
        return cleanupSpy;
      });

      return (() => {
        const div = document.createElement("div");
        div.textContent = "Hello World";
        return div;
      })();
    });

    document.body.appendChild(fragment);

    // 立即销毁（在 onMount 回调执行之前）
    instanceDestroy(instance, instance);

    // 等待 requestAnimationFrame
    await new Promise(resolve => setTimeout(resolve, 0));

    // onMount 回调仍然应该被执行
    expect(mountSpy).toHaveBeenCalledTimes(1);

    // 清理函数也应该被调用，因为组件已经被销毁
    expect(cleanupSpy).toHaveBeenCalledTimes(1);
  });

  
  it("应该在实际组件中正常工作", async () => {
    const mountSpy = vi.fn();
    const cleanupSpy = vi.fn();

    const App = () => {
      onMount(() => {
        mountSpy();
        return cleanupSpy;
      });

      return (() => {
        const div = document.createElement("div");
        div.textContent = "App Component";
        return div;
      })();
    };

    const root = createRoot(App);
    document.body.appendChild(root.element);

    // 等待挂载完成
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mountSpy).toHaveBeenCalledTimes(1);
    expect(document.body.innerHTML).toContain("App Component");

    // 销毁组件
    instanceDestroy(root.instance, root.instance);

    expect(cleanupSpy).toHaveBeenCalledTimes(1);
  });
});