import { computed, jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment, template as _template } from 'source';
const __tmpl1 = _template(`<div>`);
const __tmpl2 = __tmpl1;
const __tmpl3 = _template(`<div className="p-1" abc num="1" key="id1">`);
const App = () => {};
App.Item = () => {};
const hello = _jsxs(App, computed(() => ({
  get children() {
    return ["text", _jsxs(__tmpl3(), computed(() => ({
      get style() {
        return $k.value;
      },
      ...{
        ...$a.value,
        ...$b.value
      },
      get children() {
        return [_jsx(__tmpl1(), computed(() => ({
          get children() {
            return $hello.value;
          }
        }))), _jsx(__tmpl2(), computed(() => ({
          get children() {
            return $hello.value;
          }
        }))), $hello.value, ...$s.value];
      }
    }))), _jsx(_Fragment), _jsx(App.Item)];
  }
})));