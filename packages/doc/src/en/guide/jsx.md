# JSX Syntax

J20's JSX is similar to React but not identical.

## class vs className

In React, use `className`. In J20, use `class`:

```tsx
// React
<div className="my-class">content</div>

// J20
<div class="my-class">content</div>
```

## Style Supports Two Forms

J20 supports both native HTML string form and style object form.

String form:

```tsx
<div style="color: red; font-size: 16px;">content</div>
```

Object form:

Style object keys match native CSS style names - **not React's camelCase naming**.

```tsx
<div style={{ "color": "red", "font-size": "16px" }}>content</div>
```

> String form is recommended - closer to native HTML.

## Interpolation

J20's interpolation syntax requires attention - text nodes and element nodes are handled differently.

### Text Interpolation

In J20, strings and numbers are directly converted to text nodes.

```tsx
let text = "hello world";
<span>{text}</span>
```

If text is a [signal](/en/guide/component#declaring-signals), it updates with the reactive variable.

```tsx
let $text = "hello world";
<span>{$text}</span>
```

### Element Node Interpolation

Element node interpolation does not update with signal variable changes.

```tsx
let $visible = false;
let $el = $visible ? <div>el</div> : null;
<div>{$el}</div>
```

For node switching, J20 provides `<If>`, `<Switch>`, and `<Replace>` components. See [Conditional Rendering](/en/guide/conditional).
