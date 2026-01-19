# Web Component

J20 允许用户创建 Web Component 组件，提供一流支持。既能够像普通组件一样使用，也可以像 Web Component 一样通过 html 标签使用，同时类型支持完善。

Web Component 本身**不支持复杂对象**的传参， J20 也不会特殊照顾，我们应当意识到 Web Component 的适用范围，不应该幻想 Web Component 组件能够像普通组件一样使用。

## 创建 Web Component 组件

```tsx
// App.tsx
import { WC } from "j20";

// props 类型，仅支持 string, number, boolean
interface AppProps {
  name: string;
}

// 自定义事件以及携带的 payload 类型
// 组件内调用事件的名称，它的映射规则和 DOM 元素一致
//   delete -> onDelete
//   add -> onAdd
interface AppEvents {
  delete: number;
  add: number;
}

const App: WC<AppProps, AppEvents> = ($props) => {
  return (
    <div class="container" onClick={() => $props.onDelete(1)}>
      {$props.name}
    </div>
  );
};

App.customElement = {
  // html tag
  tag: "my-app",
  // attachShadow mode: open 或者 closed
  mode: "open",
  // 入参和html属性的映射,类型支持 "string", "number", "boolean"
  props: {
    name: {
      type: "string",
      attribute: "name",
    },
  },
  // 组件样式
  style: `
    .container {
      color: red;
    }
  `,
};
```

## 像普通组件一样使用

```tsx
<App
  name="hello"
  onDelete={(value) => {
    console.log(value);
  }}
/>
// console.log 1
```

## 通过 html 标签使用

通过 html 标签使用，需要先注册组件。

### 注册组件

```tsx
import { registerWebComponent } from "j20";
import App from "./App.tsx";

registerWebComponent(App);
```

### 在 J20 中使用

```tsx
<my-app name="hello" onDelete={(value) => console.log(value)} />
// console.log => CustomEvent { ... detail: 1 }
```

### 在原生 html 中使用

意味着这种形态的组件是可以运行在任何框架中。

```html
<my-app name="hello" />
<script type="text/javascript">
  document.querySelector("my-app").addEventListener("delete", (e) => {
    console.log(e);
  });
  // console.log => CustomEvent { ... detail: 1 }
</script>
```
