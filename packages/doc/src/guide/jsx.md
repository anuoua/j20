# JSX 语法

J20 的 jsx 和 React 类似，但是并不完全相同。

## 主要差异

### class vs className

在 React 中使用 `className`，在 J20 中使用 `class`：

```tsx
// React
<div className="my-class">content</div>

// J20
<div class="my-class">content</div>
```

### style 支持两种写法

J20 支持和原生 html 一样的字符串形式，同时也支持 style 对象。

#### 字符串形式

```tsx
<div style="color: red; font-size: 16px;">content</div>
```

#### 对象形式

style 对象的 key 和原生 css 样式名一致，**不是 React 那样的驼峰法命名**。

```tsx
<div style={{ "color": "red", "font-size": "16px" }}>content</div>
```

> 推荐使用字符串形式，更接近原生 HTML。
