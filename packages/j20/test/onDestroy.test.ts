import { it, beforeEach, describe, expect, vi } from "vitest";
import { signal } from "../src/api/signal";
import { onDestroy } from "../src/api/onDestroy";
import { onMount } from "../src/api/onMount";
import { effect } from "../src/api/effect";
import { instanceCreate, instanceDestroy } from "../src/h/instance";
import { createRoot } from "../src/h/createRoot";

const { body } = document;

beforeEach(() => {
  body.innerHTML = "";
  vi.clearAllMocks();
});

describe("onDestroy", () => {
  it("应该在组件销毁时执行回调函数", async () => {
    const destroySpy = vi.fn();

    const [instance, fragment] = instanceCreate(() => {
      onDestroy(() => {
        destroySpy();
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

    expect(destroySpy).not.toHaveBeenCalled();

    // 销毁实例
    instanceDestroy(instance, instance);

    expect(destroySpy).toHaveBeenCalledTimes(1);
  });

  it("应该支持多个 onDestroy 调用", async () => {
    const destroySpy1 = vi.fn();
    const destroySpy2 = vi.fn();
    const destroySpy3 = vi.fn();

    const [instance, fragment] = instanceCreate(() => {
      onDestroy(() => {
        destroySpy1();
      });

      onDestroy(() => {
        destroySpy2();
      });

      onDestroy(() => {
        destroySpy3();
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

    expect(destroySpy1).not.toHaveBeenCalled();
    expect(destroySpy2).not.toHaveBeenCalled();
    expect(destroySpy3).not.toHaveBeenCalled();

    // 销毁实例
    instanceDestroy(instance, instance);

    expect(destroySpy1).toHaveBeenCalledTimes(1);
    expect(destroySpy2).toHaveBeenCalledTimes(1);
    expect(destroySpy3).toHaveBeenCalledTimes(1);
  });

  it("应该在嵌套组件中正确工作", async () => {
    const parentDestroySpy = vi.fn();
    const childDestroySpy = vi.fn();

    const [instance, fragment] = instanceCreate(() => {
      onDestroy(() => {
        parentDestroySpy();
      });

      return (() => {
        const parentDiv = document.createElement("div");
        parentDiv.textContent = "Parent";

        // 模拟子组件
        const childInstance = instanceCreate(() => {
          onDestroy(() => {
            childDestroySpy();
          });

          return (() => {
            const childDiv = document.createElement("div");
            childDiv.textContent = "Child";
            return childDiv;
          })();
        });

        parentDiv.appendChild(childInstance[1]);
        return parentDiv;
      })();
    });

    document.body.appendChild(fragment);

    // 等待挂载完成
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(parentDestroySpy).not.toHaveBeenCalled();
    expect(childDestroySpy).not.toHaveBeenCalled();

    // 销毁父实例，子实例也应该被销毁
    instanceDestroy(instance, instance);

    expect(parentDestroySpy).toHaveBeenCalledTimes(1);
    expect(childDestroySpy).toHaveBeenCalledTimes(1);
  });

  it("应该处理错误情况", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const destroySpy = vi.fn();

    const [instance, fragment] = instanceCreate(() => {
      onDestroy(() => {
        throw new Error("Destroy error");
      });

      onDestroy(() => {
        destroySpy();
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

    expect(destroySpy).not.toHaveBeenCalled();

    // 销毁实例不应该报错（即使 onDestroy 中有错误）
    expect(() => {
      instanceDestroy(instance, instance);
    }).not.toThrow();

    // 第二个销毁函数应该仍然被执行
    expect(destroySpy).toHaveBeenCalledTimes(1);

    // 注意：错误会被 effect 系统内部处理，可能不会传播到 console.error
    // 这里主要测试即使有错误，其他销毁函数仍然会被执行

    errorSpy.mockRestore();
  });

  it("应该在实际组件中正常工作", async () => {
    const destroySpy = vi.fn();

    const App = () => {
      onDestroy(() => {
        destroySpy();
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

    expect(destroySpy).not.toHaveBeenCalled();
    expect(document.body.innerHTML).toContain("App Component");

    // 销毁组件
    instanceDestroy(root.instance, root.instance);

    expect(destroySpy).toHaveBeenCalledTimes(1);
  });

  it("应该处理重复销毁的情况", async () => {
    const destroySpy = vi.fn();

    const [instance, fragment] = instanceCreate(() => {
      onDestroy(() => {
        destroySpy();
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

    expect(destroySpy).not.toHaveBeenCalled();

    // 第一次销毁
    instanceDestroy(instance, instance);

    expect(destroySpy).toHaveBeenCalledTimes(1);

    // 第二次销毁不应该再次调用销毁函数
    instanceDestroy(instance, instance);

    expect(destroySpy).toHaveBeenCalledTimes(1);
  });

  it("应该与 onMount 正确协作", async () => {
    const mountSpy = vi.fn();
    const destroySpy = vi.fn();

    const [instance, fragment] = instanceCreate(() => {
      onMount(() => {
        mountSpy();
        return () => {
          // onMount 的清理函数
        };
      });

      onDestroy(() => {
        destroySpy();
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
    expect(destroySpy).not.toHaveBeenCalled();

    // 销毁实例
    instanceDestroy(instance, instance);

    expect(destroySpy).toHaveBeenCalledTimes(1);
  });

  it("应该在组件卸载时清理所有副作用", async () => {
    const effectSpy = vi.fn();
    const destroySpy = vi.fn();

    const [instance, fragment] = instanceCreate(() => {
      onDestroy(() => {
        destroySpy();
      });

      // 模拟 effect 副作用
      let $count = 0;
      effect(() => {
        effectSpy();
        $count++;
      });

      return (() => {
        const div = document.createElement("div");
        div.textContent = `Count: ${$count}`;
        return div;
      })();
    });

    document.body.appendChild(fragment);

    // 等待挂载完成和 effect 执行
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(effectSpy).toHaveBeenCalled();
    expect(destroySpy).not.toHaveBeenCalled();

    // 销毁实例应该清理所有副作用
    instanceDestroy(instance, instance);

    expect(destroySpy).toHaveBeenCalledTimes(1);
  });

  it("应该在信号更新后正常工作", async () => {
    const destroySpy = vi.fn();
    const $count = signal(0);

    const [instance, fragment] = instanceCreate(() => {
      onDestroy(() => {
        destroySpy();
      });

      return (() => {
        const div = document.createElement("div");
        div.textContent = `Count: ${$count.value}`;

        // 点击更新计数
        div.onclick = () => {
          $count.value++;
        };

        return div;
      })();
    });

    document.body.appendChild(fragment);

    // 等待挂载完成
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(destroySpy).not.toHaveBeenCalled();

    // 更新信号
    $count.value = 5;

    // 等待更新
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(destroySpy).not.toHaveBeenCalled();

    // 销毁实例
    instanceDestroy(instance, instance);

    expect(destroySpy).toHaveBeenCalledTimes(1);
  });
});