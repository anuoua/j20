import { computed, jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from 'source';
const __child_cache = [];
const App = () => {};
App.Item = () => {};
const hello = _jsxs(App, computed(() => ({
  get children() {
    return ["text", __child_cache[3] ?? (__child_cache[3] = _jsxs(`<div className="p-1" abc num="1" key="id1">`, computed(() => ({
      get style() {
        return $k.value;
      },
      ...{
        ...$a.value,
        ...$b.value
      },
      get children() {
        return [__child_cache[1] ?? (__child_cache[1] = _jsx(`<div>`, computed(() => ({
          get children() {
            return $hello.value;
          }
        })))), __child_cache[2] ?? (__child_cache[2] = _jsx(`<div>`, computed(() => ({
          get children() {
            return $hello.value;
          }
        })))), $hello.value, ...$s.value];
      }
    })))), __child_cache[4] ?? (__child_cache[4] = jsx(_Fragment)), __child_cache[5] ?? (__child_cache[5] = jsx(App.Item))];
  }
})));