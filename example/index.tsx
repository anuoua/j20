import { computed } from "../src/api/computed";
import { effect } from "../src/api/effect";
import { signal } from "../src/api/signal";
import { List } from "../src/control/list";
import { If } from "../src/control/if";

console.log(computed, effect, signal);

const TodoItem = ($props: any) => {
  let $checked = false;

  return (
    <div style="display: flex; align-items: center; gap: 10px;">
      <input
        type="checkbox"
        checked={$checked}
        onChange={() => ($checked = !$checked)}
      ></input>
      <div>
        <If of={$checked} else={$props.text}>
          {(checked) => (
            <span style="text-decoration: line-through;">{$props.text}</span>
          )}
        </If>
      </div>
      <button onClick={$props.onDelete}>delete</button>
    </div>
  );
};

const App = ($props: { name: string; children: any }) => {
  let $list = [
    {
      id: 1,
      text: "1",
    },
  ];

  const add = (e) => {
    console.log(e.target.value);
    $list = [
      ...$list,
      {
        id: $list.length + 1,
        text: e.target.value,
      },
    ];
  };

  const handleDelete = (id) => {
    $list = $list.filter((item) => item.id !== id);
  };

  return (
    <div>
      <input onChange={add}></input>
      <div>
        <List of={$list}>
          {($item) => (
            <TodoItem
              text={$item.text}
              onDelete={() => handleDelete($item.id)}
            />
          )}
        </List>
      </div>
    </div>
  );
};

document.querySelector("#root")!.append(<App name="app">hao</App>);
