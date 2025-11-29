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

_创建一个信号值，一般不需要直接使用这个函数，由编译器自动创建。_

## computed

_创建一个派生信号值，一般不需要直接使用这个函数，由编译器自动创建。_

## ref

引用 DOM 元素。

```tsx
import { ref } from "j20";

const App = () => {
  const domRef = ref<HTMLInputElement>();

  effect(() => {
    console.log(domRef.current);
  });

  return <input ref={domRef} />;
};
```

## effect

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

通过 wc 可以获取 Web Component 实例以及方法，仅可以在 Web Component 组件中使用。

- host: Web Component 实例
- emit: 触发事件
- onConnectedCallback: Web Component 挂载回调
- onDisconnectedCallback: Web Component 卸载回调

```tsx
import { wc } from "j20";
const App = () => {
  const { host, emit, onConnectedCallback, onDisconnectedCallback } = wc();

  onConnectedCallback(() => {});

  onDisconnectedCallback(() => {});

  emit("eventName", { data });

  return <div>some</div>;
};

App.customElement = {
  tag: "my-app",
  shadow: "open",
};
```

## untrack

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

## createContext

## onMount

在组件挂载到 DOM 后执行回调函数，使用 `requestAnimationFrame` 确保在 DOM 渲染完成后执行。

```tsx
import { onMount } from "j20";

const App = () => {
  let $count = 0;

  onMount(() => {
    console.log("Component mounted");
  });

  return (
    <div>
      <p>Count: {$count}</p>
      <button onClick={() => $count++}>Increment</button>
    </div>
  );
};
```

### 返回清理函数

`onMount` 可以返回一个清理函数，在组件卸载时自动执行：

```tsx
import { onMount } from "j20";

const App = () => {
  onMount(() => {
    console.log("Component mounted");

    // 返回清理函数
    return () => {
      console.log("Component will unmount");
    };
  });

  return <div>App Component</div>;
};
```

### 异步支持

支持异步回调函数：

```tsx
import { onMount } from "j20";

const App = () => {
  onMount(async () => {
    // 异步操作
    await fetch("/api/data");
    console.log("Data loaded");
  });

  return <div>App Component</div>;
};
```

### 多次调用

可以在同一个组件中多次调用 `onMount`：

```tsx
import { onMount } from "j20";

const App = () => {
  onMount(() => {
    console.log("Mount handler 1");
  });

  onMount(() => {
    console.log("Mount handler 2");
  });

  return <div>App Component</div>;
};
```

## onDestroy

在组件卸载时执行回调函数，用于清理副作用、移除事件监听器等。

```tsx
import { onDestroy } from "j20";

const App = () => {
  onDestroy(() => {
    console.log("Component destroyed");
    // 清理资源
  });

  return <div>App Component</div>;
};
```

### 多个清理函数

支持注册多个清理函数：

```tsx
import { onDestroy } from "j20";

const App = () => {
  onDestroy(() => {
    console.log("Cleanup 1");
  });

  onDestroy(() => {
    console.log("Cleanup 2");
  });

  return <div>App Component</div>;
};
```

### 事件监听器清理

常用于移除事件监听器：

```tsx
import { onDestroy } from "j20";

const App = () => {
  onDestroy(() => {
    // 移除事件监听器
    window.removeEventListener("resize", handleResize);
  });
};

// 在挂载时添加事件监听器
useEffect(() => {
  const handleResize = () => {
    console.log("Window resized");
  };

  window.addEventListener("resize", handleResize);
});
```

### 与 effect 配合使用

`onDestroy` 本质上是 `effect` 的简化版本，专门用于清理操作：

```tsx
import { onDestroy, effect } from "j20";

const App = () => {
  // 使用 effect 管理副作用
  const cancel = effect(() => {
    const timer = setInterval(() => {
      $count++;
    }, 1000);

    // 使用 onDestroy 进行额外清理
    onDestroy(() => {
      clearInterval(timer);
    });
  });

  return <button onClick={() => cancel()}>Stop Timer</button>;
};
```

## 最佳实践

1. **配对使用**：每个 `onMount` 都应该有对应的 `onDestroy` 清理资源
2. **及时清理**：在清理函数中移除所有事件监听器、定时器等
3. **避免嵌套**：深度嵌套的生命周期会让代码难以维护
4. **第三方库**：在 `onMount` 中初始化第三方库时，在 `onDestroy` 中销毁实例

J20 默认提供了 `createContext` 方法，用于创建上下文。

```tsx
import { createContext } from "j20";
export const SomeContext = createContext<{ name: string }>({ name: "" });

<SomeContext value={{ name: "J20" }}>
  <Inner />
</SomeContext>;

function Inner() {
  return (
    <SomeContext.Consumer>
      {($ctx) => <span>{$ctx.name}</span>}
    </SomeContext.Consumer>
  );
}
```

## $useContext

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

信号变量和普通变量的转换器，在你确定某个变量是响应变量时，或者有个响应变量你需要转换为普通变量时，你可以用 $ 转换它。

### 主要用途

1. **类型逃生**：当需要将 Signal 对象传递给不支持 J20 语法的第三方库时。
2. **调试**：在控制台查看 Signal 对象的内部结构。

### 示例

```tsx
let $count = 0; // 实际为 Signal<number>，IDE中类型为：number

// 场景：获取真实的 Signal 对象实例，用于调试或传给三方库
const countSignal = $($count); // 实际为 Signal<number>，IDE中类型为：Signal<number>

let $newCount = $(countSignal); // 实际为：Signal<number>，IDE中类型为：number
```
