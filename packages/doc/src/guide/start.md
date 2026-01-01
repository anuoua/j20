# 创建应用

使用 `createRoot` 方法创建应用

```tsx
import { createRoot } from "j20";

const root = createRoot(() => <span>hello world</span>);

document.querySelector("#root").append(root.element);
```

## 简单组件

```tsx
import { createRoot } from "j20";

const App = () => {
  return (
    <span>hello world</span>
  )
}

const root = createRoot(() => <App />);

document.querySelector("#root").append(root.element);
```