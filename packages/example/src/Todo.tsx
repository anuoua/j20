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
