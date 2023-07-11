import { EffectScope, Ref } from "@vue/reactivity";

export interface Instance {
  host?: HTMLElement;
  indexStart?: HTMLElement;
  indexEnd?: HTMLElement;
  effectScope: EffectScope;
}

export type Prop<T> = T | Ref<T>;

export type Props<T extends object = {}, T2 extends object = {}> = {
  [K in keyof T]: Prop<T[K]>;
} & {
  [K2 in keyof T2]: T2[K2];
};

let currentInstance: Instance | undefined;

export const getCurrentInstance = () => currentInstance;

interface DefineOption {
  tag: string;
  shadow?: boolean;
}

export const defineComponent = <
  T extends Record<string, any>,
  P extends DefineOption
>(
  opt: P,
  fn: (p: T) => HTMLElement
) => {
  class TagElement extends HTMLElement {
    __instance: Instance = undefined!;

    constructor() {
      super();
    }

    init(p: T) {
      if (opt.shadow) this.attachShadow({ mode: "open" });

      let result: HTMLElement[] = undefined!;

      const effectScope = new EffectScope();

      const instance: Instance = {
        host: this,
        effectScope,
      };

      currentInstance = instance;
      this.__instance = instance;

      effectScope.run(() => {
        result = [fn(p)].flat();
      });

      (this.shadowRoot ?? this).append(...result);

      return this;
    }
  }

  customElements.define(opt.tag, TagElement);

  return (p: T = {} as T) => {
    const el = document.createElement(opt.tag);
    // @ts-ignore
    return el.init(p);
  };
};

export const defineFragment = <T>(fn: (p: T) => HTMLElement[]) => {
  return (p: T = {} as T) => {
    let result: HTMLElement[] = undefined!;
    const effectScope = new EffectScope();

    let indexStart = document.createComment("s") as unknown as HTMLElement;
    let indexEnd = document.createComment("e") as unknown as HTMLElement;

    const instance: Instance = {
      indexStart,
      indexEnd,
      effectScope,
    };

    currentInstance = instance;

    effectScope.run(() => {
      result = [fn(p)].flat();
    });

    result = [indexStart, ...result, indexEnd];

    // @ts-ignore
    indexStart.__instance = instance;

    return result;
  };
};
