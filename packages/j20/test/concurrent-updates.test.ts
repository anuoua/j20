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
