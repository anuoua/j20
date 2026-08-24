# FAQ

## Reactivity Chain Propagation

**Signals must be passed through `$`-prefixed variables to maintain reactivity**

According to the [Signal Compiler](https://github.com/anuoua/signal-compiler) compilation strategy, only variables with the `$` prefix are recognized by the compiler.

Example with custom hook:

```javascript
let $msg = ""; // Declaration
const $display = $msg + "hello"; // Derived

const $useText = ($a) => ({
  $text: $a + "hello"
});

// Returns signal
const { $text } = $useText(
  // Input signal
  $display
);
```

```
Declaration signal -> Derived signal -> Hook(input signal) -> Hook(return signal) -> Derived signal/destructured signal
```

Each step compiles the signal, so reactivity is not interrupted. This is the signal reactivity chain propagation.

## Why use `$` prefix?

First: To mark variables with the `$` prefix for compilation into signal-related code. This marker is unambiguous (to avoid conflicts with very few third-party libraries - please use aliases if needed). The compilation plugin is open source - see [signal-compiler](https://github.com/anuoua/signal-compiler) for details.

Second: To avoid confusion with normal (non-Signal) variables. In large applications, **the number of variables is enormous**, and developers cannot distinguish between signal variables and normal variables, making debugging difficult.

## Calling a function that reads and writes the same signal inside an effect causes an infinite loop

During execution, an effect collects **every signal it reads**, including signals read inside functions called by the effect body. If a function “reads then writes” the same signal (typically a registration function like `$list = [...$list, x]`), the effect ends up depending on a signal it writes itself: the write triggers a re-run → the re-run writes again → infinite loop, freezing the page's event loop.

```tsx
let $messages: string[] = [];
const register = (id) => {
  $messages = [...$messages, id]; // reads $messages (tracked by effect) → writes $messages → self-trigger
};

effect(() => {
  if ($valid) register("err"); // ← divergent self-write, infinite loop
});
```

Fix: wrap the reads and writes inside the registration function with `untrack` so they are not collected as dependencies of the current effect:

```tsx
import { untrack } from "j20";

const register = (id) => {
  untrack(() => {
    $messages = [...$messages, id];
  });
};
```

Notes:

- `untrack` only affects **the current effect's dependency collection**; it does not affect notifications of signal changes to other effects / views, so the registration result still triggers UI updates normally.
- Convergent self-writes (an effect reading and writing the same signal but naturally converging, e.g. a counter that stops at a threshold) are supported behavior — don't use `untrack` to break them; `untrack` is only for **divergent** registration / backfill-style reads and writes.
