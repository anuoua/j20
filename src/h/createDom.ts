import { effect } from "../api/effect";
import { getEventName, isEvent } from "../utils";
import { getChildren } from "./utils";
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
    node.setAttribute(key, newValue);
  }
};

const unset = (node: HTMLElement | SVGElement, key: string, oldValue: any) => {
  if (isEvent(key)) {
    node.removeEventListener(getEventName(key), oldValue);
  } else if (key === 'ref') {
    oldValue.current = null;
  } else {
    node.removeAttribute(key);
  }
};

const add = (node: HTMLElement | SVGElement, key: string, newValue: any) => {
  if (isEvent(key)) {
    node.addEventListener(getEventName(key), newValue);
  } else if (key === 'ref') {
    const instance = getCurrentInstance();
    instance?.disposes.push(() => {
      newValue.current = null;
    });
    newValue.current = node;
  } else {
    node.setAttribute(key, newValue);
  }
};

export const createDom = (tag: HTMLElement | SVGElement, props: any) => {
  const node = tag;
  let oldProps: any = {};

  effect(() => {
    const newProps = { ...props.value };

    const newKeys = Object.keys(newProps);
    const oldKeys = Object.keys(oldProps);
    const allKeys = new Set([...newKeys, ...oldKeys]);

    for (const key of allKeys) {
      if (key === "children") {
        continue;
      }
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

  node.append(...getChildren([].concat(oldProps.children)));

  return node;
};
