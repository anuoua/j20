# 组件

J20 的组件和 React 的组件类似，如果你熟悉 React，那么你可以快速地上手。

```tsx
const App = () => {
  const $msg = "hello world";

  return <span>{$msg}</span>;
};
```

## 组件状态

J20 的组件状态由信号驱动，因为 J20 创新的编译手段，你可以像普通变量一样无感使用信号。

## 声明信号

使用 `let` 关键字 + `$` 前缀符号来声明一个信号。

信号的值可变，直接赋值可以更新视图。

```tsx
const App = () => {
  let $msg = "hello world";

  const onClick = () => {
    $msg = $msg + " j20";
  };

  return <span onClick={onClick}>{$msg}</span>;
};
```

### 任意值都可以

`let` 信号不限于基础类型，**任意表达式（含对象字面量）都会被自动包装成 `signal(...)`**：

```tsx
const App = () => {
  let $state = {
    open: false,
    setOpen: (next: boolean) => {
      $state = { ...$state, open: next };
    },
  };

  return (
    <button onClick={() => $state.setOpen(true)}>
      {String($state.open)}
    </button>
  );
};
```

> 复合值更新时请**重建对象引用**（不可变更新）。信号只有在引用变化时才会触发更新：
> `$state = { ...$state, open: next }` ✓ 触发更新
> `$state.open = next` ✗ 引用不变，不触发

### 编译规则速查

| 源码写法 | 编译结果 |
| --- | --- |
| `let $x = v` | `let $x = signal(v)` |
| `const $x = expr` | `const $x = computed(() => expr)` |
| 读取 `$x` | `$x.value` |
| 赋值 `$x = v` | `$x.value = v` |
| 读取 `$x.field` | `$x.value.field` |

> **源码里不要手写 `$x.value`**。编译器会自动补 `.value`：
> - 读取时手写会变成 `$x.value.value`
> - 类型上 `$x` 是值类型（没有 `.value` 属性），手写会报错
>
> 一律写 `$x` / `$x.field`，编译器负责插入 `.value`。

## 派生信号

使用 `const` 和 `$` 前缀符号来声明一个派生信号，派生信号的值不可变，只读。

`const $x = expr` 会被编译成 `computed(() => expr)`，它内部依赖的 `$` 信号变化时自动重算。**派生信号不能被赋值**（会编译为对 computed 赋值，运行时无效）：

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

## 自定义 hooks

自定义 hooks 以 `$use` 为前缀，支持解构，解构变量以 `$` 开头可以保持响应。

```tsx
const $useCount = () => {
  let $count = 0;

  return {
    count: $count, 
  };
};

const { count: $count } = $useCount();
console.log($count);

const $res = $useCount();
console.log($res.count);
```

疑问：自定义 hooks 可不可以直接返回 `{ $count }`

```tsx
const $useCount = () => {
  let $count = 0;

  return {
    $count, // $ 开头直接作为属性名，需要谨慎使用，容易和信号混淆。
  };
};

const { $count } = $useCount();
// 干净的解构，方便使用
console.log($count);

// 错误实践
// `$res` 是信号
const $res = $useCount();
// `.$count` 只是 `$res` 的一个属性（非信号），却带着 $ 前缀，容易混淆。
console.log($res.$count);
```

这么写会比较方便书写和解构，但是务必不要滥用，保持干净的解构使用，我们希望 `$` 前缀的含义没有歧义。

注：解构声明的变量名必须是 `$` 开头，如果不是 `$` 开头，则需要设置 `$` 前缀的别名，否则响应丢失。

具体可以了解[响应链传递](/guide/faq#响应链传递)。


## 组件 Props

组件入参是一个派生信号，所以变量名必须以 `$` 开头

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

## Props 解构

解构的字段变量名以 `$` 开头才能保持响应性，是只读的派生信号。

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

## 组件插槽

组件的内容区需要让使用者自定义时，J20 提供两种方式：

- **children**——静态内容，没有入参，直接放固定 JSX；
- **动态插槽**——接收参数，通过行内组件实现，作为大写属性传入，内容可复用。

### children

自定义组件的 `children` 是**静态内容**——没有入参，使用者直接把内容放进来。只有 `If` / `For` / `Switch` 等内置逻辑组件的 `children` 可以是函数。

```tsx
const Panel = ($props: {
  children?: JSX.Element;
}) => {
  const { children } = $props;

  return (
    <div>
      {children}
    </div>
  );
};

<Panel>静态内容</Panel>
```

J20 的 JSX props 是惰性的——绑定对象只在属性被读取时才初始化，因此静态内容零成本。`children` 被编译成惰性 thunk（`children: () => content`）：只在组件调用它时（例如通过 `{children}` 挂载）才创建内容，props 展开或解构时不会触发创建。

children 内容需要更新时，搭配 `If` / `For` / `Switch` 等内置逻辑组件使用：

```tsx
let $visible = true;

<Panel>
  <If of={$visible} else={<div>invisible</div>}>
    <span>visible</span>
  </If>
</Panel>
```

### 动态插槽

动态插槽接收参数，通过行内组件实现，内容**可复用**——同一份插槽可以传给多个组件，也可以在组件内多次调用。

#### 行内组件

行内组件是写在 JSX 属性上的组件。

编译器识别行内组件靠以下约定，全部满足才会把它当作组件编译（`$` 解构参数会被编译成只读的派生信号）：

1. **属性名大写开头**（`Action`、`Header`，组件式命名）；
2. **组件函数入参必须含有 `$` 变量**（比如 `$props` 或者解构 `({ count: $count })`）；

插槽属性用 `FC<Props>` 声明，组件内解构后通过 JSX 调用插槽：

```tsx
const Panel = ($props: {
  title: string;
  Action?: FC<{ count: number }>;
}) => {
  let $count = 0;
  const { Action } = $props;

  return (
    <div class="panel">
      <h2>{$props.title}</h2>
      {Action ? <Action count={$count} /> : null}
    </div>
  );
};
```

使用时属性值是匿名函数，参数用 `$` 解构：

```tsx
<Panel
  title="计数器"
  Action={({ count: $count }) => <span>当前值：{$count}</span>}
/>
```

插槽内的 `$count` 是**只读的派生信号**：父组件的信号变化时插槽自动更新。

调用插槽必须走 JSX 形式，运行时会把 props 包成响应式信号，插槽内部才能拿到值并保持响应：

```tsx
// ✅ 正确：JSX 调用
{Action ? <Action count={$count} /> : null}

// ❌ 错误：直接函数调用，插槽内部拿不到响应式值
{$props.Action({ count: $count })}
```

