import { it, beforeEach, describe, expect, vi } from "vitest";
import { createElement } from "../src/h/createElement";
import { signal } from "../src/api/signal";
import { For } from "../src/control/For";
import { If } from "../src/control/If";
import { Switch, Case, Default } from "../src/control/Switch";
import { Dynamic } from "../src/control/Dynamic";
import { instanceCreate } from "../src/h/instance";

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
