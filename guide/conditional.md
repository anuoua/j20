---
url: /j20/guide/conditional.md
---
# 条件渲染

J20 提供了 `If`、`Some` 和 `Switch` 组件来处理条件渲染。

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

## Some 组件

`Some` 组件用于处理可能为 `null` 或 `undefined` 的值，当 `of` 属性不为 `null` 或 `undefined` 时渲染子组件函数，否则渲染 `none` 内容。

在遇到可选链的时候使用，拥有完善的 Typescript 类型提示，大幅提升开发体验。

```tsx
import { Some } from "j20";

let $data: { person?: { name: string } } | undefined;

<Some of={$data?.person} none={<div>No data</div>}>
  {($person) => <div>Hello {$person.name}</div>}
  {/* $person 非空而且是信号值 */}
</Some>;
```
