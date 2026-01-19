---
url: /j20/guide/replace.md
---
# 动态渲染

J20 提供了 `Replace` 组件，用于动态渲染，`of` 的值一旦改变，内部的元素会卸载并重建，用于需要大规模重建的场景。

## 基本用法

```tsx
import { Replace } from "j20";

let $value = 1;

<Replace of={$value}>
  {/* 内容和 $value 有关，可以使用函数获取 value (value 为普通值快照) */}
  {(value) => <div>{value}</div>}
  {/* 内容和 $value 无关，直接渲染 */}
  <div>Some</div>
</Replace>;
```

## 使用场景

`Replace` 组件适合以下场景：

* 需要完全重建组件树的场景
* 需要清理之前状态的场景
* 在多个不同组件之间切换时
