let currentReaction: Reaction | null = null;

let batchDepth: number = 0;
let pendingEffects: Set<Effect> = new Set();

const depMap = new WeakMap<
  Signal<unknown> | Computed<unknown>,
  Set<Reaction>
>();

type Reaction = Effect | Computed<unknown>;

class Signal<T> {
  readonly SIGNAL = true;
  private _value: T;
  private _version: number = 0;
  public readonly _deps: Set<Reaction> = new Set();

  constructor(value: T) {
    this._value = value;
  }

  get value(): T {
    if (currentReaction) {
      this.track(currentReaction);
    }
    return this._value;
  }

  set value(newValue: T) {
    if (Object.is(this._value, newValue)) return;

    this._value = newValue;
    this._version++;

    if (this._deps.size === 0) return;
    const deps = Array.from(this._deps);
    deps.forEach((reaction) => {
      if (reaction instanceof Computed) {
        reaction.markDirty();
      } else if (reaction.isActive()) {
        if (batchDepth > 0) {
          pendingEffects.add(reaction);
        } else {
          reaction.execute();
        }
      }
    });
  }

  get version(): number {
    return this._version;
  }

  private track(reaction: Reaction): void {
    if (!this._deps.has(reaction)) {
      this._deps.add(reaction);

      let reactions = depMap.get(this);
      if (!reactions) {
        reactions = new Set();
        depMap.set(this, reactions);
      }
      reactions.add(reaction);
    }
    reaction.track(this);
  }
}

class Computed<T> {
  readonly SIGNAL = true;
  private computeFn: () => T;
  private _value: T;
  private _version: number = 0;
  public dirty: boolean = true;
  public disposed: boolean = false;
  public readonly _deps: Set<Reaction> = new Set();
  private sources: Set<Signal<unknown> | Computed<unknown>> = new Set();

  constructor(computeFn: () => T) {
    this.computeFn = computeFn;
    this._value = undefined as unknown as T;
  }

  get value(): T {
    if (this.disposed) {
      throw new Error("Cannot access value of disposed computed");
    }

    if (this.dirty) {
      this.compute();
    }

    if (currentReaction) {
      if (!this._deps.has(currentReaction)) {
        this._deps.add(currentReaction);
      }
      currentReaction.track(this);
    }

    return this._value;
  }

  get version(): number {
    return this._version;
  }

  private compute(): void {
    if (this.disposed) {
      throw new Error("Cannot compute disposed computed");
    }

    if (computationStack.has(this)) {
      throw new Error("Circular dependency detected in computed values");
    }

    this.dirty = false;

    const prevReaction = currentReaction;
    const prevSources = this.sources;
    this.sources = new Set();

    computationStack.add(this);
    currentReaction = this;

    try {
      this._value = this.computeFn();
      this._version++;
    } catch (e) {
      this.dirty = true;
      throw e;
    } finally {
      computationStack.delete(this);

      currentReaction = prevReaction;

      prevSources.forEach((source) => {
        if (!this.sources.has(source)) {
          const reactions = depMap.get(source);
          if (reactions) {
            reactions.delete(this);
          }
          source._deps.delete(this);
        }
      });
    }
  }

  markDirty(): void {
    if (this.disposed || this.dirty) return;
    this.dirty = true;

    if (this._deps.size === 0) return;
    const deps = Array.from(this._deps);
    deps.forEach((reaction) => {
      if (reaction instanceof Computed) {
        reaction.markDirty();
      } else if (reaction.isActive()) {
        if (batchDepth > 0) {
          pendingEffects.add(reaction);
        } else {
          reaction.execute();
        }
      }
    });
  }

  track(source: Signal<unknown> | Computed<unknown>): void {
    if (this.disposed) return;
    this.sources.add(source);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    this.sources.forEach((source) => {
      const reactions = depMap.get(source);
      if (reactions) {
        reactions.delete(this);
      }
      source._deps.delete(this);
    });

    this.sources.clear();
    this._deps.clear();

    this._value = undefined as unknown as T;
    this.computeFn = undefined as unknown as () => T;
  }
}

const computationStack = new Set<Computed<unknown>>();

class Effect {
  private effectFn: () => void | (() => void);
  private cleanupFn: (() => void) | null = null;
  public disposed: boolean = false;
  public readonly _deps: Set<Signal<unknown> | Computed<unknown>> = new Set();

  constructor(effectFn: () => void | (() => void)) {
    this.effectFn = effectFn;
  }

  execute(): void {
    if (this.disposed) return;

    if (this.cleanupFn) {
      try {
        this.cleanupFn();
      } catch (e) {
        console.warn("Error in effect cleanup function:", e);
      }
      this.cleanupFn = null;
    }

    this._deps.forEach((dep) => {
      const reactions = depMap.get(dep);
      if (reactions) {
        reactions.delete(this);
      }
      dep._deps.delete(this);
    });
    this._deps.clear();

    const prevReaction = currentReaction;
    currentReaction = this;

    try {
      const result = this.effectFn();
      if (typeof result === "function") {
        this.cleanupFn = result;
      }
    } finally {
      currentReaction = prevReaction;
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    this._deps.forEach((dep) => {
      const reactions = depMap.get(dep);
      if (reactions) {
        reactions.delete(this);
      }
      dep._deps.delete(this);
    });

    this._deps.clear();

    if (this.cleanupFn) {
      try {
        this.cleanupFn();
      } catch (e) {
        console.warn("Error in effect cleanup function:", e);
      }
      this.cleanupFn = null;
    }
  }

  isActive(): boolean {
    return !this.disposed;
  }

  track(source: Signal<unknown> | Computed<unknown>): void {
    if (this.disposed) return;
    this._deps.add(source);
  }
}

function signal<T>(initialValue: T): Signal<T> {
  return new Signal(initialValue);
}

function computed<T>(computeFn: () => T): Computed<T> {
  return new Computed(computeFn);
}

function effect(effectFn: () => void | (() => void)): Effect {
  const effectInstance = new Effect(effectFn);
  effectInstance.execute();
  return effectInstance;
}

function untrack<T>(fn: () => T): T {
  const prevReaction = currentReaction;
  currentReaction = null;

  try {
    return fn();
  } finally {
    currentReaction = prevReaction;
  }
}

function batch<T>(fn: () => T): T {
  batchDepth++;

  try {
    return fn();
  } finally {
    batchDepth--;

    if (batchDepth === 0) {
      const effects = Array.from(pendingEffects);
      pendingEffects.clear();

      effects.forEach((effect) => {
        if (effect.isActive()) {
          try {
            effect.execute();
          } catch (e) {
            console.error(e);
          }
        }
      });
    }
  }
}

export { signal, computed, effect, untrack, batch, Signal, Computed, Effect };
