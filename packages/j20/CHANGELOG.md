# j20

## 0.1.0

### Minor Changes

- 7c637f3: Component children compile to a lazy thunk (`children: () => expr`) instead of a `children` getter inside props.

  - `props.children` is now a function: call it (or mount it via `{children}`) to create the content. Props rest/spread no longer force child creation, which fixes the children dependency-leak on rest destructuring at the root (the previous `untrack` workaround is kept as a general guard).
  - The runtime marks the children thunk with `.isLogic` and creates it like a logic component (untracked, one-shot); `getChildren` unwraps nested thunk chains when mounting.
  - Control components (`For` / `If` / `Some` / `Replace` / `Switch`), `Consumer`, `Fragment` and web components are updated to unwrap the thunk before use.
  - `{children}` in a component body keeps working as before — the runtime calls the thunk when mounting, so no source change is required for the common placement pattern.

  Behavior change: `children` that is directly a reactive text expression (`<Panel>{$state.text}</Panel>`) is now static by convention; put reactive text inside a DOM node in the component body (`<div>{$state.text}</div>`) instead.

## 0.0.39

### Patch Changes

- bd74746: Context leak fix

## 0.0.38

### Patch Changes

- d872e00: Allover upgrade

## 0.0.37

### Patch Changes

- 844edcc: allover upgrade

## 0.0.36

### Patch Changes

- e584bd5: fix: controlled form props (`value`/`checked`/`selected`) now update via DOM property

  The `value` content attribute only represents an input's _default_ value — once
  the user has typed (dirty value flag set), `setAttribute("value", ...)` no
  longer updates the actual value, so controlled inputs could not be cleared or
  reset programmatically. The same applies to `checked` and `selected`. These
  keys are now written as DOM properties (like React does for controlled
  components); everything else still goes through attributes.

## 0.0.35

### Patch Changes

- Add edge case for signal and refact jsx-transform-plugin

## 0.0.34

### Patch Changes

- 066b6a9: For render design changed

## 0.0.33

### Patch Changes

- 830f367: Fix CI/CD command

## 0.0.32

### Patch Changes

- 79efbd9: Refact with some new design
