const $useClip = $__0 => {
  const $rest = computed(() => (() => {
    const {
      x,
      y,
      ...__2
    } = $__0.value;
    return __2;
  })());
  const $y = computed(() => $__0.value["y"]);
  const $x = computed(() => $__0.value["x"]);
};
function $useClip2($__1) {
  const $rest = computed(() => (() => {
    const {
      x,
      y,
      ...__2
    } = $__1.value;
    return __2;
  })());
  const $y = computed(() => $__1.value["y"]);
  const $x = computed(() => $__1.value["x"]);
}
const $useClip3 = ($x, $y) => {};
const $__2 = computed(() => $useClip3(computed(() => $a.value + 1), computed(() => $b.value)));
const $k = computed(() => $__2.value["k"]);
const $pg = computed(() => $usePagination(computed(() => ({
  ...$a.value
}))));