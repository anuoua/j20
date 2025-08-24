import { FC } from "../types";
import { createComponent } from "./createComponent";
import { createDom } from "./createDom";
import { createLogicComponent } from "./createLogicComponent";

export const createElement = (
  tag: HTMLElement | SVGElement | FC,
  props: any,
  children: any
) => {
  return tag instanceof Node
    ? createDom(tag, props, children)
    : tag.isLogic
      ? createLogicComponent(tag, props)
      : createComponent(tag, props);
};
