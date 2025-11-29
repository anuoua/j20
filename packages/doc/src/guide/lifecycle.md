# 生命周期

J20 提供了专门的生命周期 API 来管理组件的挂载和卸载。

## onMount - 组件挂载

在组件挂载到 DOM 后执行回调函数，使用 `requestAnimationFrame` 确保 DOM 渲染完成。

```tsx
import { onMount } from "j20";

const App = () => {
  let $count = 0;

  onMount(() => {
    console.log("Component mounted");
  });

  const handleClick = () => {
    $count++;
  };

  return (
    <div>
      <p>Count: {$count}</p>
      <button onClick={handleClick}>Increment</button>
    </div>
  );
};
```

`onMount` 可以返回一个清理函数，在组件卸载时自动执行：

```tsx
const App = () => {
  onMount(() => {
    // 设置定时器
    let timer = setInterval(() => {
      console.log("Timer tick");
    }, 1000);

    // 返回清理函数
    return () => { // [!code ++]
      clearInterval(timer); // [!code ++]
    }; // [!code ++]
  });
};
```

`onMount` 回调不能为异步函数。

### 多次调用

可以在同一个组件中多次调用 `onMount`：

```tsx
const App = () => {
  onMount(() => {
    console.log("Mount handler 1");
  });

  onMount(() => {
    console.log("Mount handler 2");
  });

  return <div>App</div>;
};
```

## onDestroy - 组件卸载

在组件卸载时执行回调函数，用于清理副作用、移除事件监听器等。

```tsx
import { onDestroy } from "j20";

const App = () => {
  let $count = 0;

  onDestroy(() => {
    console.log("Component destroyed");
  });

  const handleClick = () => {
    $count++;
  };

  return (
    <div>
      <p>Count: {$count}</p>
      <button onClick={handleClick}>Increment</button>
    </div>
  );
};
```

### 多个清理函数

支持注册多个清理函数：

```tsx
const App = () => {
  onDestroy(() => {
    console.log("Cleanup 1");
  });

  onDestroy(() => {
    console.log("Cleanup 2");
  });

  onDestroy(() => {
    console.log("Cleanup 3");
  });

  return <div>App</div>;
};
```

### 事件监听器清理

可于清理事件监听器：

```tsx
const App = () => {
  onDestroy(() => {
    window.removeEventListener("resize", handleResize);
  });

  onMount(() => {
    const handleResize = () => {
      console.log("Window resized");
    };
    window.addEventListener("resize", handleResize);
  });
};
```

和直接使用 `onMount` 返回清理函数效果一样：

```tsx
const App = () => {
  onMount(() => {
    const handleResize = () => {
      console.log("Window resized");
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    }
  });
};
```

## 执行时机

- **onMount**: 在 DOM 渲染完成后执行（使用 `requestAnimationFrame`）
- **onDestroy**: 在组件从 DOM 中移除时执行

## 注意事项

### 内存管理

始终不要忘记清理在 `onMount` 中创建的资源：

```tsx
// ❌ 错误：内存泄漏
const BadComponent = () => {
  onMount(() => {
    // 没有清理定时器
    setInterval(() => {}, 1000);
  });
};

// ✅ 正确：清理资源
const GoodComponent = () => {
  onMount(() => {
    const timer = setInterval(() => {}, 1000);

    return () => {
      clearInterval(timer);
    };
  });
};

// ✅ 正确：清理资源
const GoodComponent = () => {
  let timer;
  onMount(() => {
    timer = setInterval(() => {}, 1000);
  });

  onDestroy(() => {
    clearInterval(timer);
  });
};
```

## 最佳实践

1. **及时清理**: 在 `onDestroy` 中清理所有创建的资源
2. **避免嵌套**: 深度嵌套的生命周期会让代码难以维护
3. **使用第三方库**: 集成第三方库时，在 `onMount` 中初始化，在回调函数或者 `onDestroy` 中销毁