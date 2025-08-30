import { FC, WCFC } from "../types";
import { createComponent } from "./createComponent";
import { createDom } from "./createDom";
import { createLogicComponent } from "./createLogicComponent";
import { createWebComponent } from "./createWebComponents";

export const createElement = (
  tag: HTMLElement | SVGElement | FC | WCFC,
  props: any,
  children: any
) => {
  return tag instanceof Node
    ? createDom(tag, props, children)
    : (tag as FC).isLogic
      ? createLogicComponent(tag, props)
      : (tag as WCFC).customElement
        ? createWebComponent(tag, props)
        : createComponent(tag, props);
};
