# 创建应用

使用 `createRoot` 方法创建应用

```tsx
import { createRoot } from "j20";

const App = () => <span>hello world</span>

createRoot(App, document.querySelector("#root"))
```