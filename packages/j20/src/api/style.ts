import { getCurrentHost } from "../h/createWebComponent";
import { WebComponentClass } from "../web-components";
import { onDestroy } from "./onDestroy";
import {
  addStyleSheet,
  createStyleSheet,
  cssHash,
  removeStyleSheet,
} from "./utils";

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
