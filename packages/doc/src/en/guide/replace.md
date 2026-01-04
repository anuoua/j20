# Dynamic Rendering

J20 provides the `Replace` component for dynamic rendering. When the `of` value changes, the internal content is unmounted and rebuilt. Used for scenarios requiring large-scale reconstruction.

## Basic Usage

```tsx
import { Replace } from "j20";

let $value = 1;

<Replace of={$value}>
  {/* Content related to $value - use function to get value (value is a regular snapshot) */}
  {(value) => <div>{value}</div>}
  {/* Content unrelated to $value - renders directly */}
  <div>Some</div>
</Replace>;
```

## Use Cases

The `Replace` component is suitable for:

- Scenarios requiring complete component tree reconstruction
- Scenarios requiring cleanup of previous state
- Switching between multiple different components
