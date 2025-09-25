import { instanceCreate } from "./instance";
import { computed } from "../api/computed";
import { WC } from "../types";
import { untrackedReturn } from "../api/untracked-return";
import { BRAND } from "../brand";
import { buildClass, setHost, WebComponentClass } from "../web-components";
import { getChildren } from "./utils";

export const createWebComponent = (tag: WC, props: undefined | (() => any)) => {
  const runner = () => {
    const customElement = tag.customElement!;

    const Exist = customElements.get(customElement.tag);

    let el: WebComponentClass | undefined;

    if (Exist) {
      if ((Exist as any).brand !== BRAND) {
        throw new Error(
          `Custom element [${customElement.tag}] is already registered`
        );
      } else {
        el = new Exist(true) as unknown as WebComponentClass;
      }
    } else {
      const NewClass = buildClass(tag);
      customElements.define(customElement.tag, NewClass);
      el = new NewClass(true);
    }

    let childrenGetter = () =>
      untrackedReturn(() => (props ? props().children : undefined));

    setHost(el);

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

    setHost(undefined);

    if (el.customElement.shadow) {
      (el as any).appendToShadowDom(getChildren([].concat(ret)));
      childrenGetter &&
        (el as any).appendToLightDom(getChildren([].concat(childrenGetter())));
    } else {
      (el as any).appendToBody(getChildren([].concat(ret)));
    }

    return el;
  };

  let [, fragment] = instanceCreate(runner as any);
  return fragment;
};
