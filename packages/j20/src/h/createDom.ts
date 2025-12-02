import { effect } from "../api/effect";
import {
  getChildren,
  getEventName,
  isEvent,
  styleObjectToString,
} from "./utils";
import { getCurrentInstance } from "./instance";

const update = (
  node: HTMLElement | SVGElement,
  key: string,
  oldValue: any,
  newValue: any
) => {
  if (isEvent(key)) {
    node.removeEventListener(getEventName(key), oldValue);
    node.addEventListener(getEventName(key), newValue);
  } else {
    if (newValue === false || newValue == null) {
      node.removeAttribute(key);
    } else {
      const value =
        key === "style" && typeof newValue === "object"
          ? styleObjectToString(newValue)
          : newValue === true
            ? ""
            : newValue;
      node.setAttribute(key, value);
    }
  }
};

const unset = (node: HTMLElement | SVGElement, key: string, oldValue: any) => {
  if (isEvent(key)) {
    node.removeEventListener(getEventName(key), oldValue);
  } else if (key === "ref") {
    oldValue.current = null;
  } else {
    node.removeAttribute(key);
  }
};

const add = (node: HTMLElement | SVGElement, key: string, newValue: any) => {
  if (isEvent(key)) {
    node.addEventListener(getEventName(key), newValue);
  } else if (key === "ref") {
    const instance = getCurrentInstance();
    if (instance) {
      if (!instance.disposes) instance.disposes = [];
      instance.disposes.push(() => {
        newValue.current = null;
      });
    }
    newValue.current = node;
  } else {
    if (newValue !== false && newValue != null) {
      const value =
        key === "style" && typeof newValue === "object"
          ? styleObjectToString(newValue)
          : newValue === true
            ? ""
            : newValue;
      node.setAttribute(key, value);
    }
  }
};

export const createDom = (
  tag: HTMLElement | SVGElement,
  props: undefined | (() => any),
  children: undefined | (() => any)
) => {
  const node = tag;

  let oldProps: any = {};

  props &&
    effect(() => {
      const newProps = { ...props() };

      const newKeys = Object.keys(newProps);
      const oldKeys = Object.keys(oldProps);
      const allKeys = new Set([...newKeys, ...oldKeys]);

      for (const key of allKeys) {
        oldKeys.includes(key)
          ? newKeys.includes(key)
            ? Object.is(oldProps[key], newProps[key])
              ? null
              : update(node, key, oldProps[key], newProps[key])
            : unset(node, key, oldProps[key])
          : add(node, key, newProps[key]);
      }

      oldProps = newProps;
    });

  // 独立 wc 初始化
  (node as any).lazyInit?.();

  if (
    children &&
    // 独立 wc 初始化时 mode 为 none 时，忽略 children
    ((node as any).lazyInit ? (!node.shadowRoot ? false : true) : true)
  ) {
    node.append(...getChildren([].concat(children())));
  }

  return node;
};
