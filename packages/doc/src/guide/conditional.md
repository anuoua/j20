# 条件渲染

J20 提供了 `If` 和 `Switch` 组件来处理条件渲染。

## If 组件

`If` 用来处理简单的条件渲染

```tsx
import { If } from "j20";

let $visible = true;

<If of={$visible} else={<div>invisible</div>}>
  <span>visible</span>
</If>;
```

## Switch 组件

`Switch` 用来处理多条件渲染，只渲染第一个 of = true 的 Case 项，用于多个互斥条件下的渲染，`Default` 则是默认项

```tsx
import { Switch, Case, Default } from "j20";

let $value = 1;

<Switch>
  <Case of={$value === 1}>1</Case>
  <Case of={$value === 2}>2</Case>
  <Default>default</Default>
</Switch>;
```
