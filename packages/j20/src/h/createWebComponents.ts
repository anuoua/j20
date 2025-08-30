import { instanceCreate } from "./instance";
import { computed } from "../api/computed";
import { FC, WCFC } from "../types";
import { untrackedReturn } from "../api/untracked-return";
import { BRAND } from "../brand";
import { buildClass } from "../web-components";
import { getChildren } from "./utils";

export const createWebComponent = (
  tag: WCFC,
  props: undefined | (() => any)
) => {
  const runner = () => {
    const customElement = tag.customElement!;

    const Exist = customElements.get(customElement.tag);

    let el: HTMLElement | undefined;

    if (Exist) {
      if ((Exist as any).brand !== BRAND) {
        throw new Error(
          `Custom element [${customElement.tag}] is already registered`
        );
      } else {
        el = new Exist(true);
      }
    } else {
      const NewClass = buildClass(customElement, tag);
      customElements.define(customElement.tag, NewClass);
      el = new NewClass(true);
    }

    let childrenGetter = () =>
      untrackedReturn(() => (props ? props().children : undefined));

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

    (el as any).appendTo(getChildren([].concat(ret)));

    childrenGetter &&
      (el as any).appendToLightDom(getChildren([].concat(childrenGetter())));

    return el;
  };

  let [, fragment] = instanceCreate(runner as any);
  return fragment;
};
