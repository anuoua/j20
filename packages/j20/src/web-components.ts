import { CustomElement, WCFC } from "./types";
import { signal } from "./api/signal";
import { computed } from "./api/computed";
import { getCurrentInstance, Instance, instanceCreate } from "./h/instance";
import { SignalLike } from "./api/types";
import { BRAND } from "./brand";
import { createWebComponent } from "./h/createWebComponent";

let host: HTMLElement | undefined;

export const setHost = (h: HTMLElement | undefined) => (host = h);

export const getHost = () => host;

export const registWebComponents = (Comp: WCFC) => {
  if (!Comp.customElement) {
    throw new Error("Custom element options is not provided");
  }

  if (customElements.get(Comp.customElement.tag)) {
    throw new Error("Custom element tag is already defined");
  }

  const NewClass = buildClass(Comp);

  customElements.define(Comp.customElement.tag, NewClass);
};

export const buildClass = (Comp: WCFC) => {
  const { customElement } = Comp;
  const { a2p, a2v } = buildMap(customElement);

  return class NewElementClass extends HTMLElement {
    static brand = BRAND;

    static get observedAttributes() {
      return Object.entries(customElement.props ?? {})
        .map(([, value]: any) => value.attribute)
        .filter((i) => i != undefined);
    }

    #shadow: ShadowRoot | undefined;

    _props: Record<string, SignalLike> = {};

    props: Record<string, any> = {};

    lazy: boolean;

    constructor(lazy: boolean) {
      super();

      this.lazy = lazy;

      if (customElement.tag && customElement.shadow !== "none") {
        this.#shadow = this.attachShadow({ mode: customElement.shadow });
      }

      this._props = Object.entries(customElement.props ?? {}).reduce(
        (acc, [key, value]: any) => {
          acc[key] = signal(
            value.attribute
              ? a2v[value.attribute](this.getAttribute(value.attribute))
              : undefined
          );
          return acc;
        },
        {} as Record<string, SignalLike>
      );

      const props = (this.props = new Proxy(this._props, {
        get(target, key: string) {
          return target[key]?.value;
        },
        set(target, key: string, value) {
          target[key].value = value;
          return true;
        },
      }));
    }

    initComp() {
      setHost(this);

      const [instance, fragment] = instanceCreate(() => {
        return Comp(computed(() => this.props));
      }, getCurrentInstance());

      setHost(undefined);

      if (this.#shadow) {
        this.#shadow.appendChild(fragment);
      } else {
        this.appendChild(fragment);
      }
    }

    appendTo(elements: HTMLElement[]) {
      if (this.#shadow && elements.length > 0) {
        this.#shadow.append(...elements);
      } else {
        this.append(...elements);
      }
    }

    appendToLightDom(elements: HTMLElement[]) {
      if (this.#shadow && elements.length > 0) {
        this.append(...elements);
      }
    }

    attributeChangedCallback(
      name: string,
      oldValue: string | null,
      newValue: string | null
    ) {
      if (this.lazy) return;
      const attrs = NewElementClass.observedAttributes;
      const propSignal = this._props[a2p[name]];
      if (propSignal && attrs.includes(name)) {
        propSignal.value = a2v[name](newValue);
      }
    }
  };
};

const buildMap = (customElement: CustomElement) => {
  const a2p: Record<string, string> = {};
  const p2a: Record<string, string> = {};
  const a2v: Record<string, any> = {};

  Object.entries(customElement.props ?? {})
    .map(([key, value]: any) => [value.attribute, key, value.type] as const)
    .filter(([attr]) => attr != undefined)
    .forEach((i) => {
      a2p[i[0] as unknown as string] = i[1];
      p2a[i[1]] = i[0] as unknown as string;
      a2v[i[0] as unknown as string] = {
        string: (v: string | null) => v ?? undefined,
        number: (v: string | null) => (v ? Number(v) : undefined),
        boolean: (v: string | null) => (v == null ? false : true),
      }[i[2] as "string" | "number" | "boolean"];
    });

  return { a2p, p2a, a2v };
};
