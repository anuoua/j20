import { jsx as _jsx } from "react/jsx-runtime";
const hello = /*#__PURE__*/_jsx("div", (() => {
  const props = {
    style: $k.value,
    className: "p-1",
    abc: true,
    num: 1,
    ...$a.value,
    ...$b.value,
    key: "id1"
  };
  return computed(() => props);
})());