import { styleSheet } from "j20";
import { css, classes as originClasses, override } from "./TodoItem.stylec";

interface TodoItemProps {
  text: string;
  completed: boolean;
  override?: ReturnType<typeof override> | undefined;
  onToggle?: () => void;
  onDelete?: () => void;
}

export const TodoItem = ($props: TodoItemProps) => {
  const {
    text: $text,
    completed: $completed,
    onToggle: $onToggle = () => {},
    onDelete: $onDelete = () => {},
    override,
  } = $props;

  styleSheet(override?.css ?? css);

  const classes = override?.classes ?? originClasses;

  return (
    <div class={classes.item}>
      <div class={classes.left}>
        <input
          type="checkbox"
          class={classes.checkbox}
          checked={$completed}
          onChange={() => $onToggle()}
        />

        <span class={$completed ? classes.text_completed : classes.text}>
          {$text}
        </span>
      </div>

      <button class={classes.delete_btn} onClick={() => $onDelete()}>
        删除
      </button>
    </div>
  );
};
