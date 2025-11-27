# 组件 Props

按照[响应传递机制](#1-什么是响应传递机制)，函数入参用到的**信号变量**需要符合传递规则：

## 组件入参是一个信号

所以变量名必须以 `$` 开头

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

## 入参解构

解构的字段变量名以 `$` 开头，解构的信号变量都是派生的信号变量，只读。

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
