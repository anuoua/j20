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
