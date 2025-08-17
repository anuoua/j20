import { createComponent } from "./createComponent";
import { createDom } from "./createDom";

export const createElement = (tag: HTMLElement | SVGElement | FC, props: any, children: any) => {
  return tag instanceof Node
    ? createDom(tag, props, children)
    : createComponent(tag, props, children);
};
