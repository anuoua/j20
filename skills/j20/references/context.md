# 上下文 Context

J20 的 Context 用于在组件树中传递数据，避免逐层传递 props，用法与 React 的 Context 类似。

## 创建 Context

`createContext` 创建一个上下文对象，泛型为值类型：

```tsx
import { createContext } from "j20";
export const SomeContext = createContext<{ name: string }>({ name: "" });
```

`createContext` 的默认值仅在组件树中**未匹配到 Provider** 时使用。

## 提供值

直接使用上下文对象作为 JSX 元素提供值，无需额外的 Provider 组件：

```tsx
<SomeContext value={{ name: "J20" }}>
  <Inner />
</SomeContext>;
```

### 传可变值

Context 的值需要更新时，用 `let $` 变量承载（会被编译成 `signal`），更新时**重建对象引用**：

```tsx
function Provider() {
  let $state = {
    name: "J20",
    setName: (name: string) => {
      $state = { ...$state, name };
    },
  };

  return (
    <SomeContext value={$state}>
      <Inner />
    </SomeContext>
  );
}
```

> 复合值更新必须重建对象引用（`$state = { ...$state, name }`）。引用不变（如 `$state.name = name`）不会触发更新，详情见[组件 - 声明信号](/guide/component#声明信号)。

## 消费值

### $useContext

```tsx
import { $useContext } from "j20";
import { SomeContext } from "./SomeContext";

function Inner() {
  const $ctx = $useContext(SomeContext);
  return <span>{$ctx.name}</span>;
}
```

`$ctx` 是响应式包装，`$ctx.field` 在渲染或 effect 中读取即建立订阅，值变化时自动重跑。

### Consumer

```tsx
<SomeContext.Consumer>
  {($ctx) => <span>{$ctx.name}</span>}
</SomeContext.Consumer>
```

## 订阅粒度

`$ctx.field` 直接读取会订阅**整个 context 值**（对象级）：任意字段更新都会让该读取重跑。

需要精细订阅某个字段时，用 `$` 前缀变量派生：

```tsx
const $name = $ctx.name; // 编译为 computed(() => $ctx.value.name)
// 只有 name 字段变化时，订阅 $name 的表达式才重跑
```

## 默认值

未匹配到任何 Provider 时，`$useContext` / `Consumer` 返回 `createContext` 传入的默认值：

```tsx
const SomeContext = createContext<{ name: string }>({ name: "默认" });

// 组件树中没有 <SomeContext> 时：
$ctx.name // "默认"
```
