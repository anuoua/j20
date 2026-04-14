---
name: j20
description: 'J20 前端框架开发指南。J20 是一个基于 Signal 的 Web Component 前端框架，使用创新的命名标记编译技术实现无感 Signal 驱动、无虚拟 DOM 的高性能 Web 应用开发。 当用户提到 j20 框架、使用 j20 开发组件、询问 j20 的 JSX 语法/信号/生命周期/样式/Web Component/条件渲染/列表渲染/上下文等用法时， 或者用户需要将 React 代码迁移到 J20、在使用 J20 时遇到问题需要排查时，都应该使用此 skill。 即使用户只是提到 "信号"、"Signal"、"Web Component 框架" 等关键词，且上下文与 J20 相关，也应触发此 skill。'
---

# J20 框架开发指南

J20 是一个基于 Signal 的 Web Component 前端框架，核心特点：

- **无感 Signal 驱动**：通过 `$` 前缀声明信号，编译器自动处理响应式
- **无虚拟 DOM**：直接操作 DOM，高性能
- **命名标记编译技术**：原创的 Signal 编译方案，开发体验接近普通变量
- **Web Component 一流支持**：可创建标准 Web Component

## 核心概念速查

### 信号声明

```tsx
let $count = 0; // 可变信号，直接赋值更新
const $double = $count * 2; // 派生信号，只读
```

`$` 前缀是编译器识别信号的关键标记，所有需要保持响应性的变量都必须以 `$` 开头。

### 组件

```tsx
const App = ($props: { name: string }) => {
  return <span>{$props.name}</span>;
};
```

组件入参是派生信号，变量名必须以 `$` 开头。Props 解构同理：`({ name: $name })`。

### 条件渲染

- `<If of={$cond}>` — 简单条件
- `<Switch><Case of={...}>` — 多条件互斥
- `<Some of={$data?.field} none={...}>` — 可选值处理

### 列表渲染

```tsx
<For of={$list} trait={(i) => i.id}>
  {(item, $index) => <div>{item.text}</div>}
</For>
```

### 生命周期

- `onMount(() => { ... })` — DOM 渲染完成后执行
- `onDestroy(() => { ... })` — 组件卸载时清理

### 样式

- `createCssModule(css)` — 作用域隔离的 CSS，类名自动添加唯一后缀
- `styleSheet(css, id?)` — 全局样式注入
- `customElement.style` — Web Component Shadow DOM 样式

### Web Component

```tsx
const App: WC<Props, Events> = ($props) => { ... };
App.customElement = { tag: "my-app", mode: "open", props: {...}, style: "..." };
registerWebComponent(App);
```

### 上下文

```tsx
const Ctx = createContext(defaultValue);
// 提供值：<Ctx value={...}>
// 消费值：$useContext(Ctx) 或 <Ctx.Consumer>
```

### 其他 API

- `ref<T>()` — 引用 DOM 元素
- `effect(() => { ... })` — 副作用，自动追踪依赖，支持清理函数
- `untrack(() => expr)` — 跳过依赖收集
- `$useContext(ctx)` — 获取上下文（信号值）
- `$(val)` — 信号与普通变量的转换器

## 与 React 的关键差异

| 特性       | React                   | J20                            |
| ---------- | ----------------------- | ------------------------------ |
| 类名属性   | `className`             | `class`                        |
| style 对象 | 驼峰 `{ fontSize: 16 }` | 原生 `{ "font-size": "16px" }` |
| 状态更新   | `setState` / hooks      | 直接赋值 `$count++`            |
| 虚拟 DOM   | 有                      | 无                             |
| 组件状态   | `useState`              | `let $x = init`                |

## 注意事项

- 信号变量不能使用 `$use` 开头（`$use` 是自定义 hooks 前缀）
- 解构变量必须以 `$` 开头才能保持响应性
- 元素节点插值不会随信号更新，需使用 `<If>` / `<Replace>` 等组件
- Web Component 仅支持 `string | number | boolean` 类型的 props
- 自定义事件命名映射规则与 DOM 一致：`delete` → `onDelete`

## 参考文档

以下是 J20 框架的完整文档，按主题分章节存放。遇到具体问题时，请阅读对应章节获取详细信息。

| 文件                                                       | 内容                                    |
| ---------------------------------------------------------- | --------------------------------------- |
| [references/introduction.md](references/introduction.md)   | 框架介绍与特点                          |
| [references/install.md](references/install.md)             | 安装与项目配置（TypeScript、Vite）      |
| [references/start.md](references/start.md)                 | 创建应用与简单组件                      |
| [references/jsx.md](references/jsx.md)                     | JSX 语法（class、style、插值）          |
| [references/component.md](references/component.md)         | 组件、信号、Props、自定义 Hooks、插槽   |
| [references/conditional.md](references/conditional.md)     | 条件渲染（If、Switch、Some）            |
| [references/list.md](references/list.md)                   | 列表渲染（For 组件）                    |
| [references/replace.md](references/replace.md)             | 动态渲染（Replace 组件）                |
| [references/style.md](references/style.md)                 | 样式管理（createCssModule、styleSheet） |
| [references/lifecycle.md](references/lifecycle.md)         | 生命周期（onMount、onDestroy）          |
| [references/web-component.md](references/web-component.md) | Web Component 创建与使用                |
| [references/api.md](references/api.md)                     | API 完整参考                            |
| [references/faq.md](references/faq.md)                     | 常见问题（响应链传递、`$` 前缀原理）    |
