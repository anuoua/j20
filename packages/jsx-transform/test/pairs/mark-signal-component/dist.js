import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment, template as _template } from "source";
const el = _jsx(Widget, () => ({
  get Header() {
    return /* @signal-component */({
      msg: $msg
    }) => $msg;
  },
  get Row() {
    return /* @signal-component */function ({
      id: $id
    }) {
      return $id;
    };
  },
  get Plain() {
    return ({
      msg
    }) => msg;
  },
  get onClick() {
    return ({
      e: $e
    }) => $e;
  },
  get title() {
    return "str";
  },
  ...{
    x: $x => $x
  }
}));