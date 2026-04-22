---
url: /j20/guide/style.md
---
# 样式

J20 提供了 `createCssModule` 和 `styleSheet` 两个 API 来管理组件样式，基于 [Constructable Stylesheets](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet) 实现，具有高性能和作用域隔离的特点。

## createCssModule

`createCssModule` 用于创建带有作用域隔离的 CSS 样式，自动为类名添加唯一后缀，避免样式冲突。

### 基本用法

```tsx
import { createCssModule } from "j20";

const styles = createCssModule(`
  .container {
    color: red;
    font-size: 16px;
  }
  .title {
    font-weight: bold;
  }
`);

const App = () => {
  const cns = styles();

  return (
    <div class={cns.container}>
      <span class={cns.title}>Hello J20</span>
    </div>
  );
};
```

### 工作原理

`createCssModule` 接收一段 CSS 字符串，返回一个函数。调用该函数时：

1. 自动为 CSS 中的每个类名添加唯一后缀（如 `.container` 变为 `.container_abc123`），实现作用域隔离
2. 将处理后的样式注入到当前组件所在的 Shadow Root 或 Document 中
3. 返回一个 Proxy 对象，通过该对象访问的属性名会自动添加相同的后缀，因此可以直接通过 `cns.container` 获得转换后的类名

### 在多个组件中复用

`createCssModule` 返回的函数可以在多个组件中调用，样式只会被注入一次（通过引用计数管理），组件销毁时自动清理。

```tsx
import { createCssModule } from "j20";

const styles = createCssModule(`
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
  const cns = styles();
  return <button class={`${cns.btn} ${cns.primary}`}>Primary</button>;
};

const SecondaryButton = () => {
  const cns = styles();
  return (
    <button class={`${cns.btn} ${cns.secondary}`}>Secondary</button>
  );
};
```

### 最佳实践

**类名使用 snake\_case，避免使用横杠。** 由于 `createCssModule` 返回的是 Proxy 对象，横杠类名只能通过 `cns["say-hello"]` 访问，而 snake\_case 可以直接使用点语法 `cns.say_hello`：

```tsx
const styles = createCssModule(`
  .say-hello { color: red; }
  .say_hello { color: red; }
`);

const App = () => {
  const cns = styles();
  return (
    <div>
      <span class={cns["say-hello"]}>不推荐</span>
      <span class={cns.say_hello}>推荐</span>
    </div>
  );
};
```

**类名保持平铺，避免多层级选择器。** `createCssModule` 会对顶层类名添加后缀，但嵌套选择器中的类名可能无法正确处理，导致样式失效：

```tsx
const styles = createCssModule(`
  .active .item { color: red; }
  .active_item { color: red; }
`);
```

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

* **css** (`string`)：CSS 文本内容
* **id** (`string`, 可选)：样式表的唯一标识，用于引用计数和去重，默认以 CSS 内容生成的哈希为唯一标识

### 自动挂载与清理

`styleSheet` 会自动检测当前组件的运行环境：

* 如果在 Web Component 中（存在 Shadow Root），样式会注入到 Shadow Root 的 `adoptedStyleSheets` 中
* 如果在普通组件中，样式会注入到 `document.adoptedStyleSheets` 中
* 组件销毁时自动清理，同一组件内多次引用相同样式会通过引用计数管理，避免重复注入

## 与 Web Component 样式的关系

除了使用 `createCssModule` 和 `styleSheet`，Web Component 还支持通过 `customElement.style` 配置静态样式，详见 [Web Component](/guide/web-component)。

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
| `createCssModule`           | 跨组件复用的样式，需要隔离   | 类名后缀隔离    |
| `styleSheet`          | 全局样式或需要动态操作的样式 | 无隔离          |
