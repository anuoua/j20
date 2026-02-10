import { effect } from "../api/effect";
import { add, getChildren, unset, update } from "./utils";

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
    // 独立 wc 初始化时 mode 为空时，忽略 children
    ((node as any).lazyInit
      ? !(node as any).customElement.mode
        ? false
        : true
      : true)
  ) {
    node.append(...getChildren([].concat(children())));
  }

  return node;
};
