import { getCurrentInstance } from "../h/instance";
import { ExtractClasses } from "../types";
import { WebComponentClass } from "../web-components";
import { onDestroy } from "./onDestroy";
import { addStyleSheet, removeStyleSheet } from "./utils";

let count = BigInt(0);

const getId = () => (++count).toString(32);

const refWeakMap = new WeakMap<
  WebComponentClass,
  { id: string; refCount: number }[]
>();

export const createCss = <T extends string>(css: T) => {
  const id = getId();

  return () => {
    const styleId = id;
    const replacedCss = css.replace(
      /\.(\w[\w-]*)\s*?\{/g,
      (_: string, className: string) => {
        return `.${className}_${styleId} {`;
      }
    );
    styleSheet(id, replacedCss);
    return new Proxy({} as any, {
      get: (_, prop: string) => {
        return `${prop}_${styleId}`;
      },
    }) as { [K in ExtractClasses<T>]: string };
  };
};

const addReference = (host: WebComponentClass, id: string, add: () => void) => {
  if (!refWeakMap.get(host)) {
    refWeakMap.set(host, []);
  }

  const states = refWeakMap.get(host) ?? [];

  const state = states.find((state) => state.id === id);

  if (!state) {
    refWeakMap.set(host, [
      ...states,
      {
        id,
        refCount: 1,
      },
    ]);
    add();
  } else {
    state.refCount++;
  }
};

const removeReference = (
  host: WebComponentClass,
  id: string,
  remove: () => void
) => {
  const states = refWeakMap.get(host) ?? [];

  const state = states.find((state) => state.id === id);

  if (state) {
    state.refCount--;

    if (state.refCount === 0) {
      remove();
      refWeakMap.set(
        host,
        states.filter((state) => state.id !== id)
      );
    }
  }
};

export const styleSheet = (id: string, css?: string) => {
  let instance = getCurrentInstance();
  const sheet = new CSSStyleSheet();
  css && sheet.replaceSync(css);
  let root: Element | undefined;
  while (instance) {
    if (instance.host) {
      const host = instance.host;

      addReference(host, id, () => {
        host.addStyleSheet(sheet);
      });

      onDestroy(() => {
        removeReference(host, id, () => host.removeStyleSheet(sheet));
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

    addReference(node, id, () => {
      addStyleSheet(node, sheet);
    });

    onDestroy(() => {
      removeReference(node, id, () => {
        removeStyleSheet(node, sheet);
      });
    });
  }

  return sheet;
};
