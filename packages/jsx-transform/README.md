# @j20org/jsx-transform

j20 框架的 JSX 编译器 —— 一个 Babel 插件，把 JSX 编译成 j20 运行时的细粒度响应式调用（`jsx` / `jsxs` / `template` / `Fragment`）。

编译目标与 [SolidJS](https://www.solidjs.com/) 的 dom-expressions 风格一致：

- 静态 DOM 标签与静态属性被提升为 `template()` 常量，运行时通过 `cloneNode` 复用，零 diff。
- 动态属性编译为 getter，运行时按属性粒度建立 `effect`，互不影响。
- 响应式子表达式被包装成 thunk（`() => expr`），由运行时追踪。

```jsx
const App = () => <div>{$hello}</div>
```

会编译为类似下面的代码（运行时函数从 `importSource` 自动导入）：

```js
const __tmpl1 = _template(`<div>`)
const App = () => _jsx(__tmpl1(), undefined, () => () => $hello)
```

## 安装

```bash
npm i @j20org/jsx-transform
```

## 配置

```ts
interface Config {
  /** 是否自动从 importSource 注入 jsx/jsxs/template/Fragment 导入，默认 true */
  autoImport?: boolean
  /** 运行时函数的导入来源，例如 "j20" */
  importSource: string
}
```

默认值：

```ts
{ autoImport: true, importSource: "j20" }
```

## 使用

### 作为 Babel 插件

需要配合 `@babel/plugin-syntax-jsx` 解析 JSX 语法（本插件只做转换，不负责解析）。

```js
// babel.config.js
import { j20JsxTransform } from "@j20org/jsx-transform"

export default {
  plugins: [
    "@babel/plugin-syntax-jsx",
    [j20JsxTransform, { importSource: "j20" }],
  ],
}
```

### 作为 Rollup 插件

通过 `/rollup` 子路径导出：

```ts
import { j20JsxTransformRollup } from "@j20org/jsx-transform/rollup"

interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
  sourcemap?: boolean // 默认 true
  config?: Config
}

j20JsxTransformRollup({
  include: "src/**/*.{js,jsx,ts,tsx}",
  config: { importSource: "j20" },
})
```

> 通常你不需要直接使用本包。j20 的官方脚手架通过 `@j20org/vite-plugin` 已经把 JSX 转换、Signal 编译等串联好，参见 [j20](../j20/README.md)。

## 导出

| 路径 | 导出 | 说明 |
| --- | --- | --- |
| `@j20org/jsx-transform` | `j20JsxTransform`, `Config` | Babel 插件 |
| `@j20org/jsx-transform/rollup` | `j20JsxTransformRollup`, `Options` | Rollup 插件 |

## 行内组件（render prop）

行内组件（render prop）是**匿名函数**，没有名字，signal-compiler 无法自动识别为组件。因此 jsx-transform 会在满足以下**全部条件**时，在函数节点上附加 `/* @signal-component */` 块注释标记，signal-compiler 检测到标记后按组件编译（参数解构 → `computed`）：

1. 属性名大写开头（如 `Insert={...}`）；
2. 属性值是无名函数（箭头函数或无 id 的函数表达式）；
3. 解构参数中含有 `$` 绑定（如 `({ value: $value }) => ...`）。

```jsx
<TodoItem Insert={({ value: $value }) => {
  let $msg = "msg";
  return <div>{$value}{$msg}</div>;
}} />
```

编译为（配合 signal-compiler 的第二 pass）：

```js
// jsx-transform 输出：
get Insert() {
  return /* @signal-component */({ value: $value }) => {
    let $msg = "msg";
    return _jsxs(__tmpl1(), undefined, () => [() => $value, () => $msg]);
  };
}

// signal-compiler 输出：
get Insert() {
  return /* @signal-component */__$0 => {
    const $value = _computed(() => __$0.value["value"]);
    let $msg = _signal("msg");
    return _jsxs(__tmpl1(), undefined, () => [() => $value.value, () => $msg.value]);
  };
}
```

> 标记必须是块注释（不能用行注释——行内组件常在 `return` 位置，行注释会触发 ASI 损坏代码），且 jsx-transform 必须先于 signal-compiler 执行（独立 Babel pass）。

## License

MIT @anuoua
