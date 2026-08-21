# Creating an App

Use the `createRoot` method to create an application

```tsx
import { createRoot } from "j20";

const App = () => <span>hello world</span>

createRoot(App, document.querySelector("#root"))
```
