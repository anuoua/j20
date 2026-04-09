# 样式

J20 提供了 `createCss` 和 `styleSheet` 两个 API 来管理组件样式，基于 [Constructable Stylesheets](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet) 实现，具有高性能和作用域隔离的特点。

## createCss

`createCss` 用于创建带有作用域隔离的 CSS 样式，自动为类名添加唯一后缀，避免样式冲突。

### 基本用法

```tsx
import { createCss } from "j20";

const useStyles = createCss(`
  .container {
    color: red;
    font-size: 16px;
  }
  .title {
    font-weight: bold;
  }
`);

const App = () => {
  const classes = useStyles();

  return (
    <div class={classes.container}>
      <span class={classes.title}>Hello J20</span>
    </div>
  );
};
```

### 工作原理

`createCss` 接收一段 CSS 字符串，返回一个函数。调用该函数时：

1. 自动为 CSS 中的每个类名添加唯一后缀（如 `.container` 变为 `.container_abc123`），实现作用域隔离
2. 将处理后的样式注入到当前组件所在的 Shadow Root 或 Document 中
3. 返回一个 Proxy 对象，通过该对象访问的属性名会自动添加相同的后缀，因此可以直接通过 `classes.container` 获得转换后的类名

### 在多个组件中复用

`createCss` 返回的函数可以在多个组件中调用，样式只会被注入一次（通过引用计数管理），组件销毁时自动清理。

```tsx
import { createCss } from "j20";

const useStyles = createCss(`
  .btn {
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
  }
  .primary {
    background-color: blue;
    color: white;
  }
  .secondary {
    background-color: gray;
    color: white;
  }
`);

const PrimaryButton = () => {
  const classes = useStyles();
  return <button class={`${classes.btn} ${classes.primary}`}>Primary</button>;
};

const SecondaryButton = () => {
  const classes = useStyles();
  return (
    <button class={`${classes.btn} ${classes.secondary}`}>Secondary</button>
  );
};
```

## styleSheet

`styleSheet` 用于直接注入一个 `CSSStyleSheet` 到当前组件所在的 Shadow Root 或 Document 中，适合不需要作用域隔离的场景。

### 基本用法

```tsx
import { styleSheet } from "j20";

const App = () => {
  styleSheet(
    "my-global-style",
    `
    div { box-sizing: border-box; }
    body { margin: 0; }
  `
  );

  return <div>Hello J20</div>;
};
```

### 参数说明

- **id** (`string`)：样式表的唯一标识，用于引用计数和去重
- **css** (`string`, 可选)：CSS 文本内容，如果不提供则创建空的样式表

### 获取 CSSStyleSheet 实例

`styleSheet` 返回 `CSSStyleSheet` 实例，可以用于进一步操作。

```tsx
import { styleSheet } from "j20";

const App = () => {
  const sheet = styleSheet(
    "dynamic-style",
    `
    .dynamic { color: blue; }
  `
  );

  // sheet 是 CSSStyleSheet 实例
  // 可以使用 CSSStyleSheet API 动态修改规则
  sheet.insertRule(".new-rule { color: green; }", sheet.cssRules.length);

  return <div class="dynamic">Hello J20</div>;
};
```

### 自动挂载与清理

`styleSheet` 会自动检测当前组件的运行环境：

- 如果在 Web Component 中（存在 Shadow Root），样式会注入到 Shadow Root 的 `adoptedStyleSheets` 中
- 如果在普通组件中，样式会注入到 `document.adoptedStyleSheets` 中
- 组件销毁时自动清理，同一组件内多次引用相同样式会通过引用计数管理，避免重复注入

## 与 Web Component 样式的关系

除了使用 `createCss` 和 `styleSheet`，Web Component 还支持通过 `customElement.style` 配置静态样式，详见 [Web Component](/guide/web-component)。

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

三种样式方案的适用场景：

| 方案                  | 适用场景                     | 作用域隔离      |
| --------------------- | ---------------------------- | --------------- |
| `customElement.style` | Web Component 专属样式       | Shadow DOM 隔离 |
| `createCss`           | 跨组件复用的样式，需要隔离   | 类名后缀隔离    |
| `styleSheet`          | 全局样式或需要动态操作的样式 | 无隔离          |
