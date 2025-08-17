import { createComponent } from "./createComponent";
import { createDom } from "./createDom";

export const createElement = (tag: HTMLElement | SVGElement | FC, props: any) => {
  return tag instanceof Node
    ? createDom(tag, props)
    : createComponent(tag, props);
};
