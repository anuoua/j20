# Creating an App

Use the `createRoot` method to create an application

```tsx
import { createRoot } from "j20";

const root = createRoot(() => <span>hello world</span>);

document.querySelector("#root").append(root.element);
```

## Simple Component

```tsx
import { createRoot } from "j20";

const App = () => {
  return (
    <span>hello world</span>
  )
}

const root = createRoot(() => <App />);

document.querySelector("#root").append(root.element);
```
