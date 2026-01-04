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
