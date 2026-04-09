import { createElement } from "./createElement";
import { Instance, instanceCreate } from "./instance";
import { generateId } from "./utils";

export const createRoot = (
  boot: (...args: any[]) => JSX.Element,
  rootElement: Element
) => {
  const rootInstance: Instance = {
    root: rootElement,
    id: generateId(),
    range: [document.createTextNode(""), document.createTextNode("")],
  };

  let [, fragment] = instanceCreate(
    () => createElement(boot, null, null),
    rootInstance
  );

  rootElement.append(rootInstance.range[0], fragment, rootInstance.range[1]);

  return rootInstance;
};
