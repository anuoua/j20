# 列表渲染

J20 提供了 `For` 组件，用于列表渲染。

## 基本用法

```tsx
import { For } from 'j20';

let $todos = [{ id: 1, text: 'todo1' }, { id: 2, text: 'todo2' }]

<For of={$todos} trait={i => i.id}>
  {(todo, $index) => (
    <div>
      index: {$index}
      text: {todo.text}
    </div>
  )}
</For>
```

## 重要概念

- **trait**：用来确定唯一性（类似其他框架的 key ），一般可以不传，那么唯一性判断的依据是列表项本身。即 trait 默认为 `i => i`，注意：trait 值变化是触发项更新的唯一依据
- **todo**：不是信号，数组项不可变
- **$index**：是信号，会随着数组项的增减而改变

## 更新列表

列表的渲染通过修改数组来更新。

```tsx
// Signal 不会深度劫持数组，重新赋值即可
$todos = [...$todos, { id: 3, text: "new" }];
```
