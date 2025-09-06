import {
  getCurrentInstance,
  Instance,
  instanceCreate,
  instanceCreateElement,
  instanceInit,
} from "../h/instance";
import { computed } from "../api/computed";
import { isSignal } from "./utils";

const contextWeakMap = new WeakMap<Instance, any>();

export const createContext = <T>(defaultValue: T) => {
  const Context = (p: { children: JSX.Element; value: T }) => {
    const props = p as unknown as {
      value: { children: JSX.Element; value: T };
    };

    const instance = instanceInit(getCurrentInstance());

    contextWeakMap.set(instance, {
      ctx: Context,
      value: computed(() => props.value.value),
    });

    const fragment = instanceCreateElement(
      instance,
      () => props.value.children
    );

    return fragment;
  };

  Context.isLogic = true;

  const Consumer = (p: { children: (value: T) => JSX.Element }) => {
    const props = p as unknown as {
      value: { children: (value: T) => JSX.Element };
    };

    const instance = getCurrentInstance();

    let index = instance?.parent;

    while (index) {
      if (contextWeakMap.has(index)) {
        const { ctx, value } = contextWeakMap.get(index)!;
        if (ctx === Context) {
          return props.value.children(value);
        }
      } else {
        index = index.parent;
      }
    }

    return props.value.children(
      isSignal(defaultValue)
        ? defaultValue
        : ({
            get value() {
              return defaultValue;
            },
          } as any)
    );
  };

  Consumer.isLogic = true;

  Context.Consumer = Consumer;

  return Context;
};
