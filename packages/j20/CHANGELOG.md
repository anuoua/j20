# j20

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
