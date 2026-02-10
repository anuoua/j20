import { effect } from "../api/effect";
import { getCurrentInstance } from "./instance";

export const isEvent = (eventName: string) => {
  return eventName.startsWith("on");
};

export const getEventName = (eventName: string) => {
  return eventName.slice(2).toLowerCase();
};

export const getChildren = (propChildren: any[]) => {
  const arr: any[] = [];
  for (let i = 0; i < propChildren.length; i++) {
    const child = propChildren[i];
    if (typeof child === "function") {
      let textNode: Text | undefined;
      const effectInstance = effect(() => {
        const el = child();
        if (typeof el === "number" || typeof el === "string") {
          if (textNode) {
            textNode.nodeValue = el + "";
          } else {
            textNode = document.createTextNode(el + "");
            arr.push(textNode);
          }
        } else {
          arr.push(el);
        }
      });
      if (!textNode) {
        effectInstance.dispose();
      }
    } else if (child != undefined) {
      arr.push(child);
    }
  }
  return arr;
};

let overflow = "";
let count = 0;

export const generateId = () => {
  if (count === Number.MAX_SAFE_INTEGER) {
    overflow += count.toString(32);
    count = 0;
  }
  return `${overflow}${(count++).toString(32)}`;
};

export const styleObjectToString = (style: Record<string, string | number>) => {
  let styleString = "";
  for (const key in style) {
    const value = style[key];
    styleString += `${key}: ${value}; `;
  }
  return styleString.trim();
};

export const update = (
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

export const unset = (
  node: HTMLElement | SVGElement,
  key: string,
  oldValue: any
) => {
  if (isEvent(key)) {
    node.removeEventListener(getEventName(key), oldValue);
  } else if (key === "ref") {
    oldValue.current = null;
  } else {
    node.removeAttribute(key);
  }
};

export const add = (
  node: HTMLElement | SVGElement,
  key: string,
  newValue: any
) => {
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

export const bindNode = (node: HTMLElement | SVGElement, props: () => any) => {
  let oldProps: any = {};
  effect(() => {
    const newProps = { ...props() };

    const newKeys = Object.keys(newProps);
    const oldKeys = Object.keys(oldProps);
    const allKeys = new Set([...newKeys, ...oldKeys]);

    for (const key of allKeys) {
      if (key === "children") continue;
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
};
