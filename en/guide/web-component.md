---
url: /j20/en/guide/web-component.md
---
# Web Component

J20 allows users to create Web Component components with first-class support. They can be used like regular components or as HTML tags, with complete TypeScript support.

Web Components **do not support complex object** props. J20 doesn't add special handling for this. We should be aware of the applicable scope of Web Components and not expect them to work like regular components.

## Creating Web Component

```tsx
// App.tsx
import { WC } from "j20";

// Props types - only supports string, number, boolean
interface AppProps {
  name: string;
}

// Custom events and their payload types
// Event names used inside the component follow DOM element mapping rules:
//   delete -> onDelete
//   add -> onAdd
interface AppEvents {
  delete: number;
  add: number;
}

const App: WC<AppProps, AppEvents> = ($props) => {
  return (
    <div class="container" onClick={() => $props.onDelete(1)}>
      {$props.name}
    </div>
  );
};

App.customElement = {
  // html tag
  tag: "my-app",
  // attachShadow mode: open or closed
  mode: "open",
  // Props to HTML attributes mapping
  // Type supports "string", "number", "boolean"
  props: {
    name: {
      type: "string",
      attribute: "name",
    },
  },
  // Component styles
  style: `
    .container {
      color: red;
    }
  `,
};
```

## Using as Regular Component

```tsx
<App
  name="hello"
  onDelete={(value) => {
    console.log(value);
  }}
/>
// console.log 1
```

## Using as HTML Tag

To use as an HTML tag, you need to register the component first.

### Register Component

```tsx
import { registerWebComponent } from "j20";
import App from "./App.tsx";

registerWebComponent(App);
```

### Using in J20

```tsx
<my-app name="hello" onDelete={(value) => console.log(value)} />
// console.log => CustomEvent { ... detail: 1 }
```

### Using in Native HTML

This means components in this form can run in any framework.

```html
<my-app name="hello" />
<script type="text/javascript">
  document.querySelector("my-app").addEventListener("delete", (e) => {
    console.log(e);
  });
  // console.log => CustomEvent { ... detail: 1 }
</script>
```
