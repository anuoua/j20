# Creating an App

Use the `createRoot` method to create an application

```tsx
import { createRoot } from "j20";

const App = () => <span>hello world</span>

createRoot(App, document.querySelector("#root"))
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
