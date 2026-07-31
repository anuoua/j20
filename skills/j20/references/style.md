# 样式

J20 提供了 `styleSheet` API 来管理组件样式，基于 [Constructable Stylesheets](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet) 实现，具有高性能的特点。

如需作用域隔离的 CSS-in-JS 方案，请使用生态包 [Stylec](/guide/ecosystem)。

## styleSheet

`styleSheet` 用于直接注入一个 `CSSStyleSheet` 到当前组件所在的 Shadow Root 或 Document 中，适合不需要作用域隔离的场景。

### 基本用法

```tsx
import { styleSheet } from "j20";

const App = () => {
  styleSheet(`
    div { box-sizing: border-box; }
    body { margin: 0; }
    .msg { font-size: 16px; }
  `,
  "my-global-style" // 可选
  );

  return <div class="msg">Hello J20</div>;
};
```

### 参数说明

- **css** (`string`)：CSS 文本内容
- **id** (`string`, 可选)：样式表的唯一标识，用于引用计数和去重，默认以 CSS 内容生成的哈希为唯一标识

### 自动挂载与清理

`styleSheet` 会自动检测当前组件的运行环境：

- 如果在 Web Component 中（存在 Shadow Root），样式会注入到 Shadow Root 的 `adoptedStyleSheets` 中
- 如果在普通组件中，样式会注入到 `document.adoptedStyleSheets` 中
- 组件销毁时自动清理，同一组件内多次引用相同样式会通过引用计数管理，避免重复注入

## 与 Web Component 样式的关系

除了使用 `styleSheet`，Web Component 还支持通过 `customElement.style` 配置静态样式，详见 [Web Component](/guide/web-component)。

```tsx
import { WC } from "j20";

const App: WC = () => {
  return <div class="container">Hello</div>;
};

App.customElement = {
  tag: "my-app",
  mode: "open",
  style: `
    .container {
      color: red;
    }
  `,
};
```

样式方案的适用场景：

| 方案                  | 适用场景                     | 作用域隔离      |
| --------------------- | ---------------------------- | --------------- |
| `customElement.style` | Web Component 专属样式       | Shadow DOM 隔离 |
| `stylec`              | 跨组件复用的样式，需要隔离   | 类名哈希隔离    |
| `styleSheet`          | 全局样式或需要动态操作的样式 | 无隔离          |
