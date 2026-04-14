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

function replaceTopLevelSelectors(css: string, id: string) {
  let depth = 0;
  let result = "";
  let lastSlice = 0;
  for (let i = 0; i < css.length; i++) {
    if (css[i] === "{") {
      if (depth === 0) {
        result +=
          css
            .slice(lastSlice, i)
            .replace(/\.(\w[\w-]*)/g, (_, name) => `.${name}_${id}`) + "{";
        lastSlice = i + 1;
      }
      depth++;
    } else if (css[i] === "}") {
      depth--;
      if (depth === 0) {
        result += css.slice(lastSlice, i + 1);
        lastSlice = i + 1;
      }
    }
  }
  result += css.slice(lastSlice);
  return result;
}

export const createCssModule = <T extends string>(css: T) => {
  let hash: string = undefined!;
  let replacedCss: string = undefined!;

  return () => {
    if (!hash) hash = cssHash(css);
    if (!replacedCss) replacedCss = replaceTopLevelSelectors(css, hash);
    styleSheet(replacedCss, hash);
    return new Proxy({} as any, {
      get: (_, prop: string) => {
        return `${prop}_${hash}`;
      },
    }) as { [K in ExtractClasses<T>]: string };
  };
};

const addReference = (
  host: WebComponentClass | Document | ShadowRoot,
  id: string,
  css: string
) => {
  const currentSheet = (host as any)[id] as any;
  if (!currentSheet) {
    const sheet = createStyleSheet(css);
    (sheet as any).refCount = 1;
    (host as any)[id] = sheet;
    addStyleSheet(host, sheet);
  } else {
    currentSheet.refCount++;
  }
};

const removeReference = (
  host: WebComponentClass | Document | ShadowRoot,
  id: string
) => {
  const currentSheet = (host as any)[id] as any;

  if (currentSheet) {
    currentSheet.refCount--;

    if (currentSheet.refCount === 0) {
      removeStyleSheet(host, currentSheet);
      delete (currentSheet as any).refCount;
      delete (host as any)[id];
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
