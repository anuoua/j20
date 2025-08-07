import { createComponent } from "./createComponent";
import { createDom } from "./createDom";

export const createElement = (tag: string | FC, props: any) => {
  return typeof tag === "string"
    ? createDom(tag, props)
    : createComponent(tag, props);
};
