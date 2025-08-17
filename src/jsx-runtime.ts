import { createElement } from "./h/createElement";

export const h2 = (tag: any, props: any = { value: {} }) => {
    return createElement(tag, props);
};

export const jsx = h2;
export const jsxs = h2;
export const Fragment = ({ children }: { children: JSX.Element }) => children;

export const template = (template: string) => {
    let dom: any;

    return (isSvg: boolean) => {
        if (!dom) {
            const templateEl = isSvg ? document.createElementNS("http://www.w3.org/2000/svg", "svg") : document.createElement('div');
            templateEl.innerHTML = template;
            dom = templateEl.firstChild;
            return dom;
        } else {
            return dom.cloneNode();
        }
    }
}
