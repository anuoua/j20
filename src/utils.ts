import { isRef } from "@vue/reactivity";
import type { Ref } from "@vue/reactivity";

export const prop =
  <T>(p: Ref<T> | T) =>
  () =>
    isRef(p) ? p.value : p;
