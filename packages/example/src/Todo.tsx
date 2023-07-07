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
