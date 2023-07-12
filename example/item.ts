import { computed, toRef } from "@vue/reactivity";
import { str, tags } from "../src/tags";
import { TodoItem } from ".";
import { defineComponent } from "../src/define";
import { If } from "../src/control";

const { div, input, button, del } = tags;

export interface ItemProps {
  item: TodoItem;
  onDelete: () => void;
}

export const Item = defineComponent<ItemProps>(
  {
    tag: "todo-item",
    shadow: true,
  },
  (p) => {
    const item = toRef(p.item);

    const editable = computed(() => item.value.editable);
    const canceled = computed(() => item.value.canceled);
    const editableName = computed(() =>
      item.value.editable ? "确认" : "编辑"
    );
    const computedName = computed(() =>
      item.value.canceled ? "取消完成" : "完成"
    );

    const handleInput = (e: Event) => {
      item.value.name = (e.target as HTMLInputElement).value;
    };

    const handleEdit = () => {
      item.value.editable = !item.value.editable;
    };

    const handleComplete = () => {
      item.value.canceled = !item.value.canceled;
    };

    return div()(
      If({
        when: editable,
        children: () =>
          input({
            style: "width: 200px",
            type: "text",
            value: computed(() => p.item.name),
            onInput: handleInput,
          })(),
        else: () =>
          div({ style: "display: inline-block; width: 200px" })(
            If({
              when: canceled,
              children: () => del()(str(item.value.name)),
              else: () => str(item.value.name),
            })
          ),
      }),
      button({
        onClick: handleEdit,
      })(str(editableName)),
      button({
        onClick: handleComplete,
      })(str(computedName)),
      button({
        onClick: p.onDelete,
      })(str("删除"))
    );
  }
);
