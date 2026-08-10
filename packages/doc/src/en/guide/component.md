# Components

J20 components are similar to React components. If you're familiar with React, you can quickly get started.

```tsx
const App = () => {
  const $msg = "hello world";

  return <span>{$msg}</span>;
};
```

## Component State

J20 component state is driven by signals. Thanks to J20's innovative compilation, you can use signals just like normal variables seamlessly.

## Declaring Signals

Use the `let` keyword with the `$` prefix to declare a signal.

Signal values are mutable - directly assigning a value updates the view.

```tsx
const App = () => {
  let $msg = "hello world";

  const onClick = () => {
    $msg = $msg + " j20";
  };

  return <span onClick={onClick}>{$msg}</span>;
};
```

### Any value works

`let` signals are not limited to primitives — **any expression (including object literals) is automatically wrapped in `signal(...)`**:

```tsx
const App = () => {
  let $state = {
    open: false,
    setOpen: (next: boolean) => {
      $state = { ...$state, open: next };
    },
  };

  return (
    <button onClick={() => $state.setOpen(true)}>
      {String($state.open)}
    </button>
  );
};
```

> When updating a compound value, **rebuild the object reference** (immutable update). A signal only notifies when its reference changes:
> `$state = { ...$state, open: next }` ✓ triggers update
> `$state.open = next` ✗ same reference, no update

### Compile rules at a glance

| Source | Compiled to |
| --- | --- |
| `let $x = v` | `let $x = signal(v)` |
| `const $x = expr` | `const $x = computed(() => expr)` |
| read `$x` | `$x.value` |
| assign `$x = v` | `$x.value = v` |
| read `$x.field` | `$x.value.field` |

> **Never write `$x.value` in source**. The compiler inserts `.value` for you:
> - Reading would become `$x.value.value`
> - Type-wise `$x` is the value type (no `.value` property), so it fails type-check
>
> Always write `$x` / `$x.field`; the compiler handles `.value`.

## Derived Signals

Use `const` with the `$` prefix to declare a derived signal. Derived signal values are immutable and read-only.

`const $x = expr` compiles to `computed(() => expr)` and recomputes automatically when the `$` signals it depends on change. **Derived signals cannot be assigned** (it compiles to an assignment on a computed, which is a no-op at runtime):

```tsx
const App = () => {
  let $msg = "hello world";
  let $count = 1;

  // String concatenation
  const $displayMsg = "display: " + $msg;

  // Math calculation
  const $double = $count * 2;
  const $isEven = $count % 2 === 0;

  const onClick = () => {
    $msg = $msg + " j20";
    $count++;
  };

  return (
    <span onClick={onClick}>
      {$displayMsg} - Count: {$double} (Even: {$isEven.toString()})
    </span>
  );
};
```

> Note: Signal variables cannot start with `$use`. `$use` is the prefix for custom hooks and has special compilation behavior.

## Custom Hooks

Custom hooks use the `$use` prefix and support destructuring. Destructured variables starting with `$` maintain reactivity.

```tsx
const $useCount = () => {
  let $count = 0;

  return {
    count: $count,
  };
};

const { count: $count } = $useCount();
console.log($count);

const $res = $useCount();
console.log($res.count);
```

Question: Can custom hooks directly return `{ $count }`?

```tsx
const $useCount = () => {
  let $count = 0;

  return {
    $count, // $ prefix directly as a property name - use with caution, easily confused with signals
  };
};

const { $count } = $useCount();
// Clean destructuring, convenient to use
console.log($count);

// Bad practice
// `$res` is a signal
const $res = $useCount();
// `.$count` is just a property of `$res` (not a signal), but has a $ prefix, easily confusing
console.log($res.$count);
```

This approach makes writing and destructuring more convenient, but please don't abuse it. Keep clean destructuring usage - we want the meaning of the `$` prefix to be unambiguous.

Note: Destructured variable names must start with `$`. If not, you need to set a `$`-prefixed alias, otherwise reactivity is lost.

For more details, see [Reactivity Chain Propagation](/en/guide/faq#reactivity-chain-propagation).

## Component Props

Component parameters are derived signals, so variable names must start with `$`.

```tsx
function Msg($props: { name: string }) {
  return <span>{$props.name}</span>;
}

function App() {
  let $name = "hello";

  return <Msg name={$name} />;
}
```

> If `<Msg name="hello" />` where name is a static value, then the `$name` signal inside the component will always be `"hello"`.

## Props Destructuring

Destructured field variable names must start with `$` to maintain reactivity. They are read-only derived signals.

```tsx
function Msg({ name: $name }: { name: string }) {
  return <span>{$name}</span>;
}

// Bad usage
// If the function parameter name or destructured variable name doesn't start with $,
// the function's parameters **will not be compiled**
// This means the function receives raw values - whatever is passed in from outside
// may cause type and actual value inconsistencies
function Msg({ name }: { name: string }) {
  return <span>{name}</span>;
}
```

## Component Slots

When a component's content area needs to be customized by its users, J20 offers two approaches depending on the nature of the content:

- **Static content** — a fixed fragment that does not participate in reactive updates; put it in `children` or a lowercase prop.
- **Inline components (render props)** — reusable fragments that take parameters and participate in reactivity; pass them as capitalized props, replacing React's render prop pattern.

### Inline components (render props)

Content that takes parameters and participates in reactive updates can be defined as an anonymous function on a component prop — the replacement for React's render prop pattern.

The compiler recognizes a slot function by three conventions, and only compiles it as a component when all three hold (`$`-destructured params become read-only derived signals):

1. **Capitalized attribute name** (`Action`, `Header` — component-style naming);
2. **Anonymous function value** (arrow function or anonymous function expression);
3. **`$`-destructured params** (`({ count: $count })`).

#### Declaring a component with slots

Declare slot props with `FC<Props>` and invoke the slot via JSX inside the component:

```tsx
const Panel = ($props: {
  title: string;
  Action?: FC<{ count: number }>;
}) => {
  let $count = 0;
  const { Action } = $props;

  return (
    <div class="panel">
      <h2>{$props.title}</h2>
      {Action ? <Action count={$count} /> : null}
    </div>
  );
};
```

#### Using slots

```tsx
<Panel
  title="Counter"
  Action={({ count: $count }) => <span>Current: {$count}</span>}
/>
```

`$count` inside the slot is a **read-only derived signal**: it updates automatically when the parent's signal changes; you cannot assign to `$` params inside a slot (`$count++` is a no-op).

#### Always invoke slots via JSX

Slots must be invoked in JSX form — the runtime wraps props into a reactive signal, so the slot can read values and stay reactive:

```tsx
// ✅ Correct: JSX invocation
{Action ? <Action count={$count} /> : null}

// ❌ Wrong: direct function call — the slot cannot access the reactive value
{$props.Action({ count: $count })}
```

> Guard optional slots before rendering; rendering an `undefined` component throws.

### Static content

Content that needs no parameters and does not participate in reactive updates doesn't need a slot at all. Two placements:

1. **children**: `<Panel>static content</Panel>`;
2. **lowercase props**: `<Panel bottom={<span>bottom</span>} />`.

J20 JSX props are lazy — a bound object is initialized only when the component actually uses it, so static content costs nothing.

```tsx
const Panel = ($props: {
  children?: JSX.Element;
  bottom?: JSX.Element;
}) => {
  const { children, bottom } = $props;

  return (
    <div>
      {children}
      {bottom}
    </div>
  );
};

<Panel bottom={<span>bottom</span>}>static content</Panel>
```

Static content has a single constraint: **the bound object must be stable** — once created, it never changes. Because it is stable, you can simply destructure and use it inside the component; no signal conversion needed.

"Stable" means the object itself never changes, not that the content can never change. If content must switch between two states, don't write that mutation into the prop binding:

```tsx
// ❌ Unstable: bottom flips between two objects as $visible changes
<Panel bottom={$visible ? <span>visible</span> : <div>invisible</div>} />

// ✅ Stable: bottom is always the same <If> object; the switch happens inside If
<Panel bottom={<If of={$visible} else={<div>invisible</div>}><span>visible</span></If>} />
```

The appearance, disappearance and switching of content — UI mutations — are the responsibility of logic components like `If` / `For` / `Switch`. Expressing mutations with dynamic expressions does work (e.g. forcing a remount with `Replace`), but it scatters rendering logic into prop bindings — don't do this.

### Replacing React render props

| React | J20 |
| --- | --- |
| `props.header(data)` (render prop) | `const { Header } = $props;` → `<Header {...data} />` |
| `props.children(data)` (children as a function) | `const { Children } = $props;` → `<Children {...data} />` |
| static content (fixed JSX) | children or lowercase props |

On the J20 side, destructure the slot component first, then invoke it via JSX, passing data with `{...data}` spread.

> Lowercase `children` is reserved for built-in logic components (`If` / `For` / `Switch`, etc.); for function-based content in your own components, use a capitalized inline component (e.g. `Children`) — not lowercase `children`.
