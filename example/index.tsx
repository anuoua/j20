import { computed, Fragment } from "../src";
import { effect } from "../src";
import { signal } from "../src";
import { List } from "../src/control/list";
import { If } from "../src/control/if";
import { creatRoot } from "../src";

console.log(computed, effect, signal);

const TodoItem = ($props: any) => {
  let $checked = true;

  return (
    <div style="display: flex; align-items: center; gap: 10px;">
      <input
        type="checkbox"
        checked={$checked}
        onChange={() => ($checked = !$checked)}
      ></input>
      <div>
        <If of={$checked}>
          {(checked) =>
            checked ? (
              <span style="text-decoration: line-through;">
                {$props.text} {checked.toString()}
              </span>
            ) : (
              <span>
                {$props.text} {checked.toString()}
              </span>
            )
          }
        </If>
      </div>
      <button onClick={$props.onDelete}>delete</button>
    </div>
  );
};

let arr = [];
for (let i = 0; i < 10000; i++) {
  arr.push({
    id: Math.random(),
    text: `item ${i}`,
  });
}

const App = () => {
  let $list = [...arr];

  const add = (e: Event & { target: HTMLInputElement }) => {
    $list = [
      ...$list,
      {
        id: Math.random(),
        text: e.target.value,
      },
    ];
  };

  const handleDelete = (id: number) => {
    $list = $list.filter((item) => item.id !== id);
  };

  const handleSwitch = () => {
    $list = $list.length ? [] : [...arr];
  };

  return (
    <div>
      <Fragment>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-aarrow-down-icon lucide-a-arrow-down"
        >
          <path d="m14 12 4 4 4-4" />
          <path d="M18 16V7" />
          <path d="m2 16 4.039-9.69a.5.5 0 0 1 .923 0L11 16" />
          <path d="M3.304 13h6.392" />
        </svg>
      </Fragment>

      <button onClick={handleSwitch}>切换</button>

      <input onChange={add}></input>
      <div>
        <List of={$list}>
          {($item) => (
            <TodoItem
              text={<span style="color: red">{$item.text}</span>}
              onDelete={() => handleDelete($item.id)}
            />
          )}
        </List>
      </div>
    </div>
  );
};

const root = creatRoot(() => <App></App>);

document.querySelector("#root")!.append(root.element);
