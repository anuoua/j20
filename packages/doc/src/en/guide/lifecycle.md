# Lifecycle

J20 provides dedicated lifecycle APIs for managing component mounting and unmounting.

## onMount - Component Mount

Executes a callback after the component is mounted to the DOM, using `requestAnimationFrame` to ensure DOM rendering is complete.

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

### Multiple Calls

You can call `onMount` multiple times in the same component:

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

## onDestroy - Component Unmount

Executes a callback when the component is unmounted, used for cleanup, removing event listeners, etc.

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

### Multiple Cleanup Functions

Supports registering multiple cleanup functions:

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

### Event Listener Cleanup

Used for cleaning up event listeners:

```tsx
const App = () => {
  const handleResize = () => {
    console.log("Window resized");
  };

  onDestroy(() => {
    window.removeEventListener("resize", handleResize);
  });

  onMount(() => {
    window.addEventListener("resize", handleResize);
  });
};
```

## Execution Timing

- **onMount**: Executes after DOM rendering completes (uses `requestAnimationFrame`)
- **onDestroy**: Executes when component is removed from DOM

## Considerations

### Memory Management

Always remember to clean up resources created in `onMount`:

```tsx
// Bad: Memory leak
const BadComponent = () => {
  onMount(() => {
    // No cleanup for timer
    setInterval(() => {}, 1000);
  });
};

// Good: Clean up resources
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

## Best Practices

1. **Clean up promptly**: Clean up all created resources in `onDestroy`
2. **Avoid nesting**: Deeply nested lifecycle hooks make code hard to maintain
3. **Use third-party libraries**: When integrating third-party libraries, initialize in `onMount` and destroy in the callback or `onDestroy`
