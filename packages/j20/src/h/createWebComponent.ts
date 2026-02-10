import { instanceCreate } from "./instance";
import { computed } from "../api/computed";
import { WC } from "../types";
import { untrack } from "../api/untrack";
import { BRAND } from "../brand";
import { buildClass, WebComponentClass } from "../web-components";
import { bindNode, getChildren } from "./utils";

export const hostStack: Element[] = [];

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

  props && bindNode(el, props);

  const runner = () => {
    let childrenGetter = () =>
      untrack(() => (props ? props().children : undefined));

    const ret: any = tag(
      computed(() => {
        const retProps = props ? props() : {};
        childrenGetter =
          Object.getOwnPropertyDescriptor(retProps, "children")?.get ??
          (() => undefined);
        delete retProps.children;
        return retProps;
      })
    );

    if (el.customElement.mode) {
      (el as any).appendToShadowDom(getChildren([].concat(ret)));
      childrenGetter &&
        (el as any).appendToLightDom(getChildren([].concat(childrenGetter())));
    } else {
      (el as any).appendToBody(getChildren([].concat(ret)));
    }

    return el;
  };

  hostStack.push(el);

  let [, fragment] = instanceCreate(runner as any);

  hostStack.pop();

  return fragment;
};
