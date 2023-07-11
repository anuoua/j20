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

export const defineComponent = <T extends object, P extends DefineOption>(
  opt: P,
  fn: (p: T) => HTMLElement | HTMLElement[]
) => {
  customElements.define(
    opt.tag,
    class extends HTMLElement {
      constructor() {
        super();
        if (opt.shadow) this.attachShadow({ mode: "open" });
      }
    }
  );

  return (p: T = {} as T) => {
    let result: HTMLElement[] = undefined!;

    const effectScope = new EffectScope();

    const host: HTMLElement = document.createElement(opt.tag);

    const instance: Instance = {
      host,
      effectScope,
    };

    currentInstance = instance;

    effectScope.run(() => {
      result = [fn(p)].flat();
    });

    (host.shadowRoot ?? host).append(...result);

    // @ts-ignore
    host.__instance = instance;

    return host;
  };
};

export const defineFragment = <T>(
  fn: (p: T) => HTMLElement | HTMLElement[]
) => {
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
