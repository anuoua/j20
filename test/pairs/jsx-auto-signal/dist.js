import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const hello = /*#__PURE__*/_jsx(App, (() => {
  let child0;
  return computed(() => ({
    get children() {
      return child0 ?? (child0 = /*#__PURE__*/_jsxs("div", (() => {
        let child0;
        let child1;
        return computed(() => ({
          style: $k.value,
          className: "p-1",
          abc: true,
          num: 1,
          ...$a.value,
          ...$b.value,
          key: "id1",
          get children() {
            return [child0 ?? (child0 = /*#__PURE__*/_jsx("div", (() => {
              return computed(() => ({
                get children() {
                  return computed(() => $hello.value);
                }
              }));
            })())), child1 ?? (child1 = /*#__PURE__*/_jsx("div", (() => {
              return computed(() => ({
                get children() {
                  return computed(() => $hello.value);
                }
              }));
            })())), computed(() => $hello.value)];
          }
        }));
      })()));
    }
  }));
})());