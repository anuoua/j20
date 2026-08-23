# @j20org/jsx-transform

## 0.0.11

### Patch Changes

- d872e00: Allover upgrade

## 0.0.10

### Patch Changes

- 844edcc: allover upgrade

## 0.0.9

### Patch Changes

- Overall upgrade

## 0.0.8

### Patch Changes

- 6dab0ac: feat: support inline components (render props) via `@signal-component` marker

  jsx-transform now attaches a `/* @signal-component */` block-comment marker to
  anonymous functions passed as capitalized JSX attribute values (with `$`
  bindings in their destructured params), so signal-compiler can compile them as
  inline components. The vite-plugin pipeline order is swapped accordingly
  (jsx-transform must run before signal-compiler) and signal-compiler is bumped
  to 0.1.9.

## 0.0.7

### Patch Changes

- Add edge case for signal and refact jsx-transform-plugin

## 0.0.6

### Patch Changes

- 830f367: Fix CI/CD command

## 0.0.5

### Patch Changes

- 79efbd9: Refact with some new design
