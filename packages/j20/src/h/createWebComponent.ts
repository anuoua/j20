import { instanceCreate } from "./instance";
import { computed } from "../api/computed";
import { WC } from "../types";
import { untrack } from "../api/untrack";
import { BRAND } from "../brand";
import { buildClass, WebComponentClass } from "../web-components";
import { getChildren, nodeAttributesEffect } from "./utils";

export const hostStack: (WebComponentClass | Document)[] = [];

export const getCurrentHost = () => {
  return hostStack.at(-1);
};

export const createWebComponent = (tag: WC, props: undefined | (() => any)) => {
  const customElement = tag.customElement!;

  const Exist = customElements.get(customElement.tag);

  let el: WebComponentClass | undefined;

  if (Exist) {
    if ((Exist as any).brand !== BRAND) {
      throw new Error(
        `Custom element [${customElement.tag}] is already registered`
      );
    } else {
      el = new Exist() as unknown as WebComponentClass;
    }
  } else {
    const NewClass = buildClass(tag);
    customElements.define(customElement.tag, NewClass);
    el = new NewClass();
  }

  const runner = () => {
    const ret: any = tag(
      computed(() => {
        const retProps = props ? props() : {};
        delete retProps.children;
        return retProps;
      })
    );

    // children 是惰性 thunk：调用得到内容（静态内容约定），untrack 隔离创建
    const childrenGetter = () =>
      untrack(() => {
        const c = props ? props().children : undefined;
        return typeof c === "function" ? c() : c;
      });

    if (el.customElement.mode) {
      (el as any).appendToShadowDom(getChildren([].concat(ret)));
      const lightChildren = childrenGetter();
      lightChildren != null &&
        (el as any).appendToLightDom(
          getChildren([].concat(lightChildren))
        );
    } else {
      (el as any).appendToBody(getChildren([].concat(ret)));
    }

    let attributesGetter = () => {
      const attrs = props ? props() : {};
      const attrList = Object.values(tag.customElement.props ?? {}).map(
        (i: any) => i.attribute
      );
      for (const attr of attrList) {
        delete attrs[attr];
      }
      delete attrs.children;
      return attrs;
    };

    nodeAttributesEffect(el, attributesGetter);

    return el;
  };

  hostStack.push(el);

  let [, fragment] = instanceCreate(runner as any);

  hostStack.pop();

  return fragment;
};
