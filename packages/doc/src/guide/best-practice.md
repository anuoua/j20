# 最佳实践

这里提供一个TodoList的示例，展示最佳实践。

index.tsx:

```tsx
import { createRoot } from "j20";
import { App } from "./Todo";

// 用creatRoot创建应用根节点
const root = createRoot(() => <App></App>);

// 将根节点添加到DOM中
document.querySelector("#root")!.append(root.element);
```

Todo.tsx:

```tsx
import { For } from "j20";
import { TodoItem } from "./TodoItem";

// 定义Todo项的类型
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// 初始化一些示例数据
let $todos = [
  { id: 1, text: "学习j20框架", completed: false },
  { id: 2, text: "创建todolist应用", completed: false },
  { id: 3, text: "享受编程乐趣", completed: true },
];

// 添加新todo的函数
const addTodo = (text: string) => {
  if (text.trim() === "") return;

  $todos = [
    ...$todos,
    {
      id: Date.now(), // 使用时间戳作为唯一ID
      text: text.trim(),
      completed: false,
    },
  ];
};

// 删除todo的函数
const deleteTodo = (id: number) => {
  $todos = $todos.filter((todo) => todo.id !== id);
};

// 切换todo完成状态的函数
const toggleTodo = (id: number) => {
  $todos = $todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
};

// 清除所有已完成的todo
const clearCompleted = () => {
  $todos = $todos.filter((todo) => !todo.completed);
};

// 计算未完成的todo数量
const $activeCount = $todos.filter((todo) => !todo.completed).length;

// App组件
export const App = () => {
  let $newTodoText = ""; // 输入框的值

  const handleAddTodo = (e: Event & { target: HTMLInputElement }) => {
    addTodo(e.target.value);
    e.target.value = ""; // 清空输入框
    $newTodoText = ""; // 清空信号值
  };

  return (
    <div class="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h1 class="text-3xl font-bold text-center mb-6 text-gray-800">
        Todo List
      </h1>

      {/* 添加新todo的输入框 */}
      <div class="mb-6">
        <div class="flex">
          <input
            type="text"
            placeholder="添加新的任务..."
            class="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            class="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 transition-colors"
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

      {/* 统计信息 */}
      <div class="mb-4 text-gray-600">
        未完成: {$activeCount} | 总计: {$todos.length}
      </div>

      {/* Todo列表 */}
      <div class="mb-6">
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

      {/* 操作按钮 */}
      <div class="flex justify-between">
        <button
          class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          onClick={clearCompleted}
        >
          清除已完成
        </button>
        <div class="text-gray-600">
          全部: {$todos.length} | 已完成: {$todos.length - $activeCount}
        </div>
      </div>
    </div>
  );
};

```

TodoItem.tsx:

```tsx
// 定义组件属性类型
interface TodoItemProps {
  text: string;
  completed: boolean;
  onToggle?: () => void;
  onDelete?: () => void;
}

// TodoItem组件
export const TodoItem = ($props: TodoItemProps) => {
  // 入参解构要使用 $ 开头别名，这样才是响应式的
  // 或者使用 $props.xx 直接取
  const {
    text: $text,
    completed: $completed,
    onToggle: $onToggle = () => {},
    onDelete: $onDelete = () => {},
  } = $props;

  return (
    <div class="flex items-center justify-between p-3 mb-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div class="flex items-center">
        {/* 复选框 */}
        <input
          type="checkbox"
          class="h-5 w-5 mr-3 text-blue-500 rounded focus:ring-blue-400"
          checked={$completed}
          onChange={() => $onToggle()}
        />

        {/* Todo文本 */}
        <span
          class={$completed ? "line-through text-gray-500" : "text-gray-800"}
        >
          {$text}
        </span>
      </div>

      {/* 删除按钮 */}
      <button
        class="text-red-500 hover:text-red-700 transition-colors"
        onClick={() => $onDelete()}
      >
        删除
      </button>
    </div>
  );
};

```