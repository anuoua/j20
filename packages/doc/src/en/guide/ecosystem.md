# Ecosystem

## Stylec

[Stylec](https://github.com/anuoua/stylec) is a compile-time CSS-in-JS solution. Write normal CSS in `*.stylec.css` files (with support for nesting, `&`, `var()`, etc.), and the compiler emits a `*.stylec.ts` module that exports:

- **`classes`**: a map of hashed class names to reference in JSX
- **`css`**: the raw compiled CSS string
- **`override()`**: a typed method for generating scoped variant styles
- **`cssHash`**: the raw hash behind the class names, as an escape hatch for complex selectors

stylec includes no injection logic — injecting the CSS into the DOM is the framework's job. In J20, use the `styleSheet` API to inject the exported `css`.

### Install

```sh
pnpm add @stylec/runtime
pnpm add -D @stylec/vite
```

### Vite config

Enable the `@stylec/vite` plugin in `vite.config.mjs`. It automatically compiles `.stylec.css` files under `src` into sibling `.stylec.ts` modules during dev and build (the `include` option defaults to `["src"]` and can be omitted):

```ts
import { defineConfig } from "vite";
import { j20 } from "@j20org/vite-plugin";
import { stylec } from "@stylec/vite";

export default defineConfig({
  plugins: [
    j20(),
    stylec(),
  ],
});
```

### Usage

```tsx
import { styleSheet } from "j20";
import { css, classes } from "./Button.stylec";

const Button = () => {
  styleSheet(css);

  return <button class={classes.button}>Click</button>;
};
```

For more details, see the [Stylec documentation](https://github.com/anuoua/stylec).
