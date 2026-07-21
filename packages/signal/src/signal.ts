// Types
type Reaction = Effect | Computed<unknown>;
type Source = Signal<unknown> | Computed<unknown>;

// Global runtime state
let currentReaction: Reaction | null = null;
let batchDepth: number = 0;
let effectsQueue: Effect[] = [];
let flushing: boolean = false;
const computationStack: Set<Computed<unknown>> = new Set();

// ──────────────────────────────────────────────────────────────
// Dependency edge helpers (dual-array, O(1) add/remove)
// ──────────────────────────────────────────────────────────────

function track(r: Reaction, s: Source): void {
  // Dedupe: skip if (r, s) edge already exists. Within a single reaction
  // body a source may be read multiple times; without this guard each read
  // would push a duplicate edge, violating the "avoid duplicate dependency
  // tracking" invariant exercised by performance.test.ts.
  const obs = s._observers;
  for (let i = 0; i < obs.length; i++) {
    if (obs[i] === r) return;
  }
  r._sources.push(s);
  r._sourceSlots.push(obs.length);
  obs.push(r);
  s._observerSlots.push(r._sources.length - 1);
}

function removeObserver(s: Source, slot: number): void {
  const obs = s._observers;
  const obsSlots = s._observerSlots;
  const last = obs.length - 1;
  if (slot !== last) {
    const movedReaction = obs[last]!;
    const movedSlot = obsSlots[last]!;
    obs[slot] = movedReaction;
    obsSlots[slot] = movedSlot;
    movedReaction._sourceSlots[movedSlot] = slot;
  }
  obs.pop();
  obsSlots.pop();
}

function cleanupSources(r: Reaction): void {
  const sources = r._sources;
  const slots = r._sourceSlots;
  for (let i = 0; i < sources.length; i++) {
    removeObserver(sources[i]!, slots[i]!);
  }
  r._sources.length = 0;
  r._sourceSlots.length = 0;
}

// ──────────────────────────────────────────────────────────────
// Phase 1: mark downstream reactions
// ──────────────────────────────────────────────────────────────

function markReaction(r: Reaction): void {
  if (r instanceof Computed) {
    if (r._dirty) return;
    r._dirty = true;
    const obs = r._observers;
    for (let i = 0; i < obs.length; i++) {
      markReaction(obs[i]!);
    }
  } else {
    if (!r._queued) {
      r._queued = true;
      effectsQueue.push(r);
    }
  }
}

// ──────────────────────────────────────────────────────────────
// Phase 2: drain effects queue
// ──────────────────────────────────────────────────────────────

function flushEffects(): void {
  if (flushing) return;
  flushing = true;
  try {
    while (effectsQueue.length > 0) {
      const batch = effectsQueue;
      effectsQueue = [];
      for (let i = 0; i < batch.length; i++) {
        runEffect(batch[i]!);
      }
    }
  } finally {
    flushing = false;
  }
}

function hasSourceChanged(e: Effect): boolean {
  const sources = e._sources;
  for (let i = 0; i < sources.length; i++) {
    const src = sources[i]!;
    if (src instanceof Computed) {
      const before = src.version;
      src._recomputeIfDirty();
      if (src.version !== before) return true;
    } else {
      // Signal: Effect is in the queue only if some source changed;
      // no lazy recompute needed for Signals (no equality check on set).
      return true;
    }
  }
  return false;
}

function runEffect(e: Effect): void {
  e._queued = false;
  if (e._disposed) return;
  if (!hasSourceChanged(e)) return;

  if (e._cleanup) {
    try {
      e._cleanup();
    } catch (err) {
      console.warn(err);
    }
    e._cleanup = null;
  }

  cleanupSources(e);

  const prev = currentReaction;
  currentReaction = e;
  try {
    const ret = e._fn();
    if (typeof ret === "function") e._cleanup = ret as () => void;
  } catch (err) {
    console.error(err);
  } finally {
    currentReaction = prev;
  }
}

// ──────────────────────────────────────────────────────────────
// Signal
// ──────────────────────────────────────────────────────────────

class Signal<T> {
  #value: T;
  #version: number = 0;
  readonly _observers: Reaction[] = [];
  readonly _observerSlots: number[] = [];

  constructor(value: T) {
    this.#value = value;
  }

  get value(): T {
    if (currentReaction) track(currentReaction, this);
    return this.#value;
  }

  set value(v: T) {
    if (Object.is(this.#value, v)) return;
    this.#value = v;
    this.#version++;
    if (this._observers.length === 0) return;

    const obs = this._observers;
    for (let i = 0; i < obs.length; i++) {
      markReaction(obs[i]!);
    }
    if (batchDepth === 0) flushEffects();
  }

  get version(): number {
    return this.#version;
  }
}

// ──────────────────────────────────────────────────────────────
// Computed
// ──────────────────────────────────────────────────────────────

class Computed<T> {
  #value: T;
  #version: number = 0;
  _dirty: boolean = true;
  _disposed: boolean = false;
  _fn: () => T;
  readonly _sources: Source[] = [];
  readonly _sourceSlots: number[] = [];
  readonly _observers: Reaction[] = [];
  readonly _observerSlots: number[] = [];

  constructor(fn: () => T) {
    this._fn = fn;
    this.#value = undefined as unknown as T;
  }

  get value(): T {
    if (this._disposed) {
      throw new Error("Cannot access value of disposed computed");
    }
    if (this._dirty) this.#compute();
    if (currentReaction) track(currentReaction, this);
    return this.#value;
  }

  get version(): number {
    return this.#version;
  }

  #compute(): void {
    if (computationStack.has(this)) {
      throw new Error("Circular dependency detected in computed values");
    }
    this._dirty = false;
    cleanupSources(this);

    const prev = currentReaction;
    currentReaction = this;
    computationStack.add(this);
    try {
      const newVal = this._fn();
      if (!Object.is(this.#value, newVal)) {
        this.#value = newVal;
        this.#version++;
      }
    } catch (err) {
      this._dirty = true;
      throw err;
    } finally {
      computationStack.delete(this);
      currentReaction = prev;
    }
  }

  _recomputeIfDirty(): void {
    if (this._dirty) this.#compute();
  }

  dispose(): void {
    if (this._disposed) return;
    this._disposed = true;
    cleanupSources(this);
    this.#value = undefined as unknown as T;
    this._fn = undefined as unknown as () => T;
  }
}

// ──────────────────────────────────────────────────────────────
// Effect
// ──────────────────────────────────────────────────────────────

class Effect {
  _fn: () => unknown;
  _cleanup: (() => void) | null = null;
  _disposed: boolean = false;
  _queued: boolean = false;
  readonly _sources: Source[] = [];
  readonly _sourceSlots: number[] = [];

  constructor(fn: () => unknown) {
    this._fn = fn;
  }

  dispose(): void {
    if (this._disposed) return;
    this._disposed = true;
    cleanupSources(this);
    if (this._cleanup) {
      try {
        this._cleanup();
      } catch (err) {
        console.warn(err);
      }
      this._cleanup = null;
    }
  }
}

// ──────────────────────────────────────────────────────────────
// Factory functions
// ──────────────────────────────────────────────────────────────

function signal<T>(initialValue: T): Signal<T> {
  return new Signal(initialValue);
}

function computed<T>(fn: () => T): Computed<T> {
  return new Computed(fn);
}

function effect(fn: () => unknown): Effect {
  const e = new Effect(fn);
  // Initial run is direct (not via runEffect): no prior sources to check,
  // and errors propagate to the caller (matches existing behavior).
  const prev = currentReaction;
  currentReaction = e;
  try {
    const ret = e._fn();
    if (typeof ret === "function") e._cleanup = ret as () => void;
  } finally {
    currentReaction = prev;
  }
  return e;
}

function untrack<T>(fn: () => T): T {
  const prev = currentReaction;
  currentReaction = null;
  try {
    return fn();
  } finally {
    currentReaction = prev;
  }
}

function batch<T>(fn: () => T): T {
  batchDepth++;
  let result: T;
  try {
    result = fn();
  } finally {
    batchDepth--;
    if (batchDepth === 0) flushEffects();
  }
  return result;
}

export { signal, computed, effect, untrack, batch, Signal, Computed, Effect };
