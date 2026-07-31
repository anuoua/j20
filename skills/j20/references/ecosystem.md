# 生态系统

## Stylec

[Stylec](https://github.com/anuoua/stylec) 是一个编译时的 CSS-in-JS 解决方案。在 `*.stylec.css` 文件中编写普通 CSS（支持嵌套、`&`、`var()` 等），编译器会将其编译为一个 `*.stylec.ts` 模块，导出：

- **`classes`**：带哈希后缀的类名映射，用于在 JSX 中引用
- **`css`**：编译后的原始 CSS 字符串
- **`override()`**：类型化的方法，用于生成作用域变体样式
- **`cssHash`**：类名背后的原始哈希，作为复杂选择器时的逃生出口

stylec 不包含注入逻辑——将 CSS 注入到 DOM 是框架的职责。在 J20 中，可通过 `styleSheet` API 将导出的 `css` 注入。

### 安装

```sh
pnpm add @stylec/runtime
pnpm add -D @stylec/vite
```

### Vite 配置

在 `vite.config.mjs` 中启用 `@stylec/vite` 插件，它会在开发与构建时自动将 `src` 下的 `.stylec.css` 编译为同名的 `.stylec.ts`（`include` 默认值为 `["src"]`，可省略）：

```ts
import { defineConfig } from "vite";
import { j20 } from "@j20org/vite-plugin";
import { stylec } from "@stylec/vite";

export default defineConfig({
  plugins: [
    j20(),
    stylec(),
  ],
});
```

### 使用

```tsx
import { styleSheet } from "j20";
import { css, classes } from "./Button.stylec";

const Button = () => {
  styleSheet(css);

  return <button class={classes.button}>Click</button>;
};
```

更多信息请参阅 [Stylec 文档](https://github.com/anuoua/stylec)。
