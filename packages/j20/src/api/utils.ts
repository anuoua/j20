export const isSignal = (a: any) => a?.SIGNAL === true;

export const addStyleSheet = (
  node: ShadowRoot | Document,
  styleSheet: CSSStyleSheet
) => {
  if (
    node.adoptedStyleSheets &&
    !node.adoptedStyleSheets.includes(styleSheet)
  ) {
    node.adoptedStyleSheets = [...node.adoptedStyleSheets, styleSheet];
  }
};

export const removeStyleSheet = (
  node: ShadowRoot | Document,
  styleSheet: CSSStyleSheet
) => {
  if (node.adoptedStyleSheets && node.adoptedStyleSheets.includes(styleSheet)) {
    const newSet = new Set(node.adoptedStyleSheets);
    newSet.delete(styleSheet);
    node.adoptedStyleSheets = Array.from(newSet);
  }
};
