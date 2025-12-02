import {
  Instance,
  instanceCreateElement,
  instanceInit,
  securityGetCurrentInstance,
} from "../h/instance";
import { isSignal } from "./utils";

const contextWeakMap = new WeakMap<Instance, any>();

const context = <T>(Context: { defaultValue: T }) => {
  const instance = securityGetCurrentInstance();

  let index = instance?.parent;

  while (index) {
    if (contextWeakMap.has(index)) {
      const { ctx, value } = contextWeakMap.get(index)!;
      if (ctx === Context) {
        return value;
      }
    } else {
      index = index.parent;
    }
  }

  return Context.defaultValue;
};

export const createContext = <T>(defaultValue: T) => {
  const Context = (p: { children: JSX.Element; value: T }) => {
    const props = p as unknown as {
      value: { children: JSX.Element; value: T };
    };

    const instance = instanceInit(securityGetCurrentInstance());

    contextWeakMap.set(instance, {
      ctx: Context,
      value: {
        get value() {
          return props.value.value;
        },
      },
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

    const data = context(Context);

    if (data) return props.value.children(data);

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

  Context.defaultValue = defaultValue;

  return Context;
};

export const $useContext = <T>(c: { defaultValue: T }): T =>
  context<T>((c as any).value);
