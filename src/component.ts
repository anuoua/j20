import { EffectScope, Ref } from "@vue/reactivity";

export interface Instance {
  host?: HTMLElement;
  indexStart?: HTMLElement;
  indexEnd?: HTMLElement;
  effectScope: EffectScope;
}

export type Prop<T> = T | Ref<T>;

let id = 0;
let currentInstance: Instance | undefined;

export const getCurrentInstance = () => currentInstance;

interface DefineOption {
  tag?: string;
  shadow?: boolean;
}

type DefineComponent = {
  <T extends object, P extends DefineOption>(
    opt: P,
    fn: (p: T) => HTMLElement | HTMLElement[]
  ): undefined extends P["tag"] ? HTMLElement[] : HTMLElement;
};

export const defineComponent = <T extends object, P extends DefineOption>(
  opt: P,
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

    let host: HTMLElement = undefined!;
    let indexStart: HTMLElement = undefined!;
    let indexEnd: HTMLElement = undefined!;

    if (opt.tag) {
      host = document.createElement(opt.tag);
    } else {
      const i = id++;
      indexStart = document.createComment(i + "s") as unknown as HTMLElement;
      indexEnd = document.createComment(i + "e") as unknown as HTMLElement;
      // @ts-ignore
      indexStart.__isStartIndex = true;
      // @ts-ignore
      indexEnd.__isEndIndex = true;
    }

    const instance: Instance = {
      host,
      indexStart,
      indexEnd,
      effectScope,
    };

    currentInstance = instance;

    effectScope.run(() => {
      const res = fn(p);
      result = Array.isArray(res) ? [...res] : [res];
    });

    if (isCustomElement) {
      isShadow ? host.shadowRoot?.append(...result) : host.append(...result);
      result = [host];
    } else {
      result = [indexStart, ...result, indexEnd];
    }

    // @ts-ignore
    (host ?? indexStart).__instance = instance;

    return (isCustomElement ? result[0] : result) as undefined extends P["tag"]
      ? HTMLElement[]
      : HTMLElement;
  };
};
