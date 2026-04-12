import { createElement } from "./createElement";
import { hostStack } from "./createWebComponent";
import { instanceCreate } from "./instance";

export const createRoot = (
  boot: (...args: any[]) => JSX.Element,
  rootElement: Element
) => {
  let rootHost: any = rootElement;

  while (true) {
    if (rootHost instanceof ShadowRoot || rootHost === document) {
      break;
    }
    rootHost = rootHost.parentNode;
  }

  hostStack.push(rootHost);

  let [rootInstance, fragment] = instanceCreate(() =>
    createElement(boot, null, null)
  );

  hostStack.pop();

  rootElement.append(fragment);

  return rootInstance;
};
