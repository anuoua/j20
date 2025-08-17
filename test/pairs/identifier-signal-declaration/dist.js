import { signal as _signal, computed as _computed, jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment, template as _template } from "source";
let $a = _signal(1);
let $b = _signal(2),
  $c = _signal(3);
const $d = _computed(() => $a.value + $b.value);