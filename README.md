# J20

一个基于 Signal 的 Web Component 前端框架，目标是构建下一代 Web 应用。

## 特点

- **无感 Signal 驱动**
- **高性能**：无虚拟 DOM
- **开发体验优秀**：原创基于命名标记的 Signal 编译技术
- **Web Component 一流支持**

## 安装

```bash
npm i j20
```

## 创建应用

使用 `createRoot` 方法创建应用

```tsx
import { createRoot } from "j20";

const root = createRoot(() => <span>hello world</span>);

document.querySelector("#root").append(root.element);
```

## 组件

J20 的组件和 React 的组件非常相似，如果你熟悉 React，那么你可以快速地上手。

### 函数式组件

```tsx
const App = () => {
  const msg = "hello world";

  return <span>{msg}</span>;
};
```

### 状态

J20 的组件状态由信号驱动，因为创新的编译手段，你可以无感使用信号。

**声明信号**

使用 `let` 关键字 + `$` 前缀符号来声明一个信号。

信号的值可变，直接赋值可以更新与之绑定的视图。

```tsx
const App = () => {
  let $msg = "hello world";

  const onClick = () => {
    $msg = $msg + " j20";
  };

  return <span onClick={onClick}>{$msg}</span>;
};
```

**派生信号**

使用 `const` 和 `$` 前缀符号来声明一个派生信号，派生信号的值不可变，只读。支持任意 JS 表达式。

```tsx
const App = () => {
  let $msg = "hello world";
  let $count = 1;

  // 字符串拼接
  const $displayMsg = "display: " + $msg;

  // 数学计算
  const $double = $count * 2;
  const $isEven = $count % 2 === 0;

  const onClick = () => {
    $msg = $msg + " j20";
    $count++;
  };

  return (
    <span onClick={onClick}>
      {$displayMsg} - Count: {$double} (Even: {$isEven.toString()})
    </span>
  );
};
```

> 注：信号变量不能使用 `$use` 开头， `$use` 是自定义 hooks 的前缀，它拥有特殊的编译策略。

**自定义 hooks**

自定义 hooks 以 `$use` 为前缀，支持解构。

```tsx
const $useCount = () => {
  let $count = 0;

  return {
    count: $count,
  };
};

const { count: $count } = $useCount();

console.log($count);
```

需要注意的是解构声明的变量名必须是 `$` 开头，如果解构字段本身不是 `$` 开头，则需要设置 `$` 前缀的别名。

### 组件入参 $props

按照[响应传递机制](#1-什么是响应传递机制)，函数入参用到的**信号变量**需要符合传递规则：

**1、组件入参是一个信号，所以变量名必须以 `$` 开头**

```tsx
function Msg($props: { name: string }) {
  return <span>{$props.name}</span>;
}

function App() {
  let $name = "hello";

  return <Msg name={$name} />;
}
```

> 如果 `<Msg name="hello" />` name 是个静态值，那么组件内的 `$name` 信号的值就永远是`"hello"`。

**2、入参解构的字段变量名以 `$` 开头**

解构的信号变量都是派生的信号变量，只读。

```tsx
function Msg({ name: $name }: { name: string }) {
  return <span>{$name}</span>;
}

// 错误用法
// 如果函数入参名或者解构后的变量名没有 `$` 开头的变量，那么这个函数的入参**不会被编译**
// 意味着函数的入参是原始值，外部传入什么，函数内部就会拿到什么，可能会造成类型和实际值不一致的情况。
function Msg({ name }: { name: string }) {
  return <span>{name}</span>;
}
```

## 条件渲染

J20 提供了 `If` 和 `Switch` 组件来处理条件渲染。

`If` 用来处理简单的条件渲染

```tsx
import { If } from "j20";

let $visible = true;

<If of={$visible} else={<div>invisible</div>}>
  <span>visible</span>
</If>;
```

`Switch` 用来处理多条件渲染，只渲染第一个 of = true 的 Case 项，用于多个互斥条件下的渲染，`Default` 则是默认项

```tsx
import { Switch, Case, Default } from "j20";

let $value = 1;

<Switch>
  <Case of={$value === 1}>1</Case>
  <Case of={$value === 2}>2</Case>
  <Default>default</Default>
</Switch>;
```

## 列表渲染

J20 提供了 `For` 组件，用于列表渲染，trait 用来确定唯一性（类似其他框架的 key ），如果不传，唯一性判断的依据是列表项本身。即 trait 默认为 `i => i`

```tsx
import { For } from 'j20';

let $todos = [{ id: 1, text: 'todo1' }, { id: 2, text: 'todo2' }]

<For of={$todos} trait={i => i.id}>
  {(todo, $index) => (
    <div>
      index: {$index}
      text: {todo.text}
    </div>
  )}
</For>
```

注：这里的 **todo 不是信号**，数组项不可变，而 **$index 是信号**，会随着数组项的增减而改变。

那么列表的渲染如何更新？当然是通过修改数组。

```tsx
// Signal 不会深度劫持数组，重新赋值即可
$todos = [...$todos, { id: 3, text: "new" }];
```

## 动态渲染

J20 提供了 `Dynamic` 组件，用于动态渲染，`of` 的值一旦改变，内部的元素会卸载并重建，用于需要大规模重建的场景。

```tsx
import { Dynamic } from "j20";

let $value = 1;

<Dynamic of={$value}>
  {/* 内容和 $value 有关，可以使用函数获取 value (value 为普通值快照) */}
  {(value) => <div>{value}</div>}
  {/* 内容和 $value 无关，直接渲染 */}
  <div>Some</div>
</Dynamic>;
```

## Web Component 组件

J20 允许用户创建 Web Component 组件，提供一流支持。既能够像普通组件一样使用，也可以像 Web Component 一样通过 html 标签使用，同时类型支持完善。

Web Component 本身**不支持复杂对象**的传参， J20 也不会特殊照顾，我们应当意识到 Web Component 的适用范围，不应该幻想 Web Component 组件能够像普通组件一样使用。

**创建 Web Component 组件**

```tsx
// App.tsx
import { WC } from "j20";

// props 类型，仅支持 string, number, boolean
interface AppProps {
  name: string;
}

// 自定义事件以及携带的 payload 类型
// 组件内调用事件的名称，它的映射规则和 DOM 元素一致
//   delete -> onDelete
//   add -> onAdd
interface AppEvents {
  delete: number;
  add: number;
}

const App: WC<AppProps, AppEvents> = ($props) => {
  return (
    <div class="container" onClick={() => $props.onDelete(1)}>
      {$props.name}
    </div>
  );
};

App.customElement = {
  // html tag
  tag: "my-app",
  // attachShadow mode: open 或者 closed
  shadow: "open",
  // 入参和html属性的映射,类型支持 "string", "number", "boolean"
  props: {
    name: {
      type: "string",
      attribute: "name",
    },
  },
  // 组件样式
  style: `
    .container {
      color: red;
    }
  `,
};
```

**像普通组件一样使用**

```tsx
<App
  name="hello"
  onDelete={(value) => {
    console.log(value);
  }}
/>
// console.log 1
```

**通过 html 标签使用**

通过 html 标签使用，需要先注册组件。

```tsx
import { registerWebComponent } from "j20";
import App from "./App.tsx";

registerWebComponent(App);
```

用在 J20 中

```tsx
<my-app name="hello" onDelete={(value) => console.log(value)} />
// console.log => CustomEvent { ... detail: 1 }
```

用在原生 html 中，意味着这种形态的组件是可以运行在任何框架中。

```html
<my-app name="hello" />
<script type="text/javascript">
  document.querySelector("my-app").addEventListener("delete", (e) => {
    console.log(e);
  });
  // console.log => CustomEvent { ... detail: 1 }
</script>
```

## API

- [signal](#signal)
- [computed](#computed)
- [ref](#ref)
- [effect](#effect)
- [wc](#wc)
- [untrack](#untrack)
- [createContext](#createContext)

hooks

- [$useContext](#usecontext)

### _signal_

_创建一个信号值，一般不需要直接使用这个函数，由编译器自动创建。_

### _computed_

_创建一个派生信号值，一般不需要直接使用这个函数，由编译器自动创建。_

### ref

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

### effect

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

### wc

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

### untrack

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

### createContext

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

### $useContext

获取上下文数据

```tsx
import { $useContext } from "j20";
import { SomeContext } from "./SomeContext";

function Inner() {
  const $ctx = $useContext(SomeContext);
  return <span>{$ctx.name}</span>;
}
```

### $

信号变量和普通变量的转换器，在你确定某个变量是响应变量时，或者有个响应变量你需要转换为普通变量时，你可以用 $ 转换它。

**主要用途：**

1.  **类型逃生**：当需要将 Signal 对象传递给不支持 J20 语法的第三方库时。
2.  **调试**：在控制台查看 Signal 对象的内部结构。

```tsx
let $count = 0; // 实际为 Signal<number>，IDE中类型为：number

// 场景：获取真实的 Signal 对象实例，用于调试或传给三方库
const countSignal = $($count); // 实际为 Signal<number>，IDE中类型为：Signal<number>

let $newCount = $(countSignal); // 实际为：Signal<number>，IDE中类型为：number
```

## 生命周期

非 Web Component 组件，没有专门的生命周期概念，可使用 effect 副作用来实现生命周期的模拟。

模拟 onMount 生命周期

```tsx
const onMount = (fn: () => (() => void) | undefined) => {
  effect(() => untrack(fn));
};

// 使用
onMount(() => {
  const handler = () => {
    console.log("click");
  };

  document.addEventListener("click", handler);

  return () => {
    // 销毁
    document.removeEventListener("click", handler);
  };
});
```

## FAQ

### 1. 什么是响应传递机制？

信号在传递过程中不能中断，既**信号不能传递给普通变量**（非 $ 开头），否则响应链中断。

牢记这个规则，可以轻松构建 J20 应用。

### 1.为什么要加 `$` 前缀?

第一：为了编译时将符号 `$` 前缀的变量编译成和信号相关的代码所做的标记，这个标记是明确的没有歧义的（避免极少数三方库的冲突，请自行别名处理），编译插件已经开源，具体原理可以看 [signal-compiler](https://github.com/anuoua/signal-compiler)

第二：为了避免和普通变量（非 Signal）混淆。在大型应用中**变量的数量庞大**，开发人员无法区分信号变量和普通变量，导致 debug 困难。
