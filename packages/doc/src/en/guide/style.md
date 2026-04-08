# Style

J20 provides two APIs for managing component styles: `createCss` and `styleSheet`. Both are built on [Constructable Stylesheets](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet) for high performance and scoped style isolation.

## createCss

`createCss` creates CSS with scoped class names by automatically appending unique suffixes, preventing style collisions.

### Basic Usage

```tsx
import { createCss } from "j20";

const useStyles = createCss(`
  .container {
    color: red;
    font-size: 16px;
  }
  .title {
    font-weight: bold;
  }
`);

const App = () => {
  const classes = useStyles();

  return (
    <div class={classes.container}>
      <span class={classes.title}>Hello J20</span>
    </div>
  );
};
```

### How It Works

`createCss` takes a CSS string and returns a function. When called:

1. Each class name in the CSS is automatically suffixed with a unique identifier (e.g., `.container` becomes `.container_abc123`), achieving scope isolation
2. The processed styles are injected into the current component's Shadow Root or Document
3. A Proxy object is returned whose properties automatically resolve to the suffixed class names, so `classes.container` gives you the transformed class name directly

### Reusing Across Components

The function returned by `createCss` can be called in multiple components. Styles are injected only once (managed via reference counting) and are automatically cleaned up when all referencing components are destroyed.

```tsx
import { createCss } from "j20";

const useStyles = createCss(`
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
  const classes = useStyles();
  return <button class={`${classes.btn} ${classes.primary}`}>Primary</button>;
};

const SecondaryButton = () => {
  const classes = useStyles();
  return (
    <button class={`${classes.btn} ${classes.secondary}`}>Secondary</button>
  );
};
```

## styleSheet

`styleSheet` injects a `CSSStyleSheet` directly into the current component's Shadow Root or Document. It is suitable for scenarios that don't require scope isolation.

### Basic Usage

```tsx
import { styleSheet } from "j20";

const App = () => {
  styleSheet(
    "my-global-style",
    `
    div { box-sizing: border-box; }
    body { margin: 0; }
  `
  );

  return <div>Hello J20</div>;
};
```

### Parameters

- **id** (`string`): A unique identifier for the stylesheet, used for reference counting and deduplication
- **css** (`string`, optional): CSS text content. If not provided, an empty stylesheet is created

### Getting the CSSStyleSheet Instance

`styleSheet` returns a `CSSStyleSheet` instance for further manipulation.

```tsx
import { styleSheet } from "j20";

const App = () => {
  const sheet = styleSheet(
    "dynamic-style",
    `
    .dynamic { color: blue; }
  `
  );

  // sheet is a CSSStyleSheet instance
  // You can use CSSStyleSheet APIs to dynamically modify rules
  sheet.insertRule(".new-rule { color: green; }", sheet.cssRules.length);

  return <div class="dynamic">Hello J20</div>;
};
```

### Auto-mounting and Cleanup

`styleSheet` automatically detects the current component's runtime environment:

- Inside a Web Component (with Shadow Root), styles are injected into the Shadow Root's `adoptedStyleSheets`
- Inside a regular component, styles are injected into `document.adoptedStyleSheets`
- Styles are automatically cleaned up when the component is destroyed. Multiple references to the same stylesheet within a component are managed via reference counting to avoid duplicate injection

## Relationship with Web Component Styles

In addition to `createCss` and `styleSheet`, Web Components support static styles via the `customElement.style` configuration. See [Web Component](/en/guide/web-component) for details.

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
| `createCss`           | Reusable styles across components that need isolation | Class name suffix isolation |
| `styleSheet`          | Global styles or styles needing dynamic manipulation  | No isolation                |
