# Context

J20's Context lets you pass data through the component tree without prop drilling, similar to React's Context.

## Creating a Context

`createContext` creates a context object; the generic is the value type:

```tsx
import { createContext } from "j20";
export const SomeContext = createContext<{ name: string }>({ name: "" });
```

The default value is only used when **no Provider is matched** in the component tree.

## Providing a value

Use the context object directly as a JSX element — no extra Provider component is needed:

```tsx
<SomeContext value={{ name: "J20" }}>
  <Inner />
</SomeContext>;
```

### Passing a mutable value

When the context value needs to update, carry it in a `let $` variable (compiled to a `signal`) and **rebuild the object reference** on update:

```tsx
function Provider() {
  let $state = {
    name: "J20",
    setName: (name: string) => {
      $state = { ...$state, name };
    },
  };

  return (
    <SomeContext value={$state}>
      <Inner />
    </SomeContext>
  );
}
```

> Updating a compound value must rebuild the object reference (`$state = { ...$state, name }`). Mutating in place (`$state.name = name`) does not trigger updates — see [Components - Declaring Signals](/en/guide/component#declaring-signals).

## Consuming a value

### $useContext

```tsx
import { $useContext } from "j20";
import { SomeContext } from "./SomeContext";

function Inner() {
  const $ctx = $useContext(SomeContext);
  return <span>{$ctx.name}</span>;
}
```

`$ctx` is a reactive wrapper. Reading `$ctx.field` inside render or effects subscribes to it, and re-runs when the value changes.

### Consumer

```tsx
<SomeContext.Consumer>
  {($ctx) => <span>{$ctx.name}</span>}
</SomeContext.Consumer>
```

## Subscription granularity

Reading `$ctx.field` directly subscribes to the **whole context value** (object level): any field update re-runs that read.

For fine-grained subscription to a single field, derive it into a `$`-prefixed variable:

```tsx
const $name = $ctx.name; // compiles to computed(() => $ctx.value.name)
// only expressions subscribed to $name re-run when name changes
```

## Default value

When no Provider is matched, `$useContext` / `Consumer` return the default value passed to `createContext`:

```tsx
const SomeContext = createContext<{ name: string }>({ name: "default" });

// when there's no <SomeContext> in the tree:
$ctx.name // "default"
```
