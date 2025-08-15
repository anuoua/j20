import { computed as _computed, jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment, template as _template } from "source";
const __child_cache = [];
let $a = signal(1);
let $b = signal(2),
  $c = signal(3);
const $d = _computed(() => $a.value + $b.value);