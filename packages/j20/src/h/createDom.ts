import { getChildren, nodeAttributesEffect } from "./utils";

export const createDom = (
  tag: HTMLElement | SVGElement,
  props: undefined | (() => any),
  children: undefined | (() => any)
) => {
  const node = tag;

  props && nodeAttributesEffect(node, props);

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
