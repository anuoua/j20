import { getCurrentInstance } from "../h/instance";
import { ExtractClasses } from "../types";
import { WebComponentClass } from "../web-components";
import { onDestroy } from "./onDestroy";
import { addStyleSheet, createStyleSheet, removeStyleSheet } from "./utils";

let count = BigInt(0);

const getId = () => (++count).toString(32);

const refWeakMap = new WeakMap<
  WebComponentClass,
  { id: string; refCount: number; styleSheet: CSSStyleSheet }[]
>();

export const createCss = <T extends string>(css: T) => {
  const id = getId();

  return () => {
    const classNameId = `j_${id}`;
    const replacedCss = css.replace(
      /\.(\w[\w-]*)\s*?\{/g,
      (_: string, className: string) => {
        return `.${className}_${classNameId} {`;
      }
    );
    styleSheet(id, replacedCss);
    return new Proxy({} as any, {
      get: (_, prop: string) => {
        return `${prop}_${classNameId}`;
      },
    }) as { [K in ExtractClasses<T>]: string };
  };
};

const addReference = (host: WebComponentClass, id: string, css: string) => {
  if (!refWeakMap.get(host)) {
    refWeakMap.set(host, []);
  }

  const states = refWeakMap.get(host) ?? [];

  const state = states.find((state) => state.id === id);

  if (!state) {
    const newState = {
      id,
      refCount: 1,
      styleSheet: createStyleSheet(css),
    };
    refWeakMap.set(host, [...states, newState]);
    addStyleSheet(host, newState.styleSheet);
  } else {
    state.refCount++;
  }
};

const removeReference = (host: WebComponentClass, id: string) => {
  const states = refWeakMap.get(host) ?? [];

  const state = states.find((state) => state.id === id);

  if (state) {
    state.refCount--;

    if (state.refCount === 0) {
      refWeakMap.set(
        host,
        states.filter((state) => state.id !== id)
      );
      removeStyleSheet(host, state.styleSheet);
    }
  }
};

export const styleSheet = (id: string, css: string) => {
  let instance = getCurrentInstance();
  let root: Element | undefined;
  while (instance) {
    if (instance.host) {
      const host = instance.host;

      addReference(host, id, css);

      onDestroy(() => {
        removeReference(host, id);
      });

      break;
    }
    if (instance.root) {
      root = instance.root;
      break;
    }
    instance = instance?.parent;
  }

  if (root) {
    let node: any = root;

    do {
      if (node instanceof ShadowRoot || node === document) {
        break;
      }
      node = node.parentNode;
    } while (node);

    addReference(node, id, css);

    onDestroy(() => {
      removeReference(node, id);
    });
  }
};
