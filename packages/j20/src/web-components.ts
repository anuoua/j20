import { CustomElement, WC } from "./types";
import { signal } from "./api/signal";
import { computed } from "./api/computed";
import { getCurrentInstance, instanceCreate } from "./h/instance";
import { SignalLike } from "./api/types";
import { BRAND } from "./brand";
import { hostStack } from "./h/createWebComponent";

export const registerWebComponent = <C extends WC<any, any>>(Comp: C) => {
  if (!Comp.customElement) {
    throw new Error("Custom element options is not provided");
  }

  if (customElements.get(Comp.customElement.tag)) {
    throw new Error("Custom element tag is already defined");
  }

  const NewClass = buildClass(Comp);

  customElements.define(Comp.customElement.tag, NewClass);
};

export abstract class WebComponentClass extends HTMLElement {
  abstract customElement: CustomElement;

  constructor() {
    super();
  }

  addStyleSheet(sheet: CSSStyleSheet) {}

  removeStyleSheet(sheet: CSSStyleSheet) {}
}

export const buildClass = (Comp: WC) => {
  const { customElement } = Comp;
  const { a2p, a2v } = buildMap(customElement);

  const styleSheet = customElement.style
    ? typeof customElement.style === "string"
      ? (() => {
          const style = new CSSStyleSheet();
          style.replaceSync(customElement.style);
          return style;
        })()
      : customElement.style
    : null;

  return class NewElementClass extends HTMLElement {
    static get observedAttributes() {
      return Object.entries(customElement.props ?? {})
        .map(([, value]: any) => value.attribute)
        .filter((i) => i != undefined);
    }

    static brand = BRAND;
    brand = BRAND;

    #shadow: ShadowRoot | undefined;

    #props: Record<string, SignalLike> = {};

    customElement = customElement;

    constructor() {
      super();

      if (customElement.tag && customElement.mode) {
        this.#shadow = this.attachShadow({ mode: customElement.mode });
        if (styleSheet) this.#shadow.adoptedStyleSheets = [styleSheet];
      }

      this.#props = Object.entries(customElement.props ?? {}).reduce(
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
    }

    lazyInit() {
      const host = this;

      hostStack.push(host);

      const [, fragment] = instanceCreate(() => {
        return Comp(
          computed(() => {
            return new Proxy(this.#props, {
              get(target, p, receiver) {
                if (typeof p === "string" && p.startsWith("on")) {
                  return (detail: any) =>
                    host.dispatchEvent(
                      new CustomEvent(p.slice(2).toLocaleLowerCase(), {
                        detail,
                      })
                    );
                } else {
                  return Reflect.get(target, p, receiver)?.value;
                }
              },
            });
          })
        );
      }, getCurrentInstance());

      hostStack.pop();

      if (this.#shadow) {
        this.#shadow.appendChild(fragment);
      } else {
        this.appendChild(fragment);
      }
    }

    appendToShadowDom(elements: HTMLElement[]) {
      if (this.#shadow && elements.length > 0) {
        this.#shadow.append(...elements);
      }
    }

    appendToLightDom(elements: HTMLElement[]) {
      if (this.#shadow && elements.length > 0) {
        this.append(...elements);
      }
    }

    appendToBody(elements: HTMLElement[]) {
      if (elements.length > 0) {
        this.append(...elements);
      }
    }

    addStyleSheet(sheet: CSSStyleSheet) {
      if (this.#shadow) {
        this.#shadow.adoptedStyleSheets.push(sheet);
      }
    }

    removeStyleSheet(sheet: CSSStyleSheet) {
      if (this.#shadow) {
        this.#shadow.adoptedStyleSheets =
          this.#shadow.adoptedStyleSheets.filter((s) => s !== sheet);
      }
    }

    attributeChangedCallback(
      name: string,
      oldValue: string | null,
      newValue: string | null
    ) {
      const attrs = NewElementClass.observedAttributes;
      const propSignal = this.#props[a2p[name]];
      if (propSignal && attrs.includes(name)) {
        propSignal.value = a2v[name](newValue);
      }
    }

    #connectedCallbackArray: Array<() => void> = [];

    addConnectedCallback(callback: () => void) {
      this.#connectedCallbackArray.push(callback);
    }

    connectedCallback() {
      this.#connectedCallbackArray.forEach((fn) => fn());
    }

    #disconnectedCallbackArray: Array<() => void> = [];

    addDisconnectedCallback(callback: () => void) {
      this.#disconnectedCallbackArray.push(callback);
    }

    disconnectedCallback() {
      this.#disconnectedCallbackArray.forEach((fn) => fn());
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
