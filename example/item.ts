import { computed } from "@vue/reactivity";
import { str, tags } from "../src/tags";
import { TodoItem } from ".";
import { defineComponent } from "../src/component";

const { div, input, button } = tags;

export const Item = defineComponent(
  {
    tag: "todo-item",
    shadow: true,
  },
  (p: { item: TodoItem; onDelete: () => void }) => {
    return div(
      {},
      input({
        type: "text",
        value: computed(() => p.item.name),
        onInput: (e) => {
          p.item.name = (e.target as HTMLInputElement).value;
        },
      }),
      button(
        {
          onClick: p.onDelete,
        },
        str("删除")
      )
    );
  }
);
