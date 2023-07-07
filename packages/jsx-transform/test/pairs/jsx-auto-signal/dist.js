import { computed, jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment, template as _template } from 'source';
const __tmpl1 = _template(`<path d="m14 12 4 4 4-4">`);
const __tmpl2 = _template(`<path d="M18 16V7">`);
const __tmpl3 = _template(`<path d="m2 16 4.039-9.69a.5.5 0 0 1 .923 0L11 16">`);
const __tmpl4 = _template(`<path d="M3.304 13h6.392">`);
const __tmpl5 = _template(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-aarrow-down-icon lucide-a-arrow-down">`);
const __tmpl6 = _template(`<div>`);
const __tmpl7 = __tmpl6;
const __tmpl8 = _template(`<div className="p-1" abc num="1" key="id1">`);
const __tmpl9 = _template(`<input>`);
const __tmpl10 = __tmpl6;
const App = () => {};
App.Item = () => {};
const hello = _jsxs(App, () => ({
  get children() {
    return [_jsxs(__tmpl5(), undefined, () => [_jsx(__tmpl1(true)), _jsx(__tmpl2(true)), _jsx(__tmpl3(true)), _jsx(__tmpl4(true))]), _jsxs(_Fragment, () => ({
      get children() {
        return ["text", _jsxs(__tmpl8(), () => ({
          get style() {
            return $k;
          },
          ...{
            ...$a,
            ...$b
          }
        }), () => [_jsx(__tmpl6(), undefined, () => () => $hello), _jsx(__tmpl7(), undefined, () => () => $hello), () => $hello, ...$s]), _jsx(__tmpl9(), () => ({
          get onChange() {
            return add;
          }
        }))];
      }
    })), _jsxs(__tmpl10(), undefined, () => ["hello", 123]), _jsx(App.Item, () => ({
      get children() {
        return $hello;
      }
    }))];
  }
}));