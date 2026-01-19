---
url: /j20/en/guide/api.md
---
# API Reference

## Overview

* [signal](#signal)
* [computed](#computed)
* [ref](#ref)
* [effect](#effect)
* [wc](#wc)
* [untrack](#untrack)
* [onMount](#onmount)
* [onDestroy](#ondestroy)
* [createContext](#createcontext)
* [$useContext](#usecontext)

## signal

Type: `<T>(init: T): Signal<T>`

*Creates a signal value. Typically not used directly - automatically created by the compiler.*

## computed

Type: `<T>(fn: () => T) => Computed<T>`

*Creates a derived signal value. Typically not used directly - automatically created by the compiler.*

## ref

Type: `<T>(init?: T): { current: T | null; }`

References a DOM element.

```tsx
import { ref } from "j20";

const App = () => {
  const domRef = ref<HTMLInputElement>();

  onMount(() => {
    console.log(domRef.current);
  });

  return <input ref={domRef} />;
};
```

## effect

Type: `(handler: () => void | (() => void)) => Effect`

Side effect function that executes during component rendering, collects signals used during execution, re-executes when dependencies change, and runs cleanup functions before re-execution.

```tsx
import { effect } from "j20";

const App = () => {
  let $count = 0;

  const cancel = effect(() => {
    const timer = setInterval(() => {
      $count++;
    }, 1000);

    // Cleanup function
    return () => {
      clearInterval(timer);
    };
  });

  return <button onClick={cancel}>hello: {$count}</button>;
};
```

## wc

Type:

```typescript
() => {
    host: HTMLElement;
    emit: (name: string, detail: any) => void;
    onConnectedCallback: (callback: () => void) => void;
    onDisconnectedCallback: (callback: () => void) => void;
}
```

Gets Web Component instance and methods through `wc`. Only usable within Web Component components.

* **host**: Web Component instance
* **emit**: Trigger event
* **onConnectedCallback**: Web Component mount callback
* **onDisconnectedCallback**: Web Component unmount callback

```tsx
import { wc, WC } from "j20";
const App: WC<{}, { eventName: { payload: { data: string } } }> = () => {
  const { host, emit, onConnectedCallback, onDisconnectedCallback } = wc();

  onConnectedCallback(() => {
    emit("eventName", { payload: { data: "hello" } });
  });
  onDisconnectedCallback(() => {});

  return <div>some</div>;
};

App.customElement = {
  tag: "my-app",
  mode: "open",
};
```

## untrack

Type: `<T>(fn: () => T): T`

Skips dependency collection during function execution to achieve non-observed effects, while still returning a value.

```tsx
import { untrack } from "j20";

const App = () => {
  let $count = 0;

  // After clicking button, count increments but view doesn't update
  const handleClick = () => {
    $count++;
  };

  return <div onClick={handleClick}>{untrack(() => $count)}</div>;
};
```

## onMount

Type: `(callback: () => (() => void) | void) => void`

See [Lifecycle](/en/guide/lifecycle)

## onDestroy

Type: `(callback: () => void) => Effect`

See [Lifecycle](/en/guide/lifecycle)

## createContext

Type:

```typescript
<T>(defaultValue: T) => {
    (p: {
        children: JSX.Element;
        value: T;
    }): HTMLElement;
    Consumer: {
        (p: {
            children: (value: T) => JSX.Element;
        }): JSX.Element;
    };
    defaultValue: T;
}
```

J20 provides the `createContext` method for creating context.

Usage is similar to React 19 - no additional Provider needed. Use the created context object directly.

```tsx
import { createContext } from "j20";
export const SomeContext = createContext<{ name: string }>({ name: "" });

<SomeContext value={{ name: "J20" }}>
  <Inner />
</SomeContext>;

function Inner() {
  return (
    <SomeContext.Consumer>
      {/* $ctx is a signal */}
      {($ctx) => <span>{$ctx.name}</span>}
    </SomeContext.Consumer>
  );
}
```

## $useContext

Type: `<T>(c: { defaultValue: T }) => T`

Gets context data.

```tsx
import { $useContext } from "j20";
import { SomeContext } from "./SomeContext";

function Inner() {
  const $ctx = $useContext(SomeContext);
  return <span>{$ctx.name}</span>;
}
```

## $

Type: `<T>(val: T) => T extends SignalLike ? (typeof val)["value"] : SignalLike<T>`

Converter between signal variables and normal variables. When you know a variable is reactive, or when you need to convert a reactive variable to a normal variable, use `$` to convert it.

**Main Use Cases**

1. **Type escape**: When passing Signal objects to third-party libraries that don't support J20 syntax
2. **Debugging**: Inspect Signal object internal structure in console

### Example

```tsx
let $count = 0; // Actually Signal<number>, type in IDE: number

// Scenario: Get actual Signal object instance for debugging or passing to third-party lib
const countSignal = $($count); // Actually Signal<number>, type in IDE: Signal<number>

let $newCount = $(countSignal); // Actually Signal<number>, type in IDE: number
```
