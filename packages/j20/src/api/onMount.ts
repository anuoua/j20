import { effect } from "./effect";

export const onMount = (callback: () => (() => void) | void) => {
  let clean: (() => void) | void;

  let destroyed = false;

  requestAnimationFrame(() => {
    clean = callback();
    if (destroyed && clean) {
      if (typeof clean === "function") {
        clean();
      } else {
        console.warn("onMount callback must return a function or undefined");
      }
    }
  });

  effect(() => () => {
    destroyed = true;
    if (clean) {
      if (typeof clean === "function") {
        clean();
      } else {
        console.warn("onMount callback must return a function or undefined");
      }
    }
  });
};
