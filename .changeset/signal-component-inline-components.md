---
"@j20org/jsx-transform": patch
"@j20org/vite-plugin": patch
---

feat: support inline components (render props) via `@signal-component` marker

jsx-transform now attaches a `/* @signal-component */` block-comment marker to
anonymous functions passed as capitalized JSX attribute values (with `$`
bindings in their destructured params), so signal-compiler can compile them as
inline components. The vite-plugin pipeline order is swapped accordingly
(jsx-transform must run before signal-compiler) and signal-compiler is bumped
to 0.1.9.
