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

  let index: Instance | undefined = instance;

  while (index) {
    if (contextWeakMap.has(index)) {
      const { ctx, value } = contextWeakMap.get(index)!;
      if (ctx === Context) {
        return value;
      }
    }
    index = index.parent;
  }

  // 与 Provider 存储的形态保持一致：返回带 value getter 的包装，
  // 否则 `$ctx.field` 编译为 `$ctx.value.field` 时对原始 default 会取到 undefined。
  return isSignal(Context.defaultValue)
    ? (Context.defaultValue as any)
    : ({
        get value() {
          return Context.defaultValue;
        },
      } as any);
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

    // children 是惰性 thunk：解包后是用户函数，传入 context 值调用
    const children = (props.value as any).children() as (
      value: T
    ) => JSX.Element;

    const data = context(Context);

    if (data) return children(data);

    return children(
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
