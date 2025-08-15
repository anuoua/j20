import { computed as _computed, jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment, template as _template } from "source";
const __child_cache = [];
const $useClip = $__0 => {
  const $rest = _computed(() => (() => {
    const {
      x,
      y,
      ...__2
    } = $__0.value;
    return __2;
  })());
  const $y = _computed(() => $__0.value["y"]);
  const $x = _computed(() => $__0.value["x"]);
  return _computed(() => ({
    $x: $x.value
  }));
};
const $useCount = () => _computed(() => $k.value);
function $useClip2($__1) {
  const $rest = _computed(() => (() => {
    const {
      x,
      y,
      ...__2
    } = $__1.value;
    return __2;
  })());
  const $y = _computed(() => $__1.value["y"]);
  const $x = _computed(() => $__1.value["x"]);
  return _computed(() => ({
    $x: $x.value
  }));
}
const $useClip3 = ($x, $y) => {};
const $__2 = $useClip3(_computed(() => $a.value + 1), _computed(() => $b.value));
const $k = _computed(() => $__2.value["k"]);
const $pg = _computed(() => $usePagination(_computed(() => ({
  ...$a.value
}))));