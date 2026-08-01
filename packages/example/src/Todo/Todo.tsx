import { For, styleSheet } from "j20";
import { TodoItem } from "../TodoItem/TodoItem";
import { css, classes } from "./Todo.stylec";

export const App = () => {
  styleSheet(css);

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
    <div class={classes.main}>
      <h1 class={classes.title}>Todo List</h1>

      <div class={classes.input_group}>
        <div class={classes.input_row}>
          <input
            type="text"
            placeholder="添加新的任务..."
            class={classes.input}
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
            class={classes.add_btn}
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

      <div class={classes.stats}>
        未完成: {$activeCount} | 总计: {$todos.length}
      </div>

      <div class={classes.list}>
        <For of={$todos}>
          {($todo, $index) => (
            <TodoItem
              text={`${$todo.text}, 序号: ${$index}`}
              completed={$todo.completed}
              onToggle={() => toggleTodo($todo.id)}
              onDelete={() => deleteTodo($todo.id)}
            />
          )}
        </For>
      </div>

      <div class={classes.footer}>
        <button class={classes.clear_btn} onClick={clearCompleted}>
          清除已完成
        </button>
        <div class={classes.footer_stats}>
          全部: {$todos.length} | 已完成: {$todos.length - $activeCount}
        </div>
      </div>
    </div>
  );
};
