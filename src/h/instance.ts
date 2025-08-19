import { createDom } from "./createDom";
import { generateId } from "./utils";

export interface Instance {
  parent?: Instance;
  id: string;
  range: Comment[];
  disposes: (() => void)[];
  children?: Instance[];
}

const stack: Instance[] = [];

export const getCurrentInstance = () => stack.at(-1);

export const instanceCreate = <T extends () => any>(
  runner: T,
  parent?: Instance
) => {
  const id = generateId();
  const parentInstance = parent ?? getCurrentInstance();
  const instance: Instance = {
    parent: parentInstance,
    id,
    range: [document.createTextNode(""), document.createTextNode("")],
    disposes: [],
  };

  if (parentInstance) {
    if (parentInstance.children) {
      parentInstance.children.push(instance);
    } else {
      parentInstance.children = [instance];
    }
  }

  stack.push(instance);

  const children = (() => {
    let res = runner();
    return Array.isArray(res) ? res : [res];
  })();

  const fragment = createDom(document.createDocumentFragment() as unknown as HTMLElement, undefined, () => children) as unknown as HTMLElement;

  fragment.prepend(instance.range[0]);
  fragment.append(instance.range[1]);

  stack.pop();

  return [instance, fragment] as const;
};

export const instanceGetElements = (instance: Instance) => {
  const [start, end] = instance.range;

  const els: Node[] = [start];

  let index: Node | null = start;

  while ((index = index.nextSibling)) {
    els.push(index);
    if (index === end) break;
  }

  return els;
};

export const instanceDestroy = (
  parent: Instance,
  instance: Instance
) => {
  const stack = [instance];
  while (stack.length) {
    const instance = stack.pop()!;
    instance.disposes.forEach((dispose) => dispose());
    if (instance.children) {
      stack.push(...instance.children);
    }
  }
};
