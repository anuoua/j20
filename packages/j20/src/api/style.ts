import { getCurrentHost } from "../h/createWebComponent";
import { ExtractClasses } from "../types";
import { WebComponentClass } from "../web-components";
import { onDestroy } from "./onDestroy";
import {
  addStyleSheet,
  createStyleSheet,
  cssHash,
  removeStyleSheet,
} from "./utils";

const refWeakMap = new WeakMap<
  WebComponentClass | Document | ShadowRoot,
  { id: string; refCount: number; styleSheet: CSSStyleSheet }[]
>();

export const createCss = <T extends string>(css: T) => {
  let id: string = undefined!;

  return () => {
    if (!id) id = cssHash(css);
    const classNameId = `j_${id}`;
    const replacedCss = css.replace(
      /\.(\w[\w-]*)\s*?\{/g,
      (_: string, className: string) => {
        return `.${className}_${classNameId} {`;
      }
    );
    styleSheet(replacedCss, id);
    return new Proxy({} as any, {
      get: (_, prop: string) => {
        return `${prop}_${classNameId}`;
      },
    }) as { [K in ExtractClasses<T>]: string };
  };
};

const addReference = (
  host: WebComponentClass | Document | ShadowRoot,
  id: string,
  css: string
) => {
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

const removeReference = (
  host: WebComponentClass | Document | ShadowRoot,
  id: string
) => {
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

export const styleSheet = (css: string, id?: string) => {
  const cssId = id ?? cssHash(css);
  const host = getCurrentHost();

  if (!host) throw new Error("host not found");

  addReference(host, cssId, css);

  onDestroy(() => {
    removeReference(host, cssId);
  });
};
