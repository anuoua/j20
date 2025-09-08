import { FC, If, WC, computed, $useContext, createContext } from "j20";
import { AppContext } from ".";

export const TodoItem: FC<{
  text: JSX.Element;
  onDelete: () => void;
  children: JSX.Element;
}> = ($props) => {
  let $checked = true;

  const $ctx = $useContext(AppContext);

  console.log($ctx);

  return (
    <AppContext.Consumer>
      {($ctx1) => (
        <div class="flex flex-row items-center gap-2">
          <input
            type="checkbox"
            checked={$checked}
            onChange={() => ($checked = !$checked)}
          />
          <span>
            {$ctx.brand}
            {$ctx1.brand}
          </span>
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
          <button class="btn btn-xs" onClick={$props.onDelete}>
            delete
          </button>
        </div>
      )}
    </AppContext.Consumer>
  );
};
