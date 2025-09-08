import { signal as _signal, computed as _computed } from "source";
let $a = _signal(1);
let $b = _signal(2),
  $c = _signal(3);
const $d = _computed(() => $a.value + $b.value);
const $a1 = $($a);
const a = $($a1);
const ss = () => $($a);