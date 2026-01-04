# Conditional Rendering

J20 provides `If`, `Some`, and `Switch` components for conditional rendering.

## If Component

`If` handles simple conditional rendering

```tsx
import { If } from "j20";

let $visible = true;

<If of={$visible} else={<div>invisible</div>}>
  <span>visible</span>
</If>;
```

## Switch Component

`Switch` handles multi-condition rendering - only the first Case with `of=true` is rendered. Used for rendering with multiple mutually exclusive conditions. `Default` is the fallback.

```tsx
import { Switch, Case, Default } from "j20";

let $value = 1;

<Switch>
  <Case of={$value === 1}>1</Case>
  <Case of={$value === 2}>2</Case>
  <Default>default</Default>
</Switch>;
```

## Some Component

`Some` handles values that may be `null` or `undefined`. When the `of` prop is not `null` or `undefined`, it renders the child function. Otherwise renders the `none` content.

Use with optional chaining - provides excellent TypeScript type hints and greatly improves developer experience.

```tsx
import { Some } from "j20";

let $data: { person?: { name: string } } | undefined;

<Some of={$data?.person} none={<div>No data</div>}>
  {($person) => <div>Hello {$person.name}</div>}
  {/* $person is non-null and is a signal value */}
</Some>;
```
