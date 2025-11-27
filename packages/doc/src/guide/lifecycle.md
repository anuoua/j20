# 生命周期

非 Web Component 组件，没有专门的生命周期概念，可使用 effect 副作用来实现生命周期的模拟。

## 模拟 onMount 生命周期

```tsx
const onMount = (fn: () => (() => void) | undefined) => {
  effect(() => untrack(fn));
};

// 使用
onMount(() => {
  const handler = () => {
    console.log("click");
  };

  document.addEventListener("click", handler);

  return () => {
    // 销毁
    document.removeEventListener("click", handler);
  };
});
```

## 使用 effect 处理生命周期

由于 J20 没有显式的生命周期钩子，你可以通过 `effect` 和 `untrack` 的组合来实现：

- **初始化**：effect 中的代码会在组件挂载时执行
- **清理**：返回清理函数在组件卸载或依赖变化时执行
- **依赖追踪**：自动追踪信号依赖，在依赖变化时重新执行
