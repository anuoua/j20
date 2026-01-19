import { getCurrentInstance } from "../h/instance";
import { WebComponentClass } from "../web-components";
import { onDestroy } from "./onDestroy";

export const style = (css?: string) => {
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
