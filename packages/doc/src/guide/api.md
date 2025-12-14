# API 参考

## 概览

- [signal](#signal)
- [computed](#computed)
- [ref](#ref)
- [effect](#effect)
- [wc](#wc)
- [untrack](#untrack)
- [onMount](#onmount)
- [onDestroy](#ondestroy)
- [createContext](#createcontext)
- [$useContext](#usecontext)

## signal

类型：`<T>(init: T): Signal<T>`

_创建一个信号值，一般不需要直接使用这个函数，由编译器自动创建。_

## computed

类型：`<T>(fn: () => T) => Computed<T>`

_创建一个派生信号值，一般不需要直接使用这个函数，由编译器自动创建。_

## ref

类型：`<T>(init?: T): { current: T | null; }`

引用 DOM 元素。

```tsx
import { ref } from "j20";

const App = () => {
  const domRef = ref<HTMLInputElement>();

  onMount(() => {
    console.log(domRef.current);
  });

  return <input ref={domRef} />;
};
```

## effect

类型：`(handler: () => void | (() => void)) => Effect`

副作用函数，在组件渲染时执行，在执行时搜集用到的信号，当依赖的信号变更时重新执行，并在执行前运行清理函数。

```tsx
import { effect } from "j20";

const App = () => {
  let $count = 0;

  const cancel = effect(() => {
    const timer = setInterval(() => {
      $count++;
    }, 1000);

    // 清理函数
    return () => {
      clearInterval(timer);
    };
  });

  return <button onClick={cancel}>hello: {$count}</button>;
};
```

## wc

类型：

```typescript
() => {
    host: HTMLElement;
    emit: (name: string, detail: any) => void;
    onConnectedCallback: (callback: () => void) => void;
    onDisconnectedCallback: (callback: () => void) => void;
}
```

通过 wc 可以获取 Web Component 实例以及方法，仅可以在 Web Component 组件中使用。

- host: Web Component 实例
- emit: 触发事件
- onConnectedCallback: Web Component 挂载回调
- onDisconnectedCallback: Web Component 卸载回调

```tsx
import { wc, WC } from "j20";
const App: WC<{}, { eventName: { payload: { data: string } } }> = () => {
  const { host, emit, onConnectedCallback, onDisconnectedCallback } = wc();

  onConnectedCallback(() => {
    emit("eventName", { payload: { data: "hello" } });
  });
  onDisconnectedCallback(() => {});

  return <div>some</div>;
};

App.customElement = {
  tag: "my-app",
  shadow: "open",
};
```

## untrack

类型：`<T>(fn: () => T): T`

可以跳过运行函数中的依赖搜集，以实现不被 effect 监听的目的，同时有返回值。

```tsx
import { untrack } from "j20";

const App = () => {
  let $count = 0;

  // 点击 button 后 count 会加 1，但是视图上不会更新
  const handleClick = () => {
    $count++;
  };

  return <div onClick={handleClick}>{untrack(() => $count)}</div>;
};
```

## onMount

类型：`(callback: () => (() => void) | void) => void`

查看 [生命周期](/guide/lifecycle)

## onDestroy

类型：`(callback: () => void) => Effect`

查看 [生命周期](/guide/lifecycle)

## createContext

类型：

```typescript
<T>(defaultValue: T) => {
    (p: {
        children: JSX.Element;
        value: T;
    }): HTMLElement;
    Consumer: {
        (p: {
            children: (value: T) => JSX.Element;
        }): JSX.Element;
    };
    defaultValue: T;
}
```

J20 默认提供了 `createContext` 方法，用于创建上下文。

用法和 React 19 类似，无需额外使用 Provider ，直接使用创建的上下文对象。

```tsx
import { createContext } from "j20";
export const SomeContext = createContext<{ name: string }>({ name: "" });

<SomeContext value={{ name: "J20" }}>
  <Inner />
</SomeContext>;

function Inner() {
  return (
    <SomeContext.Consumer>
      {/* $ctx 是信号 */}
      {($ctx) => <span>{$ctx.name}</span>}
    </SomeContext.Consumer>
  );
}
```

## $useContext

类型：`<T>(c: { defaultValue: T }) => T`

获取上下文数据

```tsx
import { $useContext } from "j20";
import { SomeContext } from "./SomeContext";

function Inner() {
  const $ctx = $useContext(SomeContext);
  return <span>{$ctx.name}</span>;
}
```

## $

类型：`<T>(val: T) => T extends SignalLike ? (typeof val)["value"] : SignalLike<T>`

信号变量和普通变量的转换器，在你确定某个变量是响应变量时，或者有个响应变量你需要转换为普通变量时，你可以用 $ 转换它。

**主要用途**

1. **类型逃生**：当需要将 Signal 对象传递给不支持 J20 语法的第三方库时。
2. **调试**：在控制台查看 Signal 对象的内部结构。

### 示例

```tsx
let $count = 0; // 实际为 Signal<number>，IDE中类型为：number

// 场景：获取真实的 Signal 对象实例，用于调试或传给三方库
const countSignal = $($count); // 实际为 Signal<number>，IDE中类型为：Signal<number>

let $newCount = $(countSignal); // 实际为：Signal<number>，IDE中类型为：number
```
