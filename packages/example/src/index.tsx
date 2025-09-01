import {
  Fragment,
  For,
  If,
  creatRoot,
  Dynamic,
  Case,
  Default,
  Switch,
  FC,
  registWebComponents,
  WCFC,
  wc,
} from "j20";
const TodoItem: WCFC<{
  text: JSX.Element;
  onDelete: () => void;
  children: JSX.Element;
}> = ($props) => {
  let $checked = true;

  console.log(wc());

  return (
    <div style="display: flex; align-items: center; gap: 10px;">
      <input
        type="checkbox"
        checked={$checked}
        onChange={() => ($checked = !$checked)}
      ></input>
      <slot></slot>
      <div>
        <If
          of={$checked}
          else={
            <span>
              {$props.text} {$checked.toString()}
            </span>
          }
        >
          <span style="text-decoration: line-through;">
            {$props.text} {$checked.toString()}
          </span>
        </If>
      </div>
      <button onClick={$props.onDelete}>delete</button>
    </div>
  );
};

TodoItem.customElement = {
  tag: "todo-item",
  shadow: "closed",
  props: {
    text: {
      attribute: "text",
      type: "string",
    },
  },
};

// registWebComponents(TodoItem);

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
    document.startViewTransition(() => {
      $list = [
        ...$list,
        {
          id: Math.random(),
          text: e.target.value,
        },
      ];
    });
  };

  const handleDelete = (id: number) => {
    $list = $list.filter((item) => item.id !== id);
  };

  const handleSwitch = () => {
    $list = $list.length ? [] : [...arr];
  };

  let $el = <div>hellooooo</div>;
  let $enable = false;

  setTimeout(() => {
    $el = <div>world</div>;
    $enable = !$enable;
    setTimeout(() => {
      $enable = !$enable;
    }, 1000);
  }, 1000);

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

      <Dynamic>{$el}</Dynamic>

      <Switch>
        <Case of={$enable}>
          <div>1</div>
        </Case>
        <Case of={!$enable}>
          <div>2</div>
        </Case>
        <Default>
          <div>3</div>
        </Default>
      </Switch>

      <input onChange={add}></input>
      <div>
        <For of={$list}>
          {($item, $index) => (
            <TodoItem
              text={
                <span style="color: red">
                  text: {$item.text};{"index:"}
                  {$index}
                </span>
              }
              onDelete={() => handleDelete($item.id)}
            >
              <span>killer</span>
            </TodoItem>
            // <todo-item text={$index}>
            //   <span>killer</span>
            // </todo-item>
          )}
        </For>
      </div>
    </div>
  );
};

const root = creatRoot(() => <App></App>);

document.querySelector("#root")!.append(root.element);
