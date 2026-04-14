# JSX 语法

J20 的 jsx 和 React 类似，但是并不完全相同。

## class vs className

在 React 中使用 `className`，在 J20 中使用 `class`：

```tsx
// React
<div className="my-class">content</div>

// J20
<div class="my-class">content</div>
```

## style 支持两种写法

J20 支持和原生 html 一样的字符串形式，同时也支持 style 对象。

字符串形式：

```tsx
<div style="color: red; font-size: 16px;">content</div>
```

对象形式：

style 对象的 key 和原生 css 样式名一致，**不是 React 那样的驼峰法命名**。

```tsx
<div style={{ "color": "red", "font-size": "16px" }}>content</div>
```

> 推荐使用字符串形式，更接近原生 HTML。

## 插值

J20 的插值语法需要注意，文本节点和元素节点处理方式并不一样。

### 文本插值

J20 中字符串和数字，会直接转化为文本节点。

```tsx
let text = "hello world"; 
<span>{text}</span>
```

如果 text 为[信号](/guide/component#声明信号)，那么会随着响应变量更新而更新。

 ```tsx
let $text = "hello world"; 
<span>{$text}</span>
```

### 元素节点插值

元素节点插值它不会随着信号变量更新而更新。

```tsx
let $visible = false;
let $el = $visible ? <div>el</div> : null;
<div>{$el}</div>
```

对于节点切换，J20 提供了 `<If>` `<Switch>` `<Replace>` 组件，可以查看[条件渲染](/guide/conditional)。
