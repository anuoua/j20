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
