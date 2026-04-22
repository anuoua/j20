---
url: /j20/en/guide/component.md
---
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

## Derived Signals

Use `const` with the `$` prefix to declare a derived signal. Derived signal values are immutable and read-only.

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

J20's best practice for slots is to encapsulate them as render functions, unless they are static slots (like Web Component slots). Any reusable slot should be encapsulated as a render function.

```tsx
const App = ($props: {
  header: JSX.Element;
  option: () => JSX.Element;
}) => {
  let $visible = false;

  return (
    <div>
      <div class="header">
        {$props.header}
      </div>
      <div>
         <If of={$visible} else={<div>{$props.option(false)}</div>}>
          {$props.option()}
        </If>
      </div>
    </div>
  );
};

<App
  header={<h1>header</h1>}
  some={(visible) => <div>{visible ? "none" : "some"}</div>}
/>
```
