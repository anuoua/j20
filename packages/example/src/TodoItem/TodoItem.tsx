import { If, effect, ref, styleSheet } from "j20";
import { css, classes as originClasses, override } from "./TodoItem.stylec";

interface TodoItemProps {
  text: string;
  completed: boolean;
  override?: ReturnType<typeof override> | undefined;
  onToggle?: () => void;
  onDelete?: () => void;
  onTextChange?: (text: string) => void;
}

export const TodoItem = ($props: TodoItemProps) => {
  const {
    text: $text,
    completed: $completed,
    onToggle: $onToggle = () => {},
    onDelete: $onDelete = () => {},
    onTextChange: $onTextChange = () => {},
    override,
  } = $props;

  let $editing = false;

  const inputRef = ref<HTMLInputElement>();

  effect(() => {
    if ($editing) {
      queueMicrotask(() => inputRef.current?.focus());
    }
  });

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

        <If
          of={$editing}
          else={
            <span
              class={$completed ? classes.text_completed : classes.text}
              onDblClick={() => {
                $editing = true;
              }}
            >
              {$text}
            </span>
          }
        >
          <input
            type="text"
            class={classes.edit_input}
            ref={inputRef}
            value={$text}
            onInput={(e: Event & { target: HTMLInputElement }) => {
              $onTextChange(e.target.value);
            }}
            onKeyDown={(e: KeyboardEvent) => {
              if (e.key === "Enter") {
                $editing = false;
              }
            }}
            onBlur={() => {
              $editing = false;
            }}
          />
        </If>
      </div>

      <button class={classes.delete_btn} onClick={() => $onDelete()}>
        删除
      </button>
    </div>
  );
};
