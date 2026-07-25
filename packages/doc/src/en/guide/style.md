# Style

J20 provides the `styleSheet` API for managing component styles, built on [Constructable Stylesheets](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet) for high performance.

For scoped CSS-in-JS with class name isolation, use the ecosystem package [`@j20org/cssinjs`](/en/ecosystem/cssinjs).

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

- **css** (`string`): CSS text content
- **id** (`string`, optional): A unique identifier for the stylesheet, used for reference counting and deduplication. Defaults to a hash generated from the CSS content

### Auto-mounting and Cleanup

`styleSheet` automatically detects the current component's runtime environment:

- Inside a Web Component (with Shadow Root), styles are injected into the Shadow Root's `adoptedStyleSheets`
- Inside a regular component, styles are injected into `document.adoptedStyleSheets`
- Styles are automatically cleaned up when the component is destroyed. Multiple references to the same stylesheet within a component are managed via reference counting to avoid duplicate injection

## Relationship with Web Component Styles

In addition to `styleSheet`, Web Components support static styles via the `customElement.style` configuration. See [Web Component](/en/guide/web-component) for details.

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
| `@j20org/cssinjs`     | Reusable styles across components that need isolation | Class name suffix isolation |
| `styleSheet`          | Global styles or styles needing dynamic manipulation  | No isolation                |
