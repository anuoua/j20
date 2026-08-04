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
- [styleSheet](#stylesheet)

## signal

类型：`<T>(init: T): Signal<T>`

创建一个信号值。

> [!WARNING]
> **不到万不得已，不要直接使用 `signal`。**
>
> 常规声明请直接写 `let $x = v`，编译器会自动编译为 `signal(v)`。
> 手动调用 `signal` 既多余又容易出错（还会破坏无感信号的一致性），只有在编译器无法覆盖的极端场景才考虑使用，例如：
>
> - 脱离组件作用域的全局共享状态
> - 与不支持 J20 语法的第三方库交互

## computed

类型：`<T>(fn: () => T) => Computed<T>`

创建一个派生信号值。

> [!WARNING]
> **不到万不得已，不要直接使用 `computed`。**
>
> 常规派生请直接写 `const $x = expr`，编译器会自动编译为 `computed(() => expr)`。
> 手动调用 `computed` 既多余又容易出错（源码中手写 `$x.value` 之类的模式会与编译产物冲突），只有在编译器无法覆盖的极端场景才考虑使用。

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
  mode: "open",
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

J20 提供了 `createContext` 方法，用于创建上下文。

用法与示例见 [上下文 Context](/guide/context)。

## $useContext

类型：`<T>(c: { defaultValue: T }) => T`

获取上下文数据。

用法与示例见 [上下文 Context](/guide/context)。

## $

类型：`<T>(val: T) => T extends SignalLike ? (typeof val)["value"] : SignalLike<T>`

信号变量和普通变量的转换器，在你确定某个变量是响应变量时，或者有个响应变量你需要转换为普通变量时，你可以用 $ 转换它。

> [!WARNING]
> **`$` 是逃生舱接口，不要在业务代码中滥用。**
>
> 正常情况下你**不需要** `$`：`let $x` 声明、`const $x` 派生、直接读写 `$x` 已经覆盖 99% 的场景。
> `$` 只在以下特殊场景使用：
>
> 1. **类型逃生**：当需要将 Signal 对象传递给不支持 J20 语法的第三方库时。
> 2. **调试**：在控制台查看 Signal 对象的内部结构。

### 示例

```tsx
let $count = 0; // 实际为 Signal<number>，IDE中类型为：number

// 场景：获取真实的 Signal 对象实例，用于调试或传给三方库
const countSignal = $($count); // 实际为 Signal<number>，IDE中类型为：Signal<number>

let $newCount = $(countSignal); // 实际为：Signal<number>，IDE中类型为：number
```

## styleSheet

查看 [样式 - styleSheet](/guide/style#stylesheet)
