let $a = signal(1);
let $b = signal(2),
  $c = signal(3);
const $d = computed(() => $a.value + $b.value);