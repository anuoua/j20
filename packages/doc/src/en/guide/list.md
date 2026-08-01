# List Rendering

J20 provides the `For` component for list rendering.

## Basic Usage

```tsx
import { For } from 'j20';

let $todos = [{ id: 1, text: 'todo1' }, { id: 2, text: 'todo2' }]

<For of={$todos} trait={i => i.id}>
  {($todo, $index) => (
    <div>
      index: {$index}
      text: {$todo.text}
    </div>
  )}
</For>
```

## Important Concepts

- **trait**: Determines uniqueness (similar to `key` in other frameworks). Generally it can be omitted, in which case uniqueness is based on the list item itself - i.e., trait defaults to `i => i`
- **item parameter**: The list item is the first parameter of children. Naming it with a leading `$` (e.g. `$todo`) keeps it reactive
- **$index**: Is a signal - changes as items are added/removed from the array

## Updating Lists

List rendering updates through array modification.

```tsx
// Signals don't deeply proxy arrays - just reassign
$todos = [...$todos, { id: 3, text: "new" }];
```

For more details on list rendering and performance optimizations (single-row content updates, etc.), see [Performance](/en/guide/perf).
