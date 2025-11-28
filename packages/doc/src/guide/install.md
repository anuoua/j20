# 安装

推荐使用 typescript

```bash
npm i typescript -D
npx tsc --init
```

## 安装依赖

```bash
npm i j20
npm i vite @j20org/vite-plugin -D
```

## TS 配置

tsconfig.json

```json
{
    "compilerOptions": {
        "jsx": "react-jsx",
        "jsxImportSource": "j20" // [!code ++]
    }
}
```

## Vite 配置

vite.config.mjs

```javascript
import { defineConfig } from "vite";
import { j20 } from "@j20org/vite-plugin";

export default defineConfig({
  plugins: [
    j20(),
  ],
});
```

## 创建应用

使用 `createRoot` 方法创建应用

```tsx
import { createRoot } from "j20";

const root = createRoot(() => <span>hello world</span>);

document.querySelector("#root").append(root.element);
```