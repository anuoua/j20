---
url: /j20/en/guide/style.md
---
# Style

J20 provides two APIs for managing component styles: `createCssModule` and `styleSheet`. Both are built on [Constructable Stylesheets](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet) for high performance and scoped style isolation.

## createCssModule

`createCssModule` creates CSS with scoped class names by automatically appending unique suffixes, preventing style collisions.

### Basic Usage

```tsx
import { createCssModule } from "j20";

const styles = createCssModule(`
  .container {
    color: red;
    font-size: 16px;
  }
  .title {
    font-weight: bold;
  }
`);

const App = () => {
  const cns = styles();

  return (
    <div class={cns.container}>
      <span class={cns.title}>Hello J20</span>
    </div>
  );
};
```

### How It Works

`createCssModule` takes a CSS string and returns a function. When called:

1. Each class name in the CSS is automatically suffixed with a unique identifier (e.g., `.container` becomes `.container_abc123`), achieving scope isolation
2. The processed styles are injected into the current component's Shadow Root or Document
3. A Proxy object is returned whose properties automatically resolve to the suffixed class names, so `cns.container` gives you the transformed class name directly

### Reusing Across Components

The function returned by `createCssModule` can be called in multiple components. Styles are injected only once (managed via reference counting) and are automatically cleaned up when all referencing components are destroyed.

```tsx
import { createCssModule } from "j20";

const styles = createCssModule(`
  .btn {
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
  }
  .primary {
    background-color: blue;
    color: white;
  }
  .secondary {
    background-color: gray;
    color: white;
  }
`);

const PrimaryButton = () => {
  const cns = styles();
  return <button class={`${cns.btn} ${cns.primary}`}>Primary</button>;
};

const SecondaryButton = () => {
  const cns = styles();
  return (
    <button class={`${cns.btn} ${cns.secondary}`}>Secondary</button>
  );
};
```

### Best Practices

**Use snake\_case for class names, avoid hyphens.** Since `createCssModule` returns a Proxy object, hyphenated class names require bracket notation like `cns["say-hello"]`, while snake\_case allows dot notation `cns.say_hello`:

```tsx
const styles = createCssModule(`
  .say-hello { color: red; }
  .say_hello { color: red; }
`);

const App = () => {
  const cns = styles();
  return (
    <div>
      <span class={cns["say-hello"]}>Not recommended</span>
      <span class={cns.say_hello}>Recommended</span>
    </div>
  );
};
```

**Keep class names flat, avoid nested selectors.** `createCssModule` adds suffixes to top-level class names, but class names within nested selectors may not be processed correctly, causing styles to break:

```tsx
const styles = createCssModule(`
  .active .item { color: red; }
  .active_item { color: red; }
`);
```

## styleSheet

`styleSheet` injects a `CSSStyleSheet` directly into the current component's Shadow Root or Document. It is suitable for scenarios that don't require scope isolation.

### Basic Usage

```tsx
import { styleSheet } from "j20";

const App = () => {
  styleSheet(`
    div { box-sizing: border-box; }
    body { margin: 0; }
    .msg { font-size: 16px; }
  `,
  "my-global-style" // optional
  );

  return <div class="msg">Hello J20</div>;
};
```

### Parameters

* **css** (`string`): CSS text content
* **id** (`string`, optional): A unique identifier for the stylesheet, used for reference counting and deduplication. Defaults to a hash generated from the CSS content

### Auto-mounting and Cleanup

`styleSheet` automatically detects the current component's runtime environment:

* Inside a Web Component (with Shadow Root), styles are injected into the Shadow Root's `adoptedStyleSheets`
* Inside a regular component, styles are injected into `document.adoptedStyleSheets`
* Styles are automatically cleaned up when the component is destroyed. Multiple references to the same stylesheet within a component are managed via reference counting to avoid duplicate injection

## Relationship with Web Component Styles

In addition to `createCssModule` and `styleSheet`, Web Components support static styles via the `customElement.style` configuration. See [Web Component](/en/guide/web-component) for details.

```tsx
import { WC } from "j20";

const App: WC = () => {
  return <div class="container">Hello</div>;
};

App.customElement = {
  tag: "my-app",
  mode: "open",
  style: `
    .container {
      color: red;
    }
  `,
};
```

When to use each approach:

| Approach              | Use Case                                              | Scope Isolation             |
| --------------------- | ----------------------------------------------------- | --------------------------- |
| `customElement.style` | Web Component-specific styles                         | Shadow DOM isolation        |
| `createCssModule`           | Reusable styles across components that need isolation | Class name suffix isolation |
| `styleSheet`          | Global styles or styles needing dynamic manipulation  | No isolation                |
