import { WebComponentClass } from "../web-components";

export const isSignal = (a: any) => a?.SIGNAL === true;

export const createStyleSheet = (css: string) => {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(css);
  return sheet;
};

export const addStyleSheet = (
  node: ShadowRoot | Document | WebComponentClass,
  styleSheet: CSSStyleSheet
) => {
  if ("addStyleSheet" in node) {
    node.addStyleSheet(styleSheet);
  } else if (
    node.adoptedStyleSheets &&
    !node.adoptedStyleSheets.includes(styleSheet)
  ) {
    node.adoptedStyleSheets = [...node.adoptedStyleSheets, styleSheet];
  }
};

export const removeStyleSheet = (
  node: ShadowRoot | Document | WebComponentClass,
  styleSheet: CSSStyleSheet
) => {
  if ("removeStyleSheet" in node) {
    node.removeStyleSheet(styleSheet);
  } else if (
    node.adoptedStyleSheets &&
    node.adoptedStyleSheets.includes(styleSheet)
  ) {
    const newSet = new Set(node.adoptedStyleSheets);
    newSet.delete(styleSheet);
    node.adoptedStyleSheets = Array.from(newSet);
  }
};
