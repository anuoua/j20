import { computed } from "../src/api/computed";
import { effect } from "../src/api/effect";
import { state } from "../src/api/state";
import { JSignalLike } from "../src/api/types";
import { List } from "../src/control/list";
import { createElement } from "../src/h/createElement";

let msg = state("killer");
let color = state("blue");

setTimeout(() => {
  msg.value = "kkkkk";
  color.value = "red";
}, 1000);

function App(props: any) {
  const [$1, $2, $3] = props.value.children;

  const b = createElement(Bpp, {});

  return [$1, $2, $3, b, createElement(Bpp, {})];
}

function Bpp() {
  return createElement("span", {
    children: computed(() => [computed(() => "B"), computed(() => "dddd")]),
  });
}

const clickSign = state({
  onClick: () => alert(),
});
const toggle = state(true);
const events = computed(() => (toggle.value ? clickSign.value : {}));
const list = state<number[]>([1, 2, 3, 4, 5]);

setTimeout(() => {
  toggle.value = false;
  list.value = [1, 2, 3, 3.1, 4, 5];

  setTimeout(() => {
    list.value = [2, 1, 7, 3, 4]; // 乱序
    // list.value = [1, 2, 3]; // 添加
  }, 1000);
}, 1000);

document.querySelector("#root")!.append(
  createElement("div", [
    {
      style: computed(() => `background: ${color.value}`),
      // onClick: computed(() => () => alert()),
      children: computed(() =>
        createElement(App, {
          children: computed(() => [
            computed(() => msg.value),
            // computed(() => "222"),
            computed(() =>
              createElement(List, {
                of: computed(() => list.value),
                children: computed(() =>
                  computed(
                    () =>
                      ($item: JSignalLike<any>, $index: JSignalLike<number>) =>
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
    computed(() => events.value),
  ])
);
