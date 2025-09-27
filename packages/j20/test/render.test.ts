import { it, beforeEach, describe, expect } from "vitest";
import { createElement } from "../src/h/createElement";
import { computed } from "../src/api/computed";
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
            div.textContent = item.value.toString();
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
          of: condition.value,
          children: () => {
            const div = document.createElement("div");
            div.textContent = "true";
            return div;
          },
          else: () => {
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
          children: [
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
          ],
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
          children: element.value,
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
});
