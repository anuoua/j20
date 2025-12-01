# 组件

J20 的组件和 React 的组件非常相似，如果你熟悉 React，那么你可以快速地上手。

```tsx
const App = () => {
  const $msg = "hello world";

  return <span>{$msg}</span>;
};
```

## 组件状态

J20 的组件状态由信号驱动，因为 J20 创新的编译手段，你可以像普通变量一样无感使用信号。

### 声明信号

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

### 派生信号

使用 `const` 和 `$` 前缀符号来声明一个派生信号，派生信号的值不可变，只读。

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

### 自定义 hooks

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
    $count, // $ 开头不推荐直接作为属性名，容易和信号混淆。
  };
};

// 这样比较方便使用
const { $count } = $useCount();
console.log($count);

// 但是下面这样就会显得很奇怪，`.$count` 不是信号，但是带着信号前缀，容易混淆。
const $res = $useCount();
console.log($res.$count);
```

可以用，有时候会方便书写和解构，但是实际上我们不推荐，因为 `$count` 字段它不是信号

解构声明的变量名想要保持响应必须是 `$` 开头，如果解构字段本身不是 `$` 开头，则需要设置 `$` 前缀的别名。

可以了解一下[响应链传递](/guide/faq#响应链传递)。


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
