import { ref } from "@vue/reactivity";
import { defineComponent } from "../src/component";
import { tags } from "../src/tags";
import { For } from "../src/control";
import { str } from "../src/tags";
import { Item } from "./item";

const { div, ul, h1, button, input } = tags;

export interface TodoItem {
  name: string;
  canceled: boolean;
}

const App = defineComponent(
  {
    tag: "app-main",
    shadow: true,
  },
  () => {
    let inputRef: HTMLInputElement = undefined!;

    const list = ref<TodoItem[]>([]);

    const handleAdd = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent && e.key !== "Enter") return;
      list.value = [
        ...list.value,
        {
          name: inputRef.value,
          canceled: false,
        },
      ];
    };

    const handleRemove = (item: TodoItem) => {
      list.value = list.value.filter((i) => i !== item);
    };

    return div(
      {},
      h1({ style: { color: "red" } }, str("Todo list")),
      div(
        {},
        (inputRef = input({
          placeholder: "请输入",
          onKeydown: handleAdd,
        }) as HTMLInputElement),
        button(
          {
            onClick: handleAdd,
          },
          str("添加")
        )
      ),
      div(
        {},
        For({
          list,
          children: (item) =>
            div(
              {},
              Item({
                item,
                onDelete: () => handleRemove(item),
              })
            ),
        })
      )
    );
  }
);

document.querySelector("#root")?.append(...([] as HTMLElement[]).concat(App()));
