# 介绍

J20 是一个基于 Signal 的 Web Component 前端框架，目标是构建下一代 Web 应用。

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
