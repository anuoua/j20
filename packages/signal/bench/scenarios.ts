import { signal, computed, effect, batch } from "../src/index.ts";
import type { Signal } from "../src/index.ts";
import type { Computed } from "../src/index.ts";
import type { Effect } from "../src/index.ts";

export interface Scenario {
  name: string;
  fn: () => void;
  beforeAll: () => void;
}

const FAN_OUT_COUNT = 200;
const CHAIN_DEPTH = 50;
const BATCH_SIGNALS = 20;

export function createScenarios(): Scenario[] {
  return [
    rawSignalOps(),
    effectConditionalDepSwitch(),
    computedConditionalDepSwitch(),
    signalFanOut(),
    deepComputedChain(),
    batchMultipleUpdates(),
  ];
}

function effectConditionalDepSwitch(): Scenario {
  let a: Signal<number>;
  let b: Signal<number>;
  let flag: Signal<boolean>;
  let toggle = true;

  return {
    name: "effect-conditional-dep-switch",
    beforeAll() {
      a = signal(1);
      b = signal(2);
      flag = signal(true);
      toggle = true;
      effect(() => {
        if (flag.value) {
          a.value;
        } else {
          b.value;
        }
      });
    },
    fn() {
      toggle = !toggle;
      flag.value = toggle;
    },
  };
}

function computedConditionalDepSwitch(): Scenario {
  let a: Signal<number>;
  let b: Signal<number>;
  let flag: Signal<boolean>;
  let c: Computed<number>;
  let toggle = true;

  return {
    name: "computed-conditional-dep-switch",
    beforeAll() {
      a = signal(1);
      b = signal(2);
      flag = signal(true);
      toggle = true;
      c = computed(() => (flag.value ? a.value : b.value));
      c.value;
    },
    fn() {
      toggle = !toggle;
      flag.value = toggle;
      c.value;
    },
  };
}

function signalFanOut(): Scenario {
  let root: Signal<number>;

  return {
    name: "signal-fan-out",
    beforeAll() {
      root = signal(0);
      for (let i = 0; i < FAN_OUT_COUNT; i++) {
        effect(() => {
          root.value;
        });
      }
    },
    fn() {
      root.value = root.value + 1;
    },
  };
}

function deepComputedChain(): Scenario {
  let root: Signal<number>;
  let leaf: Computed<number>;

  return {
    name: "deep-computed-chain",
    beforeAll() {
      root = signal(1);
      let current: Computed<number> = computed(() => root.value * 2);
      for (let i = 1; i < CHAIN_DEPTH; i++) {
        const prev = current;
        current = computed(() => prev.value + 1);
      }
      leaf = current;
      leaf.value;
    },
    fn() {
      root.value = root.value + 1;
      leaf.value;
    },
  };
}

function batchMultipleUpdates(): Scenario {
  const signals: Signal<number>[] = [];
  const effects: Effect[] = [];

  return {
    name: "batch-multiple-updates",
    beforeAll() {
      signals.length = 0;
      effects.length = 0;
      for (let i = 0; i < BATCH_SIGNALS; i++) {
        signals.push(signal(i));
      }
      for (let i = 0; i < signals.length; i++) {
        const s = signals[i]!;
        const eff = effect(() => {
          s.value;
        });
        effects.push(eff);
      }
    },
    fn() {
      batch(() => {
        for (let i = 0; i < signals.length; i++) {
          signals[i]!.value = signals[i]!.value + 1;
        }
      });
    },
  };
}

function rawSignalOps(): Scenario {
  let s: Signal<number>;

  return {
    name: "raw-signal-ops",
    beforeAll() {
      s = signal(0);
    },
    fn() {
      s.value = s.value + 1;
    },
  };
}
