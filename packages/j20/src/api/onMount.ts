import { effect } from "./effect";

export const onMount = (callback: () => (() => void) | void) => {
  let clean: (() => void) | void;

  let destroyed = false;

  requestAnimationFrame(() => {
    clean = callback();
    if (destroyed) {
      clean?.();
    }
  });

  effect(() => () => {
    destroyed = true;
    clean?.();
  });
};
