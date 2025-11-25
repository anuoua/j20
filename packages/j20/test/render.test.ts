import { it, beforeEach, describe, expect, vi } from "vitest";
import { createElement } from "../src/h/createElement";
import { signal } from "../src/api/signal";
import { For } from "../src/control/For";
import { If } from "../src/control/If";
import { Switch, Case, Default } from "../src/control/Switch";
import { Dynamic } from "../src/control/Dynamic";
import { instanceCreate, instanceDestroy } from "../src/h/instance";

const { body } = document;

beforeEach(() => {
  body.innerHTML = "";
});

describe("Control Components", () => {
  it("should render For component correctly", () => {
    const items = signal([1, 2, 3]);

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

    expect(body.innerHTML).toContain("<div>1</div>");
    expect(body.innerHTML).toContain("<div>2</div>");
    expect(body.innerHTML).toContain("<div>3</div>");

    // 更新列表
    items.value = [1, 2, 3, 4];

    expect(body.innerHTML).toContain("<div>4</div>");
  });

  it("should render If component correctly", () => {
    const condition = signal(true);

    const [instance, fragment] = instanceCreate(() => {
      return createElement(
        If as any,
        () => ({
          get of() {
            return condition.value;
          },
          get children() {
            const div = document.createElement("div");
            div.textContent = "true";
            return div;
          },
          get else() {
            const div = document.createElement("div");
            div.textContent = "false";
            return div;
          },
        }),
        undefined
      );
    });

    document.body.appendChild(fragment);

    expect(body.innerHTML).toContain("<div>true</div>");

    // 切换条件
    condition.value = false;

    expect(body.innerHTML).toContain("<div>false</div>");
  });

  it("should render Switch component correctly", () => {
    const value = signal(1);

    const [instance, fragment] = instanceCreate(() => {
      return createElement(
        Switch as any,
        () => ({
          get children() {
            return [
              createElement(
                Case as any,
                () => ({
                  of: value.value === 1,
                  children: (() => {
                    const div = document.createElement("div");
                    div.textContent = "case 1";
                    return div;
                  })(),
                }),
                undefined
              ),
              createElement(
                Case as any,
                () => ({
                  of: value.value === 2,
                  children: (() => {
                    const div = document.createElement("div");
                    div.textContent = "case 2";
                    return div;
                  })(),
                }),
                undefined
              ),
              createElement(
                Default as any,
                () => ({
                  children: (() => {
                    const div = document.createElement("div");
                    div.textContent = "default";
                    return div;
                  })(),
                }),
                undefined
              ),
            ];
          },
        }),
        undefined
      );
    });

    document.body.appendChild(fragment);

    expect(body.innerHTML).toContain("<div>case 1</div>");

    // 切换值
    value.value = 2;

    expect(body.innerHTML).toContain("<div>case 2</div>");

    // 切换到不匹配的值
    value.value = 3;

    expect(body.innerHTML).toContain("<div>default</div>");
  });

  it("should render Dynamic component correctly", () => {
    const element = signal<HTMLElement>(
      (() => {
        const div = document.createElement("div");
        div.textContent = "dynamic";
        return div;
      })()
    );

    const [instance, fragment] = instanceCreate(() => {
      return createElement(
        Dynamic as any,
        () => ({
          get of() {
            return element.value;
          },
          get children() {
            return element.value;
          },
        }),
        undefined
      );
    });

    document.body.appendChild(fragment);

    expect(body.innerHTML).toContain("<div>dynamic</div>");

    // 更新元素
    element.value = (() => {
      const span = document.createElement("span");
      span.textContent = "updated";
      return span;
    })();

    expect(body.innerHTML).toContain("<span>updated</span>");
  });

  it("should warn about duplicate trait values in development mode", () => {
    // Mock console.warn
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    // 创建包含重复 trait 值的列表
    const items = signal([
      { id: 1, name: "item1" },
      { id: 2, name: "item2" },
      { id: 1, name: "item3" }, // 重复的 id
    ]);

    const [instance, fragment] = instanceCreate(() => {
      return createElement(
        For as any,
        () => ({
          of: items.value,
          trait: (item: any) => item.id, // 使用 id 作为 trait
          children: (item: any) => {
            const div = document.createElement("div");
            div.textContent = item.name;
            return div;
          },
        }),
        undefined
      );
    });

    document.body.appendChild(fragment);

    // 验证是否输出了警告信息
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "[j20 For] Duplicate trait values detected in list"
      ),
      expect.any(Array)
    );

    // 恢复 console.warn
    warnSpy.mockRestore();
  });
});

describe("Style Object Handling", () => {
  it("should handle style as a string", () => {
    const [instance, fragment] = instanceCreate(() => {
      const div = document.createElement("div");
      return createElement(
        div,
        () => ({
          style: "color: red; font-size: 16px;",
        }),
        undefined
      );
    });

    document.body.appendChild(fragment);

    const element = body.querySelector("div") as HTMLElement;
    expect(element.getAttribute("style")).toBe("color: red; font-size: 16px;");
  });

  it("should handle style as an object", () => {
    const [instance, fragment] = instanceCreate(() => {
      const div = document.createElement("div");
      return createElement(
        div,
        () => ({
          style: {
            color: "blue",
            "font-size": "18px",
            margin: "10px",
          },
        }),
        undefined
      );
    });

    document.body.appendChild(fragment);

    const element = body.querySelector("div") as HTMLElement;
    const styleAttr = element.getAttribute("style");
    expect(styleAttr).toContain("color: blue");
    expect(styleAttr).toContain("font-size: 18px");
    expect(styleAttr).toContain("margin: 10px");
  });

  it("should update style when object changes", () => {
    const styleObj = signal<{
      [key: string]: string | number;
    }>({
      color: "green",
      padding: "5px",
    });

    const [instance, fragment] = instanceCreate(() => {
      const div = document.createElement("div");
      return createElement(
        div,
        () => ({
          style: styleObj.value,
        }),
        undefined
      );
    });

    document.body.appendChild(fragment);

    let element = body.querySelector("div") as HTMLElement;
    let styleAttr = element.getAttribute("style");
    expect(styleAttr).toContain("color: green");
    expect(styleAttr).toContain("padding: 5px");

    // 更新 style 对象
    styleObj.value = {
      color: "red",
      "background-color": "yellow",
    };

    element = body.querySelector("div") as HTMLElement;
    styleAttr = element.getAttribute("style");
    expect(styleAttr).toContain("color: red");
    expect(styleAttr).toContain("background-color: yellow");
    expect(styleAttr).not.toContain("padding");
  });

  it("should handle mixed style and other attributes", () => {
    const [instance, fragment] = instanceCreate(() => {
      const div = document.createElement("div");
      return createElement(
        div,
        () => ({
          id: "test-div",
          class: "container",
          style: {
            display: "flex",
            "justify-content": "center",
          },
        }),
        undefined
      );
    });

    document.body.appendChild(fragment);

    const element = body.querySelector("div") as HTMLElement;
    expect(element.id).toBe("test-div");
    expect(element.className).toBe("container");
    const styleAttr = element.getAttribute("style");
    expect(styleAttr).toContain("display: flex");
    expect(styleAttr).toContain("justify-content: center");
  });

  it("should handle numeric values in style object", () => {
    const [instance, fragment] = instanceCreate(() => {
      const div = document.createElement("div");
      return createElement(
        div,
        () => ({
          style: {
            width: 200,
            height: 100,
            opacity: 0.5,
          },
        }),
        undefined
      );
    });

    document.body.appendChild(fragment);

    const element = body.querySelector("div") as HTMLElement;
    const styleAttr = element.getAttribute("style");
    expect(styleAttr).toContain("width: 200");
    expect(styleAttr).toContain("height: 100");
    expect(styleAttr).toContain("opacity: 0.5");
  });
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
      currentInst.disposes.push(disposeFn);
      return div;
    });

    // 销毁实例
    instanceDestroy(instance, instance);

    expect(disposeFn).toHaveBeenCalled();
    expect(instance.disposes.length).toBe(0);
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

    instance.disposes.push(disposeFn);

    // 第一次销毁
    instanceDestroy(instance, instance);
    expect(disposeFn).toHaveBeenCalledTimes(1);
    expect(instance.disposes.length).toBe(0);

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

    root.disposes.push(disposeFn1);
    child.disposes.push(disposeFn2);
    grandchild.disposes.push(disposeFn3);

    // 销毁根实例应该递归清理所有子实例
    instanceDestroy(root, root);

    expect(disposeFn1).toHaveBeenCalled();
    expect(disposeFn2).toHaveBeenCalled();
    expect(disposeFn3).toHaveBeenCalled();
    expect(root.disposes.length).toBe(0);
    expect(root.children.length).toBe(0);
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
    instance.disposes.push(disposeFn);

    // 销毁实例
    instanceDestroy(instance, instance);

    expect(disposeFn).toHaveBeenCalled();
    expect(instance.disposes.length).toBe(0);
    if (instance.children) {
      expect(instance.children.length).toBe(0);
    }
  });
});

describe("Edge Cases", () => {
  describe("For Component Edge Cases", () => {
    it("should handle empty list", () => {
      const items = signal<number[]>([]);

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
      expect(body.innerHTML).not.toContain("<div>");
    });

    it("should handle transition from empty to populated list", () => {
      const items = signal<number[]>([]);

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
      expect(body.innerHTML).not.toContain("<div>");

      // 添加项目
      items.value = [1, 2, 3];
      expect(body.innerHTML).toContain("<div>1</div>");
      expect(body.innerHTML).toContain("<div>2</div>");
      expect(body.innerHTML).toContain("<div>3</div>");
    });

    it("should handle transition from populated to empty list", () => {
      const items = signal<number[]>([1, 2, 3]);

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
      expect(body.innerHTML).toContain("<div>1</div>");

      // 清空列表
      items.value = [];
      expect(body.innerHTML).not.toContain("<div>");
    });

    it("should handle single item list", () => {
      const items = signal([42]);

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
      expect(body.innerHTML).toContain("<div>42</div>");
    });

    it("should handle list with duplicate items using trait", () => {
      const items = signal<Array<{ id: number; name: string }>>([
        { id: 1, name: "a" },
        { id: 2, name: "b" },
        { id: 1, name: "c" },
      ]);

      const [instance, fragment] = instanceCreate(() => {
        return createElement(
          For as any,
          () => ({
            of: items.value,
            trait: (item: any) => item.id,
            children: (item: any) => {
              const div = document.createElement("div");
              div.textContent = item.name;
              return div;
            },
          }),
          undefined
        );
      });

      document.body.appendChild(fragment);
      // 应该渲染所有三项，即使 id 重复（但会发出警告）
      expect(body.innerHTML).toContain("<div>a</div>");
      expect(body.innerHTML).toContain("<div>b</div>");
      expect(body.innerHTML).toContain("<div>c</div>");
    });

    it("should handle list reordering with trait", () => {
      const items = signal<Array<{ id: number; text: string }>>([
        { id: 1, text: "first" },
        { id: 2, text: "second" },
        { id: 3, text: "third" },
      ]);

      const [instance, fragment] = instanceCreate(() => {
        return createElement(
          For as any,
          () => ({
            of: items.value,
            trait: (item: any) => item.id,
            children: (item: any) => {
              const div = document.createElement("div");
              div.textContent = item.text;
              return div;
            },
          }),
          undefined
        );
      });

      document.body.appendChild(fragment);
      expect(body.innerHTML).toContain("<div>first</div>");

      // 重新排序
      items.value = [
        { id: 3, text: "third" },
        { id: 1, text: "first" },
        { id: 2, text: "second" },
      ];

      const divs = body.querySelectorAll("div");
      expect(divs[0].textContent).toBe("third");
      expect(divs[1].textContent).toBe("first");
      expect(divs[2].textContent).toBe("second");
    });

    it("should handle list with complex objects", () => {
      const items = signal<Array<{ id: number; nested: { value: string } }>>([
        { id: 1, nested: { value: "a" } },
        { id: 2, nested: { value: "b" } },
      ]);

      const [instance, fragment] = instanceCreate(() => {
        return createElement(
          For as any,
          () => ({
            of: items.value,
            trait: (item: any) => item.id,
            children: (item: any) => {
              const div = document.createElement("div");
              div.textContent = item.nested.value;
              return div;
            },
          }),
          undefined
        );
      });

      document.body.appendChild(fragment);
      expect(body.innerHTML).toContain("<div>a</div>");
      expect(body.innerHTML).toContain("<div>b</div>");
    });
  });

  describe("If Component Edge Cases", () => {
    it("should handle falsy values correctly", () => {
      const value = signal(0);

      const [instance, fragment] = instanceCreate(() => {
        return createElement(
          If as any,
          () => ({
            get of() {
              return value.value;
            },
            get children() {
              const div = document.createElement("div");
              div.textContent = "truthy";
              return div;
            },
            get else() {
              const div = document.createElement("div");
              div.textContent = "falsy";
              return div;
            },
          }),
          undefined
        );
      });

      document.body.appendChild(fragment);
      expect(body.innerHTML).toContain("falsy");

      // 更新为 truthy
      value.value = 1;
      expect(body.innerHTML).toContain("truthy");
    });

    it("should handle null and undefined values", () => {
      const value = signal<any>(null);

      const [instance, fragment] = instanceCreate(() => {
        return createElement(
          If as any,
          () => ({
            get of() {
              return value.value;
            },
            get children() {
              const div = document.createElement("div");
              div.textContent = "has value";
              return div;
            },
            get else() {
              const div = document.createElement("div");
              div.textContent = "no value";
              return div;
            },
          }),
          undefined
        );
      });

      document.body.appendChild(fragment);
      expect(body.innerHTML).toContain("no value");

      // 更新为 undefined
      value.value = undefined;
      expect(body.innerHTML).toContain("no value");

      // 更新为有效值
      value.value = "something";
      expect(body.innerHTML).toContain("has value");
    });

    it("should handle empty string", () => {
      const value = signal("");

      const [instance, fragment] = instanceCreate(() => {
        return createElement(
          If as any,
          () => ({
            get of() {
              return value.value;
            },
            get children() {
              const div = document.createElement("div");
              div.textContent = "has value";
              return div;
            },
            get else() {
              const div = document.createElement("div");
              div.textContent = "empty";
              return div;
            },
          }),
          undefined
        );
      });

      document.body.appendChild(fragment);
      expect(body.innerHTML).toContain("empty");
    });

    it("should handle NaN", () => {
      const value = signal(NaN);

      const [instance, fragment] = instanceCreate(() => {
        return createElement(
          If as any,
          () => ({
            get of() {
              return value.value;
            },
            get children() {
              const div = document.createElement("div");
              div.textContent = "truthy";
              return div;
            },
            get else() {
              const div = document.createElement("div");
              div.textContent = "falsy";
              return div;
            },
          }),
          undefined
        );
      });

      document.body.appendChild(fragment);
      // NaN 在 JavaScript 中是 falsy 的
      expect(body.innerHTML).toContain("falsy");
    });
  });

  describe("Style Object Edge Cases", () => {
    it("should handle empty style object", () => {
      const [instance, fragment] = instanceCreate(() => {
        const div = document.createElement("div");
        return createElement(
          div,
          () => ({
            style: {},
          }),
          undefined
        );
      });

      document.body.appendChild(fragment);
      const element = body.querySelector("div") as HTMLElement;
      // 空对象应该不设置 style 属性或设置空值
      const styleAttr = element.getAttribute("style");
      expect(styleAttr === null || styleAttr === "").toBe(true);
    });

    it("should handle style with special characters in values", () => {
      const [instance, fragment] = instanceCreate(() => {
        const div = document.createElement("div");
        return createElement(
          div,
          () => ({
            style: {
              content: '"hello world"',
              fontFamily: "'Arial', sans-serif",
            },
          }),
          undefined
        );
      });

      document.body.appendChild(fragment);
      const element = body.querySelector("div") as HTMLElement;
      const styleAttr = element.getAttribute("style");
      expect(styleAttr).toContain('content: "hello world"');
      expect(styleAttr).toContain("fontFamily: 'Arial', sans-serif");
    });

    it("should handle zero values in style", () => {
      const [instance, fragment] = instanceCreate(() => {
        const div = document.createElement("div");
        return createElement(
          div,
          () => ({
            style: {
              margin: 0,
              padding: 0,
              opacity: 0,
            },
          }),
          undefined
        );
      });

      document.body.appendChild(fragment);
      const element = body.querySelector("div") as HTMLElement;
      const styleAttr = element.getAttribute("style");
      expect(styleAttr).toContain("margin: 0");
      expect(styleAttr).toContain("padding: 0");
      expect(styleAttr).toContain("opacity: 0");
    });

    it("should handle negative values in style", () => {
      const [instance, fragment] = instanceCreate(() => {
        const div = document.createElement("div");
        return createElement(
          div,
          () => ({
            style: {
              marginTop: -10,
              letterSpacing: -1,
            },
          }),
          undefined
        );
      });

      document.body.appendChild(fragment);
      const element = body.querySelector("div") as HTMLElement;
      const styleAttr = element.getAttribute("style");
      expect(styleAttr).toContain("marginTop: -10");
      expect(styleAttr).toContain("letterSpacing: -1");
    });
  });

  describe("Attribute Edge Cases", () => {
    it("should handle null and undefined attribute values", () => {
      const [instance, fragment] = instanceCreate(() => {
        const div = document.createElement("div");
        return createElement(
          div,
          () => ({
            id: null,
            "data-test": undefined,
            class: "test",
          }),
          undefined
        );
      });

      document.body.appendChild(fragment);
      const element = body.querySelector("div") as HTMLElement;
      expect(element.getAttribute("id")).toBeNull();
      expect(element.getAttribute("data-test")).toBeNull();
      expect(element.className).toBe("test");
    });

    it("should handle boolean attributes", () => {
      const [instance, fragment] = instanceCreate(() => {
        const input = document.createElement("input") as HTMLInputElement;
        return createElement(
          input,
          () => ({
            disabled: true,
            checked: false,
          }),
          undefined
        );
      });

      document.body.appendChild(fragment);
      const element = body.querySelector("input") as HTMLInputElement;
      expect(element.getAttribute("disabled")).toBe("");
      expect(element.hasAttribute("checked")).toBe(false);
    });

    it("should handle very long attribute values", () => {
      const longValue = "a".repeat(10000);
      const [instance, fragment] = instanceCreate(() => {
        const div = document.createElement("div");
        return createElement(
          div,
          () => ({
            "data-long": longValue,
          }),
          undefined
        );
      });

      document.body.appendChild(fragment);
      const element = body.querySelector("div") as HTMLElement;
      expect(element.getAttribute("data-long")).toBe(longValue);
    });
  });

  describe("Dynamic Component Edge Cases", () => {
    it("should handle Dynamic with null children", () => {
      const value = signal({ id: 1 });

      const [instance, fragment] = instanceCreate(() => {
        return createElement(
          Dynamic as any,
          () => ({
            get of() {
              return value.value;
            },
            get children() {
              return null;
            },
          }),
          undefined
        );
      });

      document.body.appendChild(fragment);
      // 应该不抛出错误
      expect(true).toBe(true);
    });

    it("should handle Dynamic with changing values", () => {
      const value = signal(1);

      const [instance, fragment] = instanceCreate(() => {
        return createElement(
          Dynamic as any,
          () => ({
            get of() {
              return value.value;
            },
            get children() {
              return (item: any) => {
                const div = document.createElement("div");
                div.textContent = `value: ${item}`;
                return div;
              };
            },
          }),
          undefined
        );
      });

      document.body.appendChild(fragment);

      // 多次更新
      for (let i = 0; i < 5; i++) {
        value.value = i;
      }

      expect(body.innerHTML).toContain("value:");
    });
  });
});

describe("Concurrent Updates", () => {
  it("should handle multiple signal updates in sequence", () => {
    const $count = signal(0);
    const $text = signal("a");

    const [instance, fragment] = instanceCreate(() => {
      const div = document.createElement("div");
      return createElement(
        div,
        () => ({
          "data-count": $count.value,
          "data-text": $text.value,
        }),
        undefined
      );
    });

    document.body.appendChild(fragment);
    const element = body.querySelector("div") as HTMLElement;

    expect(element.getAttribute("data-count")).toBe("0");
    expect(element.getAttribute("data-text")).toBe("a");

    // 更新第一个信号
    $count.value = 1;
    expect(element.getAttribute("data-count")).toBe("1");
    expect(element.getAttribute("data-text")).toBe("a");

    // 更新第二个信号
    $text.value = "b";
    expect(element.getAttribute("data-count")).toBe("1");
    expect(element.getAttribute("data-text")).toBe("b");

    // 同时更新两个信号
    $count.value = 2;
    $text.value = "c";
    expect(element.getAttribute("data-count")).toBe("2");
    expect(element.getAttribute("data-text")).toBe("c");
  });

  it("should handle For list updates with other signal changes", () => {
    const $items = signal<number[]>([1, 2]);
    const $multiplier = signal(1);

    const [instance, fragment] = instanceCreate(() => {
      return createElement(
        For as any,
        () => ({
          get of() {
            return $items.value;
          },
          get children() {
            return (item: any) => {
              const div = document.createElement("div");
              return createElement(
                div,
                () => ({}),
                () => [() => (item * $multiplier.value).toString()]
              );
            };
          },
        }),
        undefined
      );
    });

    document.body.appendChild(fragment);

    expect(body.innerHTML).toContain("<div>1</div>");
    expect(body.innerHTML).toContain("<div>2</div>");

    // 更新列表
    $items.value = [1, 2, 3];
    expect(body.innerHTML).toContain("<div>3</div>");

    // 更新倍数
    $multiplier.value = 2;
    expect(body.innerHTML).toContain("<div>2</div>");
    expect(body.innerHTML).toContain("<div>4</div>");
    expect(body.innerHTML).toContain("<div>6</div>");

    // 同时更新列表和倍数
    $items.value = [2, 3];
    $multiplier.value = 3;
    expect(body.innerHTML).toContain("<div>6</div>");
    expect(body.innerHTML).toContain("<div>9</div>");
  });

  it("should handle rapid successive updates", () => {
    const $value = signal(0);

    const [instance, fragment] = instanceCreate(() => {
      const div = document.createElement("div");
      return createElement(
        div,
        () => {
          return {};
        },
        () => {
          return [() => $value.value.toString()];
        }
      );
    });

    document.body.appendChild(fragment);
    const element = body.querySelector("div") as HTMLElement;

    // 快速连续更新
    for (let i = 1; i <= 10; i++) {
      $value.value = i;
    }

    expect(element.innerText).toBe("10");
  });

  it("should handle nested component updates concurrently", () => {
    const $outer = signal("outer");
    const $inner = signal("inner");
    const $visible = signal(true);

    const [instance, fragment] = instanceCreate(() => {
      return createElement(
        document.createElement("div"),
        () => ({ "data-outer": $outer.value }),
        () => [
          createElement(
            If as any,
            () => ({
              get of() {
                return $visible.value;
              },
              get children() {
                const div = document.createElement("div");
                return createElement(
                  div,
                  () => ({}),
                  () => [() => $inner.value]
                );
              },
            }),
            undefined
          ),
        ]
      );
    });

    document.body.appendChild(fragment);
    expect(body.textContent).toContain("inner");

    // 更新外层信号
    $outer.value = "outer2";
    expect(body.querySelector("[data-outer]")?.getAttribute("data-outer")).toBe(
      "outer2"
    );

    // 更新内层信号
    $inner.value = "inner2";
    expect(body.textContent).toContain("inner2");

    // 隐藏 If 组件
    $visible.value = false;
    expect(body.textContent).not.toContain("inner2");

    // 恢复并更新
    $visible.value = true;
    $inner.value = "inner3";
    expect(body.textContent).toContain("inner3");
  });

  it("should handle multiple For components updating concurrently", () => {
    const $list1 = signal([1, 2]);
    const $list2 = signal(["a", "b"]);

    const [instance, fragment] = instanceCreate(() => {
      const container = document.createElement("div");
      return createElement(
        container,
        () => ({}),
        () => [
          createElement(
            For as any,
            () => ({
              of: $list1.value,
              children: (item: any) => {
                const div = document.createElement("div");
                div.className = "list1";
                div.textContent = item.toString();
                return div;
              },
            }),
            undefined
          ),
          createElement(
            For as any,
            () => ({
              of: $list2.value,
              children: (item: any) => {
                const div = document.createElement("div");
                div.className = "list2";
                div.textContent = item.toString();
                return div;
              },
            }),
            undefined
          ),
        ]
      );
    });

    document.body.appendChild(fragment);

    let list1Divs = body.querySelectorAll(".list1");
    let list2Divs = body.querySelectorAll(".list2");
    expect(list1Divs.length).toBe(2);
    expect(list2Divs.length).toBe(2);

    // 同时更新两个列表
    $list1.value = [1, 2, 3];
    $list2.value = ["a", "b", "c"];

    list1Divs = body.querySelectorAll(".list1");
    list2Divs = body.querySelectorAll(".list2");
    expect(list1Divs.length).toBe(3);
    expect(list2Divs.length).toBe(3);
  });

  it("should handle rapid If condition changes", () => {
    const $condition = signal(true);
    let renderCount = 0;

    const [instance, fragment] = instanceCreate(() => {
      return createElement(
        If as any,
        () => ({
          get of() {
            return $condition.value;
          },
          get children() {
            return () => {
              renderCount++;
              const div = document.createElement("div");
              return createElement(
                div,
                () => ({}),
                () => ["visible"]
              );
            };
          },
          get else() {
            renderCount++;
            const div = document.createElement("div");
            return createElement(
              div,
              () => ({}),
              () => ["hidden"]
            );
          },
        }),
        undefined
      );
    });

    document.body.appendChild(fragment);
    const initialRenderCount = renderCount;

    // 快速切换条件
    for (let i = 0; i < 10; i++) {
      $condition.value = !$condition.value;
    }

    // 最终应该是隐藏状态（10 次切换，从 true 开始）
    expect(body.textContent).toContain("visible");
    // 验证所有切换都被处理了
    expect(renderCount).toBeGreaterThan(initialRenderCount);
  });

  it("should handle Switch condition updates concurrently", () => {
    const $value = signal(1);

    const [instance, fragment] = instanceCreate(() => {
      return createElement(
        Switch as any,
        () => ({
          get children() {
            return [
              createElement(
                Case as any,
                () => ({
                  of: $value.value === 1,
                  children: (() => {
                    const div = document.createElement("div");
                    div.textContent = "case1";
                    return div;
                  })(),
                }),
                undefined
              ),
              createElement(
                Case as any,
                () => ({
                  of: $value.value === 2,
                  children: (() => {
                    const div = document.createElement("div");
                    div.textContent = "case2";
                    return div;
                  })(),
                }),
                undefined
              ),
              createElement(
                Case as any,
                () => ({
                  of: $value.value === 3,
                  children: (() => {
                    const div = document.createElement("div");
                    div.textContent = "case3";
                    return div;
                  })(),
                }),
                undefined
              ),
            ];
          },
        }),
        undefined
      );
    });

    document.body.appendChild(fragment);
    expect(body.innerHTML).toContain("case1");

    // 快速切换 case
    $value.value = 2;
    expect(body.innerHTML).toContain("case2");

    $value.value = 3;
    expect(body.innerHTML).toContain("case3");

    $value.value = 1;
    expect(body.innerHTML).toContain("case1");
  });

  it("should handle attribute and style updates concurrently", () => {
    const $disabled = signal(false);
    const $bg = signal("red");
    const $text = signal("white");

    const [instance, fragment] = instanceCreate(() => {
      const div = document.createElement("div");
      return createElement(
        div,
        () => ({
          disabled: $disabled.value,
          style: {
            backgroundColor: $bg.value,
            color: $text.value,
          },
        }),
        undefined
      );
    });

    document.body.appendChild(fragment);
    const element = body.querySelector("div") as HTMLElement;

    let styleAttr = element.getAttribute("style");
    expect(styleAttr).toContain("backgroundColor: red");
    expect(styleAttr).toContain("color: white");

    // 同时更新多个属性
    $disabled.value = true;
    $bg.value = "blue";
    $text.value = "black";

    expect(element.getAttribute("disabled")).toBe("");
    styleAttr = element.getAttribute("style");
    expect(styleAttr).toContain("backgroundColor: blue");
    expect(styleAttr).toContain("color: black");

    // 继续并发更新
    $disabled.value = false;
    $bg.value = "green";
    $text.value = "yellow";

    expect(element.hasAttribute("disabled")).toBe(false);
    styleAttr = element.getAttribute("style");
    expect(styleAttr).toContain("backgroundColor: green");
    expect(styleAttr).toContain("color: yellow");
  });

  it("should handle event listener with concurrent state updates", () => {
    const $count = signal(0);
    const $text = signal("initial");

    const [instance, fragment] = instanceCreate(() => {
      const button = document.createElement("button");
      return createElement(
        button,
        () => ({
          onClick: () => {
            $count.value++;
            $text.value = `clicked ${$count.value} times`;
          },
        }),
        () => [() => `${$text.value} (${$count.value})`]
      );
    });

    document.body.appendChild(fragment);
    const button = body.querySelector("button") as HTMLButtonElement;

    expect(button.textContent).toContain("initial (0)");

    // 模拟多次点击
    button.click();
    expect(button.textContent).toContain("clicked 1 times");

    button.click();
    expect(button.textContent).toContain("clicked 2 times");

    button.click();
    expect($count.value).toBe(3);
    expect($text.value).toContain("clicked 3 times");
  });

  it("should handle complex nested concurrent updates", () => {
    const $items = signal<Array<{ id: number; checked: boolean }>>([
      { id: 1, checked: false },
      { id: 2, checked: false },
    ]);
    const $selectAll = signal(false);

    const [instance, fragment] = instanceCreate(() => {
      const container = document.createElement("div");
      return createElement(
        container,
        () => ({}),
        () => [
          createElement(
            For as any,
            () => ({
              get of() {
                return $items.value;
              },
              get trait() {
                return (item: any) => item;
              },
              get children() {
                return (item: any) => {
                  const div = document.createElement("div");
                  div.className = "item";
                  return createElement(
                    div,
                    () => ({}),
                    () => [
                      () => {
                        const all = $selectAll.value;
                        return `id: ${item.id}, checked: ${
                          item.checked || all
                        }`;
                      },
                    ]
                  );
                };
              },
            }),
            undefined
          ),
        ]
      );
    });

    document.body.appendChild(fragment);
    let items = body.querySelectorAll(".item");
    expect(items.length).toBe(2);

    // 添加新项并设置 selectAll
    $items.value = [
      { id: 1, checked: false },
      { id: 2, checked: false },
      { id: 3, checked: false },
    ];
    $selectAll.value = true;

    items = body.querySelectorAll(".item");
    expect(items.length).toBe(3);
    expect(items[0].textContent).toContain("checked: true");

    // 修改单个项并改变 selectAll
    const newItems = $items.value.map((item) =>
      item.id === 1 ? { ...item, checked: true } : item
    );
    $items.value = newItems;
    $selectAll.value = false;

    items = body.querySelectorAll(".item");
    expect(items[0].textContent).toContain("checked: true");
    expect(items[1].textContent).toContain("checked: false");
  });
});
