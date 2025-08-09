import { computed } from "../src/api/computed";
import { effect } from "../src/api/effect";
import { signal } from "../src/api/signal";
import { List } from "../src/control/list";
import { If } from "../src/control/if";
import { creatRoot } from "../src/h/createRoot";

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
for (let i = 0; i < 10; i++) {
  arr.push({
    id: i,
    text: `item ${i}`,
  });
}

const App = () => {
  let $list = arr;

  const add = (e: Event & { target: HTMLInputElement }) => {
    $list = [
      ...$list,
      {
        id: $list.length + 1,
        text: e.target.value,
      },
    ];
  };

  const handleDelete = (id: number) => {
    $list = $list.filter((item) => item.id !== id);
  };

  return (
    <div>
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

const root = creatRoot(() => <App />);

console.log(root);

document.querySelector("#root")!.append(root.element);
