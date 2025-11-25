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

export const instanceInit = (parent?: Instance) => {
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
  return instance;
};

export const instanceCreateElement = (
  instance: Instance,
  runner: () => any
) => {
  stack.push(instance);

  const fragment = createDom(
    document.createDocumentFragment() as unknown as HTMLElement,
    undefined,
    () => runner()
  ) as unknown as HTMLElement;

  fragment.prepend(instance.range[0]);
  fragment.append(instance.range[1]);

  stack.pop();

  return fragment;
};

export const instanceCreate = (runner: () => any, parent?: Instance) => {
  const instance = instanceInit(parent);
  return [instance, instanceCreateElement(instance, runner)] as const;
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

export const instanceDestroy = (parent: Instance, instance: Instance) => {
  const stack = [instance];
  while (stack.length) {
    const inst = stack.pop()!;

    // 安全地执行清理函数
    inst.disposes.forEach((dispose) => {
      try {
        dispose();
      } catch (e) {
        console.error("Error during instance dispose:", e);
      }
    });

    // 清空 dispose 数组
    inst.disposes = [];

    if (inst.children) {
      stack.push(...inst.children);
      inst.children = []; // 清空子实例引用
    }
  }

  // 从父实例中移除此实例的引用
  if (parent && parent.children) {
    parent.children = parent.children.filter((c) => c !== instance);
  }
};
