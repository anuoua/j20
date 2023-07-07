import { isRef, effect } from "@vue/reactivity";
import type { Ref } from "@vue/reactivity";
import { IntrinsicElementAttributes } from "../jsx";
import { Prop } from "./component";
import { prop } from "./utils";

export type Tags = {
  [K in keyof IntrinsicElementAttributes]: (
    p:
      | {
          [K2 in keyof IntrinsicElementAttributes[K]]:
            | IntrinsicElementAttributes[K][K2]
            | Ref<IntrinsicElementAttributes[K][K2]>;
        }
      | undefined,
    ...children: (HTMLElement | HTMLElement[])[]
  ) => HTMLElement;
};

const h = (
  tag: string,
  p: any = {},
  children: HTMLElement[] | HTMLElement[][] = []
) => {
  const isText = tag === "text";
  const el = isText
    ? (document.createTextNode(p.nodeValue) as unknown as HTMLElement)
    : document.createElement(tag);
  const setAttrs = () => {
    Object.keys(p).forEach((key) => {
      const isEvent = key.startsWith("on");
      const isStyle = key === "style";
      const isAttr = !isEvent && !isStyle;
      const val = isRef(p[key]) ? p[key].value : p[key];

      if (isText) {
        el.nodeValue = val;
      } else if (isEvent) {
        el.addEventListener(key.slice(2).toLowerCase(), val);
      } else if (isAttr) {
        el.setAttribute(key, val);
      } else {
        typeof val === "string"
          ? (el.style.cssText = val)
          : Object.assign(el.style, val);
      }
    });
  };
  effect(() => {
    setAttrs();
  });
  !isText && children.length > 0 && el.append(...children.flat());
  return el;
};

export const tags = new Proxy<Tags>({} as any, {
  get(target, tag: string) {
    return (props: any, ...children: any[]) => {
      return h(tag, props, children);
    };
  },
});

export const str = (s: Prop<string>) => h("text", { nodeValue: prop(s)() });
