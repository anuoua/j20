import { it, expect, beforeEach } from "vitest";
import { str, tags } from "../src/tags";
import { defineComponent } from "../src/component";
import { For, If } from "../src/control";
import { computed, ref } from "@vue/reactivity";

const { div, span, ul, li } = tags;

const { body } = document;

beforeEach(() => {
  body.innerHTML = "";
});

it("render", () => {
  const visible = ref(false);

  const App = defineComponent(
    {
      tag: "app-main",
    },
    () => {
      // prettier-ignore
      return (
        div()(
          div()(str("str")),
          div({ class: "hello" })(
            If({
              when: visible,
              children: () => (
                span()(str("world"))
              ),
              else: () => (
                span()(str("cccc"))
              )
            })
          ),
        )
      );
    }
  );

  body.append(App());
  expect(body.innerHTML).toBe(
    `<app-main><div><div>str</div><div class="hello"><!--0s--><span>cccc</span><!--0e--></div></div></app-main>`
  );

  visible.value = !visible.value;

  expect(body.innerHTML).toBe(
    `<app-main><div><div>str</div><div class="hello"><!--0s--><span>world</span><!--0e--></div></div></app-main>`
  );
});

it("list", () => {
  const list = ref([1, 2, 3]);

  const results = For({
    list,
    // prettier-ignore
    children: (item, indexRef) => (
      ul()(
        li()(
          str(computed(() => `${item}: ${indexRef.value}`))
        )
      )
    ),
  });
  body.append(...results);

  expect(body.innerHTML).toBe(
    "<!--1s--><ul><li>1: 0</li></ul><ul><li>2: 1</li></ul><ul><li>3: 2</li></ul><!--1e-->"
  );

  list.value = [...list.value].reverse();

  expect(body.innerHTML).toBe(
    "<!--1s--><ul><li>3: 0</li></ul><ul><li>2: 1</li></ul><ul><li>1: 2</li></ul><!--1e-->"
  );
});
