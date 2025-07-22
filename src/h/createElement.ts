import { createComponent } from "./createComponent";
import { createDom } from "./createDom";

export const createElement = (tag: string | FC, props: Props) => {
  return typeof tag === "string"
    ? createDom(tag, props)
    : createComponent(tag, props);
};
