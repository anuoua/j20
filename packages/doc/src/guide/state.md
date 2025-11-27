# 状态管理

J20 的组件状态由信号驱动，因为创新的编译手段，你可以无感使用信号。

## 声明信号

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

## 派生信号

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

## 自定义 hooks

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
