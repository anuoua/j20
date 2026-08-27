# @j20org/vite-plugin

## 0.0.17

### Patch Changes

- 5ea54ee: Upgrade `signal-compiler` dependency to 0.1.13.
- Updated dependencies [5ea54ee]
  - @j20org/jsx-transform@0.1.1

## 0.0.16

### Patch Changes

- 7c637f3: Component children compile to a lazy thunk (`children: () => expr`) instead of a `children` getter inside props.

  - `props.children` is now a function: call it (or mount it via `{children}`) to create the content. Props rest/spread no longer force child creation, which fixes the children dependency-leak on rest destructuring at the root (the previous `untrack` workaround is kept as a general guard).
  - The runtime marks the children thunk with `.isLogic` and creates it like a logic component (untracked, one-shot); `getChildren` unwraps nested thunk chains when mounting.
  - Control components (`For` / `If` / `Some` / `Replace` / `Switch`), `Consumer`, `Fragment` and web components are updated to unwrap the thunk before use.
  - `{children}` in a component body keeps working as before — the runtime calls the thunk when mounting, so no source change is required for the common placement pattern.

  Behavior change: `children` that is directly a reactive text expression (`<Panel>{$state.text}</Panel>`) is now static by convention; put reactive text inside a DOM node in the component body (`<div>{$state.text}</div>`) instead.

- Updated dependencies [7c637f3]
  - @j20org/jsx-transform@0.1.0

## 0.0.15

### Patch Changes

- d872e00: Allover upgrade
- Updated dependencies [d872e00]
  - @j20org/jsx-transform@0.0.11

## 0.0.14

### Patch Changes

- 844edcc: allover upgrade
- Updated dependencies [844edcc]
  - @j20org/jsx-transform@0.0.10

## 0.0.13

### Patch Changes

- Overall upgrade
- Updated dependencies
  - @j20org/jsx-transform@0.0.9

## 0.0.12

### Patch Changes

- 6dab0ac: feat: support inline components (render props) via `@signal-component` marker

  jsx-transform now attaches a `/* @signal-component */` block-comment marker to
  anonymous functions passed as capitalized JSX attribute values (with `$`
  bindings in their destructured params), so signal-compiler can compile them as
  inline components. The vite-plugin pipeline order is swapped accordingly
  (jsx-transform must run before signal-compiler) and signal-compiler is bumped
  to 0.1.9.

- Updated dependencies [6dab0ac]
  - @j20org/jsx-transform@0.0.8

## 0.0.11

### Patch Changes

- Add edge case for signal and refact jsx-transform-plugin
- Updated dependencies
  - @j20org/jsx-transform@0.0.7

## 0.0.10

### Patch Changes

- 830f367: Fix CI/CD command
- Updated dependencies [830f367]
  - @j20org/jsx-transform@0.0.6

## 0.0.9

### Patch Changes

- 79efbd9: Refact with some new design
- Updated dependencies [79efbd9]
  - @j20org/jsx-transform@0.0.5
