import { FC, WC } from "../types";
import { createComponent } from "./createComponent";
import { createDom } from "./createDom";
import { createLogicComponent } from "./createLogicComponent";
import { createWebComponent } from "./createWebComponent";

export const createElement = (
  tag: HTMLElement | SVGElement | FC | WC,
  props: any,
  children: any
) => {
  return tag instanceof Node
    ? createDom(tag, props, children)
    : "isLogic" in tag
      ? createLogicComponent(tag, props)
      : "customElement" in tag
        ? createWebComponent(tag, props)
        : createComponent(tag, props);
};
