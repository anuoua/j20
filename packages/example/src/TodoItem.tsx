import { createCss } from "j20";

interface TodoItemProps {
  text: string;
  completed: boolean;
  onToggle?: () => void;
  onDelete?: () => void;
}

const css = createCss(`
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

  const cns = css();

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
