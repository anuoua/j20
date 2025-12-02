import { createDom } from "./createDom";
import { generateId } from "./utils";

export interface Instance {
  parent?: Instance;
  id: string;
  range: Comment[];
  disposes?: (() => void)[];
  children?: Instance[];
}

const stack: Instance[] = [];

export const getCurrentInstance = () => stack.at(-1);

// api security guard
export const securityGetCurrentInstance = () => {
  const instance = getCurrentInstance();
  if (!instance) throw new Error("Do not run this api out of component");
  return instance;
};

export const instanceInit = (parent?: Instance) => {
  const id = generateId();
  const parentInstance = parent ?? getCurrentInstance();
  const instance: Instance = {
    parent: parentInstance,
    id,
    range: [document.createTextNode(""), document.createTextNode("")],
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
  // 使用栈来实现迭代式的深度优先销毁，避免递归开销
  // 关键：需要跟踪每个实例的销毁状态（是否已销毁子节点）

  const stack: Array<{ inst: Instance; childrenDestroyed: boolean }> = [
    { inst: instance, childrenDestroyed: false },
  ];

  while (stack.length > 0) {
    const current = stack[stack.length - 1]!;

    if (!current.childrenDestroyed) {
      // 第一次访问：先标记子节点已销毁，然后将子节点入栈
      current.childrenDestroyed = true;

      if (current.inst.children && current.inst.children.length > 0) {
        // 倒序添加子节点，保持与递归相同的销毁顺序
        for (let i = current.inst.children.length - 1; i >= 0; i--) {
          stack.push({
            inst: current.inst.children[i],
            childrenDestroyed: false,
          });
        }
      }
    } else {
      // 第二次访问：子节点已全部销毁，现在销毁当前节点
      const inst = current.inst;

      // 执行清理函数
      inst.disposes?.forEach((dispose) => {
        try {
          dispose();
        } catch (e) {
          console.error("Error during instance dispose:", e);
        }
      });

      // 清空 dispose 数组，但保留数组引用
      if (inst.disposes) {
        inst.disposes.length = 0;
      }

      // 清空子节点引用
      if (inst.children) {
        inst.children = [];
      }

      stack.pop();
    }
  }

  // 从父实例中移除此实例的引用
  if (parent && parent.children) {
    parent.children = parent.children.filter((c) => c !== instance);
  }
};
