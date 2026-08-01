# 性能优化：单行更新

在 `For` 列表渲染中，`item` 是一个**可写信号**。直接赋值 `$item = newValue` 只更新这一行的渲染，**不会触发整表的 diff**。这是 J20 提供的行级性能优化手段。

## 机制

```tsx
import { For } from 'j20';

let $todos = [{ id: 1, text: 'todo1', done: false }];

<For of={$todos} trait={i => i.id}>
  {($todo, $index) => (
    <div class={$todo.done ? 'done' : ''}>
      {$todo.text}
      <button onClick={() => { $todo = { ...$todo, done: !$todo.done } }}>
        toggle
      </button>
    </div>
  )}
</For>
```

点击按钮时：

1. `$todo = { ...$todo, done: true }` 编译为 `$todo.value = {...}`，写入行信号
2. 只有这一行的插值 effect 重新执行，其他行不受影响
3. 写操作同时**写回源数组**（write-through），`$todos` 里对应的项被同步更新

由于 `For` 的 diff effect 只依赖 `of` 对应的数组信号，直接写行信号不会让它重跑，从而跳过整个 diff 流程。

## 适用场景

- **原地编辑**：编辑框内逐字修改某一行内容
- **乐观更新**：勾选完成、点赞、收藏等即时反馈
- **大列表**：只改动一两行时，避免整表 diff 的开销

## 边界与约定

- `$item` 信号只在 **For children 的作用域内**可用，无法作为 props 传给子组件。子组件要触发更新，通过回调闭包捕获行作用域的 `$item`：
  ```tsx
  <For of={$todos} trait={i => i.id}>
    {($todo) => (
      <TodoItem
        text={$todo.text}
        onToggle={() => { $todo = { ...$todo, done: !$todo.done } }}
      />
    )}
  </For>
  ```
- **结构性变更**（增删、排序、过滤）仍通过 `$todos` 重新赋值 + diff 完成；单行更新只适合内容变更。
- **trait 不变**的复用槽位，在数组变更时 diff 会自动把新内容同步到 `$item`，无需手动处理。
- **不要通过 `$item` 修改参与 trait 的字段**（如 `id`）：trait 是 diff 的身份标识，改身份属于结构性变更，应通过数组重新赋值触发 diff：
  ```tsx
  $todos = $todos.map(t => t.id === 1 ? { id: 123, ...t } : t);
  ```
- 跨组件共享、需要持久化的状态，仍然放在数组信号里，以 `$todos` 为唯一数据源。
