# Best Practices

Here's a TodoList example demonstrating best practices.

index.tsx:

```tsx
import { createRoot } from "j20";
import { App } from "./Todo";

// Use createRoot to create app root
const root = createRoot(() => <App></App>);

// Append root to DOM
document.querySelector("#root")!.append(root.element);
```

Todo.tsx:

```tsx
import { For } from "j20";
import { TodoItem } from "./TodoItem";

// Define Todo item type
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// Initialize sample data
let $todos = [
  { id: 1, text: "Learn j20 framework", completed: false },
  { id: 2, text: "Create todolist app", completed: false },
  { id: 3, text: "Enjoy programming", completed: true },
];

// Function to add new todo
const addTodo = (text: string) => {
  if (text.trim() === "") return;

  $todos = [
    ...$todos,
    {
      id: Date.now(), // Use timestamp as unique ID
      text: text.trim(),
      completed: false,
    },
  ];
};

// Function to delete todo
const deleteTodo = (id: number) => {
  $todos = $todos.filter((todo) => todo.id !== id);
};

// Function to toggle todo completion status
const toggleTodo = (id: number) => {
  $todos = $todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
};

// Clear all completed todos
const clearCompleted = () => {
  $todos = $todos.filter((todo) => !todo.completed);
};

// Count uncompleted todos
const $activeCount = $todos.filter((todo) => !todo.completed).length;

// App component
export const App = () => {
  let $newTodoText = ""; // Input value

  const handleAddTodo = (e: Event & { target: HTMLInputElement }) => {
    addTodo(e.target.value);
    e.target.value = ""; // Clear input
    $newTodoText = ""; // Clear signal value
  };

  return (
    <div class="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h1 class="text-3xl font-bold text-center mb-6 text-gray-800">
        Todo List
      </h1>

      {/* Add new todo input */}
      <div class="mb-6">
        <div class="flex">
          <input
            type="text"
            placeholder="Add new task..."
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
            Add
          </button>
        </div>
      </div>

      {/* Stats */}
      <div class="mb-4 text-gray-600">
        Incomplete: {$activeCount} | Total: {$todos.length}
      </div>

      {/* Todo list */}
      <div class="mb-6">
        <For of={$todos}>
          {(todo, $index) => (
            <TodoItem
              text={`${todo.text}, Index: ${$index}`}
              completed={todo.completed}
              onToggle={() => toggleTodo(todo.id)}
              onDelete={() => deleteTodo(todo.id)}
            />
          )}
        </For>
      </div>

      {/* Action buttons */}
      <div class="flex justify-between">
        <button
          class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          onClick={clearCompleted}
        >
          Clear Completed
        </button>
        <div class="text-gray-600">
          All: {$todos.length} | Completed: {$todos.length - $activeCount}
        </div>
      </div>
    </div>
  );
};
```

TodoItem.tsx:

```tsx
// Define component props type
interface TodoItemProps {
  text: string;
  completed: boolean;
  onToggle?: () => void;
  onDelete?: () => void;
}

// TodoItem component
export const TodoItem = ($props: TodoItemProps) => {
  // Destructure props with $ prefix alias for reactivity
  // Or use $props.xx directly
  const {
    text: $text,
    completed: $completed,
    onToggle: $onToggle = () => {},
    onDelete: $onDelete = () => {},
  } = $props;

  return (
    <div class="flex items-center justify-between p-3 mb-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div class="flex items-center">
        {/* Checkbox */}
        <input
          type="checkbox"
          class="h-5 w-5 mr-3 text-blue-500 rounded focus:ring-blue-400"
          checked={$completed}
          onChange={() => $onToggle()}
        />

        {/* Todo text */}
        <span
          class={$completed ? "line-through text-gray-500" : "text-gray-800"}
        >
          {$text}
        </span>
      </div>

      {/* Delete button */}
      <button
        class="text-red-500 hover:text-red-700 transition-colors"
        onClick={() => $onDelete()}
      >
        Delete
      </button>
    </div>
  );
};
```
