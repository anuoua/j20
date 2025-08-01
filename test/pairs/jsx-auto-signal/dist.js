function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const hello = /*#__PURE__*/React.createElement("div", _extends({
  style: computed(() => $k.value),
  className: {
    value: "p-1"
  },
  abc: {
    value: true
  },
  num: {
    value: 1
  }
}, computed(() => ({
  ...$a.value,
  ...$b.value
}))));