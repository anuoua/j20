# J20

一个基于 Signal 的 Web Component 前端框架，目标是构建下一代 Web 应用。

[官方文档](https://anuoua.github.io/j20/)

## 特点

- **无感 Signal 驱动**：创新的编译手段，你可以无感使用信号
- **高性能**：细粒度响应，无虚拟 DOM
- **Web Component 一流支持**：无缝的 Web Component 框架开发体验

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
        "jsxImportSource": "j20"
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

## 更多

请访问 [官方文档](https://anuoua.github.io/j20/)

## License

MIT @anuoua
