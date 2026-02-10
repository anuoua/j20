import { getCurrentInstance } from "../h/instance";
import { ExtractClasses } from "../types";
import { WebComponentClass } from "../web-components";
import { id } from "./id";
import { onDestroy } from "./onDestroy";

export const sheet = (css?: string) => {
  let instance = getCurrentInstance();
  const sheet = new CSSStyleSheet();
  css && sheet.replaceSync(css);
  while (instance) {
    if (instance.host) {
      (instance.host as WebComponentClass).addStyleSheet(sheet);
      onDestroy(() => {
        (instance!.host as WebComponentClass).removeStyleSheet(sheet);
      });
      break;
    }
    instance = instance?.parent;
  }
  if (!instance) {
    document.adoptedStyleSheets.push(sheet);
    onDestroy(() => {
      document.adoptedStyleSheets = document.adoptedStyleSheets.filter(
        (s) => s !== sheet
      );
    });
  }
  return sheet;
};

export const css = <T extends string>(css: T) => {
  const styleId = id();
  const replacedCss = css.replace(
    /\.(\w[\w-]*)\s*?\{/g,
    (_: string, className: string) => {
      return `.${className}_${styleId} {`;
    }
  );
  sheet(replacedCss);
  return new Proxy({} as any, {
    get: (_, prop: string) => {
      return `${prop}_${styleId}`;
    },
  }) as { [K in ExtractClasses<T>]: string };
};
