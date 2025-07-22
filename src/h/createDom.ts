import { effect } from "../api/effect";
import { getEventName, isEvent } from "../utils";
import { getChildren, getProps } from "./utils";

const update = (
  node: HTMLElement,
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

const unset = (node: HTMLElement, key: string, oldValue: any) => {
  if (isEvent(key)) {
    node.removeEventListener(getEventName(key), oldValue);
  } else {
    node.removeAttribute(key);
  }
};

const add = (node: HTMLElement, key: string, newValue: any) => {
  if (isEvent(key)) {
    node.addEventListener(getEventName(key), newValue);
  } else {
    node.setAttribute(key, newValue);
  }
};

export const createDom = (tag: string, props: Props) => {
  const node =
    tag === "fragment"
      ? (document.createDocumentFragment() as unknown as HTMLElement)
      : document.createElement(tag);
  let oldProps: any = {};
  let children: any = null;

  effect(() => {
    const newProps = getProps(props);
    const newKeys = Object.keys(newProps);
    const oldKeys = Object.keys(oldProps);
    const allKeys = new Set([...newKeys, ...oldKeys]);

    for (const key of allKeys) {
      if (key === "children") {
        children = newProps.children;
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

  const arr = getChildren(children.value);

  for (const i of arr) {
    i != null && node.append(i);
  }

  return node;
};
