# Performance: Single-row Updates

In `For` list rendering, `item` is a **writable signal**. Assigning `$item = newValue` directly updates only that row's rendering and **does not trigger the full list diff**. This is J20's row-level performance optimization.

## How it works

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

When the button is clicked:

1. `$todo = { ...$todo, done: true }` compiles to `$todo.value = {...}`, writing to the row signal
2. Only this row's interpolation effects re-run; other rows are untouched
3. The write also **writes back to the source array** (write-through), so the corresponding entry in `$todos` is kept in sync

Since `For`'s diff effect depends only on the array signal behind `of`, writing the row signal directly does not re-run it - the whole diff is skipped.

## When to use it

- **In-place editing**: typing updates that touch a single row
- **Optimistic updates**: toggling done, likes, favorites - instant feedback
- **Large lists**: changing only one or two rows without paying the full diff cost

## Boundaries and conventions

- The `$item` signal is only available **inside the `For` children scope**; it cannot be passed to a child component as a prop. To trigger an update from a child component, capture the row-scoped `$item` in a callback closure:
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
- **Structural changes** (add, remove, sort, filter) still go through `$todos` reassignment + diff; single-row updates are for content changes only.
- For reused slots whose trait stays the same, the diff automatically syncs new content into `$item` when the array changes - no manual handling needed.
- **Do not use `$item` to modify fields that participate in `trait`** (e.g. `id`): trait is the diff's identity marker; changing identity is a structural change and should go through array reassignment to trigger the diff:
  ```tsx
  $todos = $todos.map(t => t.id === 1 ? { id: 123, ...t } : t);
  ```
- Shared, persistent state should stay in the array signal, with `$todos` as the single source of truth.
