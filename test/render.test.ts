import { it, beforeEach } from "vitest";
import { createElement } from "../src/h/createElement";
import { computed } from "../src/api/computed";
import { state } from "../src/api/state";
import { JSignalLike } from "../src/api/types";
import { List } from "../src/control/list";

const { body } = document;

beforeEach(() => {
  body.innerHTML = "";
});

it("render", () => {
  let msg = state("Hello World");
  let color = state("blue");

  const list = state<number[]>([1, 2, 3, 4, 5]);

  function App(props: any) {
    const [$1, $2, $3] = props.value.children;

    return [$1, $2, $3];
  }

  document.body.append(
    createElement("div", [
      {
        style: computed(() => `background: ${color.value}`),
        // onClick: computed(() => () => alert()),
        children: computed(() =>
          createElement(App, {
            children: computed(() => [
              computed(() => msg.value),
              computed(() =>
                createElement(List, {
                  of: computed(() => list.value),
                  children: computed(() =>
                    computed(
                      () =>
                        (
                          $item: JSignalLike<any>,
                          $index: JSignalLike<number>
                        ) =>
                          createElement("div", {
                            children: computed(() => "item_" + $item.value),
                          })
                    )
                  ),
                })
              ),
            ]),
          })
        ),
      },
    ])
  );

  console.log(body.innerHTML);
});
