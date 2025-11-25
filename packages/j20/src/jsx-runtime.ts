import { createElement } from "./index";

export const h2 = (tag: any, props: any, children: any) => {
  return createElement(tag, props, children);
};

export const jsx = h2;
export const jsxs = h2;
export const Fragment = (props: { children: JSX.Element }) =>
  (props as any).value.children;

export const template = (template: string) => {
  let dom: any;

  return (isSvg: boolean) => {
    if (!dom) {
      const templateEl = isSvg
        ? document.createElementNS("http://www.w3.org/2000/svg", "svg")
        : document.createElement("template");
      templateEl.innerHTML = template;
      dom = isSvg
        ? (templateEl as SVGSVGElement).firstChild
        : (templateEl as HTMLTemplateElement).content.firstChild;
    }
    return dom.cloneNode();
  };
};
