---
"@j20org/jsx-transform": minor
"j20": minor
"@j20org/vite-plugin": patch
---

Component children compile to a lazy thunk (`children: () => expr`) instead of a `children` getter inside props.

- `props.children` is now a function: call it (or mount it via `{children}`) to create the content. Props rest/spread no longer force child creation, which fixes the children dependency-leak on rest destructuring at the root (the previous `untrack` workaround is kept as a general guard).
- The runtime marks the children thunk with `.isLogic` and creates it like a logic component (untracked, one-shot); `getChildren` unwraps nested thunk chains when mounting.
- Control components (`For` / `If` / `Some` / `Replace` / `Switch`), `Consumer`, `Fragment` and web components are updated to unwrap the thunk before use.
- `{children}` in a component body keeps working as before — the runtime calls the thunk when mounting, so no source change is required for the common placement pattern.

Behavior change: `children` that is directly a reactive text expression (`<Panel>{$state.text}</Panel>`) is now static by convention; put reactive text inside a DOM node in the component body (`<div>{$state.text}</div>`) instead.
