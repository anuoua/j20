---
url: /j20/en/guide/list.md
---
# List Rendering

J20 provides the `For` component for list rendering.

## Basic Usage

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

## Important Concepts

* **trait**: Determines uniqueness (similar to `key` in other frameworks). Generally it can be omitted, in which case uniqueness is based on the list item itself - i.e., trait defaults to `i => i`. Note: a change in trait value is the only trigger for item updates
* **todo**: Not a signal - array items are immutable
* **$index**: Is a signal - changes as items are added/removed from the array

## Updating Lists

List rendering updates through array modification.

```tsx
// Signals don't deeply proxy arrays - just reassign
$todos = [...$todos, { id: 3, text: "new" }];
```
