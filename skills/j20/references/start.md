# 创建应用

使用 `createRoot` 方法创建应用

```tsx
import { createRoot } from "j20";

const App = () => <span>hello world</span>

createRoot(App, document.querySelector("#root"))
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