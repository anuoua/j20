import { EffectScope, Ref } from "@vue/reactivity";

export interface Instance {
  el: HTMLElement;
  effectScope: EffectScope;
}

export type Prop<T> = T | Ref<T>;

let id = 0;
let currentInstance: Instance | undefined;

export const getCurrentInstance = () => currentInstance;

interface defineOpt {
  tag?: string;
  shadow?: boolean;
}

export const defineComponent = <T extends object>(
  opt: defineOpt,
  fn: (p: T) => HTMLElement | HTMLElement[]
) => {
  if (opt.tag) {
    customElements.define(
      opt.tag,
      class extends HTMLElement {
        constructor() {
          super();
          if (opt.shadow) this.attachShadow({ mode: "open" });
        }
      }
    );
  }

  return (p: T = {} as T) => {
    let result: HTMLElement[] = undefined!;
    const effectScope = new EffectScope();
    const isCustomElement = opt.tag !== undefined;
    const isShadow = opt.shadow ?? false;

    let anchorNode: HTMLElement = undefined!;

    if (opt.tag) {
      anchorNode = document.createElement(opt.tag);
    } else {
      anchorNode = document.createComment(id++ + "") as unknown as HTMLElement;
    }

    const instance: Instance = {
      el: anchorNode,
      effectScope,
    };

    currentInstance = instance;

    effectScope.run(() => {
      const res = fn(p);
      result = Array.isArray(res) ? [...res] : [res];
    });

    if (isCustomElement) {
      isShadow
        ? anchorNode.shadowRoot?.append(...result)
        : anchorNode.append(...result);
      result = [anchorNode];
    } else {
      result = [anchorNode, ...result];
    }

    // @ts-ignore
    anchorNode.__instance = instance;

    return isCustomElement ? result[0] : result;
  };
};
