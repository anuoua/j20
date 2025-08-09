import { createElement } from "./h/createElement";

export const h2 = (tag: any, props: any) => {
    return createElement(tag, props);
};

export const jsx = h2;
export const jsxs = h2;
export const Fragment = ({ children }: { children: JSX.Element }) => children;
