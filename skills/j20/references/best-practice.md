# J20 最佳实践：Todo List 示例

本文通过一个完整的 Todo List 应用，展示 J20 框架的核心开发模式和最佳实践。涵盖信号声明、组件拆分、样式管理、列表渲染、事件处理等常用场景。

## 目录

- [项目结构](#项目结构)
- [应用入口](#应用入口)
- [主组件：信号与业务逻辑](#主组件信号与业务逻辑)
- [子组件：Props 解构与样式](#子组件props-解构与样式)
- [关键模式总结](#关键模式总结)

## 项目结构

```
src/
├── index.tsx      # 应用入口，挂载根组件
├── Todo.tsx       # 主组件，管理状态与业务逻辑
└── TodoItem.tsx   # 子组件，展示单条待办事项
```

组件拆分原则：容器组件负责状态和逻辑，展示组件负责 UI 渲染。

## 应用入口

```tsx
import { createRoot } from "j20";
import { App } from "./Todo";

createRoot(App, document.querySelector("#root")!);
```

`createRoot` 将根组件挂载到 DOM 节点，是 J20 应用的标准启动方式。

## 主组件：信号与业务逻辑

```tsx
import { createCssModule, For } from "j20";
import { TodoItem } from "./TodoItem";

const styles = createCssModule(`
  .main {
    max-width: 28rem;
    margin-left: auto;
    margin-right: auto;
    margin-top: 2.5rem;
    padding: 1.5rem;
    background-color: #ffffff;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  }

  .title {
    font-size: 1.875rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 1.5rem;
    color: #1f2937;
  }

  .input_group {
    margin-bottom: 1.5rem;
  }

  .input_row {
    display: flex;
  }

  .input {
    flex: 1;
    padding: 0.5rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem 0 0 0.5rem;
    outline: none;
  }

  .input:focus {
    box-shadow: 0 0 0 2px #3b82f6;
  }

  .add_btn {
    background-color: #3b82f6;
    color: #ffffff;
    padding: 0.5rem 1rem;
    border-radius: 0 0.5rem 0.5rem 0;
    border: none;
    cursor: pointer;
    transition: background-color 0.15s;
  }

  .add_btn:hover {
    background-color: #2563eb;
  }

  .stats {
    margin-bottom: 1rem;
    color: #4b5563;
  }

  .list {
    margin-bottom: 1.5rem;
  }

  .footer {
    display: flex;
    justify-content: space-between;
  }

  .clear_btn {
    background-color: #ef4444;
    color: #ffffff;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    border: none;
    cursor: pointer;
    transition: background-color 0.15s;
  }

  .clear_btn:hover {
    background-color: #dc2626;
  }

  .footer_stats {
    color: #4b5563;
  }
`);

export const App = () => {
  const cns = styles();

  let $newTodoText = "";

  let $todos = [
    { id: 1, text: "学习j20框架", completed: false },
    { id: 2, text: "创建todolist应用", completed: false },
    { id: 3, text: "享受编程乐趣", completed: true },
  ];

  const addTodo = (text: string) => {
    if (text.trim() === "") return;

    $todos = [
      ...$todos,
      {
        id: Date.now(),
        text: text.trim(),
        completed: false,
      },
    ];
  };

  const deleteTodo = (id: number) => {
    $todos = $todos.filter((todo) => todo.id !== id);
  };

  const toggleTodo = (id: number) => {
    $todos = $todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
  };

  const clearCompleted = () => {
    $todos = $todos.filter((todo) => !todo.completed);
  };

  const $activeCount = $todos.filter((todo) => !todo.completed).length;

  return (
    <div class={cns.main}>
      <h1 class={cns.title}>Todo List</h1>

      <div class={cns.input_group}>
        <div class={cns.input_row}>
          <input
            type="text"
            placeholder="添加新的任务..."
            class={cns.input}
            onInput={(e: Event & { target: HTMLInputElement }) => {
              $newTodoText = e.target.value;
            }}
            onKeyDown={(e: KeyboardEvent) => {
              if (e.key === "Enter" && $newTodoText.trim() !== "") {
                addTodo($newTodoText);
                $newTodoText = "";
              }
            }}
          />
          <button
            class={cns.add_btn}
            onClick={() => {
              if ($newTodoText.trim() !== "") {
                addTodo($newTodoText);
                $newTodoText = "";
              }
            }}
          >
            添加
          </button>
        </div>
      </div>

      <div class={cns.stats}>
        未完成: {$activeCount} | 总计: {$todos.length}
      </div>

      <div class={cns.list}>
        <For of={$todos}>
          {(todo, $index) => (
            <TodoItem
              text={`${todo.text}, 序号: ${$index}`}
              completed={todo.completed}
              onToggle={() => toggleTodo(todo.id)}
              onDelete={() => deleteTodo(todo.id)}
            />
          )}
        </For>
      </div>

      <div class={cns.footer}>
        <button class={cns.clear_btn} onClick={clearCompleted}>
          清除已完成
        </button>
        <div class={cns.footer_stats}>
          全部: {$todos.length} | 已完成: {$todos.length - $activeCount}
        </div>
      </div>
    </div>
  );
};
```

## 子组件：Props 解构与样式

```tsx
import { createCssModule } from "j20";

interface TodoItemProps {
  text: string;
  completed: boolean;
  onToggle?: () => void;
  onDelete?: () => void;
}

const styles = createCssModule(`
  .item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    background-color: #f9fafb;
    border-radius: 0.5rem;
    transition: background-color 0.15s;
  }

  .item:hover {
    background-color: #f3f4f6;
  }

  .left {
    display: flex;
    align-items: center;
  }

  .checkbox {
    height: 1.25rem;
    width: 1.25rem;
    margin-right: 0.75rem;
    accent-color: #3b82f6;
    border-radius: 0.25rem;
  }

  .checkbox:focus {
    outline: none;
    box-shadow: 0 0 0 2px #60a5fa;
  }

  .text {
    color: #1f2937;
  }

  .text_completed {
    text-decoration: line-through;
    color: #6b7280;
  }

  .delete_btn {
    color: #ef4444;
    background: none;
    border: none;
    cursor: pointer;
    transition: color 0.15s;
  }

  .delete_btn:hover {
    color: #b91c1c;
  }
`);

export const TodoItem = ($props: TodoItemProps) => {
  const {
    text: $text,
    completed: $completed,
    onToggle: $onToggle = () => {},
    onDelete: $onDelete = () => {},
  } = $props;

  const cns = styles();

  return (
    <div class={cns.item}>
      <div class={cns.left}>
        <input
          type="checkbox"
          class={cns.checkbox}
          checked={$completed}
          onChange={() => $onToggle()}
        />

        <span class={$completed ? cns.text_completed : cns.text}>{$text}</span>
      </div>

      <button class={cns.delete_btn} onClick={() => $onDelete()}>
        删除
      </button>
    </div>
  );
};
```

## 关键模式总结

### 1. 信号声明与更新

用 `let` 声明可变信号，直接赋值触发更新，无需 setter 函数：

```tsx
let $newTodoText = "";
let $todos = [...];

// 直接赋值即可触发 UI 更新
$todos = [...$todos, newItem];
$newTodoText = "";
```

数组/对象的更新使用展开运算符创建新引用，确保响应性正确传播。

### 2. 派生信号

通过引用其他信号自动建立派生关系，无需额外的计算属性：

```tsx
const $activeCount = $todos.filter((todo) => !todo.completed).length;
```

`$activeCount` 会随着 `$todos` 的变化自动重新计算。

### 3. Props 解构保持响应性

子组件接收 `$props` 后，解构时重命名加 `$` 前缀以维持响应式链路：

```tsx
const {
  text: $text,
  completed: $completed,
  onToggle: $onToggle = () => {},
  onDelete: $onDelete = () => {},
} = $props;
```

解构出的变量必须以 `$` 开头，否则会丢失响应性。

### 4. 组件内样式隔离

`createCssModule` 在组件作用域内定义 CSS，类名自动添加唯一后缀，避免全局污染：

```tsx
const styles = createCssModule(`.item { ... }`);
// 在组件内调用
const cns = styles();
// 使用 cns.item 引用样式
```

### 5. 列表渲染

`<For>` 组件处理列表渲染，子函数接收当前项和索引信号：

```tsx
<For of={$todos}>
  {(todo, $index) => (
    <TodoItem text={`${todo.text}, 序号: ${$index}`} ... />
  )}
</For>
```

`$index` 是信号，会随列表变化自动更新。

### 6. 事件处理

使用原生 DOM 事件名（`onClick`、`onInput`、`onKeyDown`、`onChange`），在回调中更新信号值：

```tsx
onInput={(e: Event & { target: HTMLInputElement }) => {
  $newTodoText = e.target.value;
}}
```

事件类型使用 TypeScript 的交叉类型标注，保持类型安全。

### 7. 条件样式切换

利用三元表达式根据信号值动态切换 class：

```tsx
<span class={$completed ? cns.text_completed : cns.text}>{$text}</span>
```

样式变化随 `$completed` 信号自动响应。
