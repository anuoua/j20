import { Signal } from "signal-polyfill";
import { getCurrentInstance } from "../h/instance";

let needsEnqueue = true;

const watcher = new Signal.subtle.Watcher(() => {
  if (needsEnqueue) {
    needsEnqueue = false;
    queueMicrotask(processPending);
  }
});

function processPending() {
  needsEnqueue = true;

  for (const s of watcher.getPending()) {
    s.get();
  }

  watcher.watch();
}

export function effect(callback: () => void | (() => void)) {
  let cleanup: Function | void;

  const computed = new Signal.Computed(() => {
    typeof cleanup === "function" && cleanup();
    cleanup = callback();
  });

  watcher.watch(computed);
  computed.get();

  const dispose = () => {
    watcher.unwatch(computed);
    typeof cleanup === "function" && cleanup();
    cleanup = undefined;
  };

  getCurrentInstance()?.disposes.push(dispose);

  return dispose;
}
