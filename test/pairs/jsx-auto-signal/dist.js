import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const hello = /*#__PURE__*/_jsx(App, (() => {
  const child0 = /*#__PURE__*/_jsxs("div", (() => {
    const child0 = /*#__PURE__*/_jsx("div", (() => {
      return computed(() => ({
        children: computed(() => $hello.value)
      }));
    })());
    const child1 = /*#__PURE__*/_jsx("div", (() => {
      return computed(() => ({
        children: computed(() => $hello.value)
      }));
    })());
    return computed(() => ({
      style: $k.value,
      className: "p-1",
      abc: true,
      num: 1,
      ...$a.value,
      ...$b.value,
      key: "id1",
      children: [child0, child1, computed(() => $hello.value)]
    }));
  })());
  return computed(() => ({
    children: child0
  }));
})());