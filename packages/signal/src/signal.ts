let currentEffect: Reaction | null = null;

// 用于存储所有信号的依赖关系
const depMap = new WeakMap<
  Signal<unknown> | Computed<unknown>,
  Set<Reaction>
>();

type Reaction = Effect | Computed<unknown>;

class Signal<T> {
  _value: T;
  readonly _deps: Set<Reaction> = new Set();

  constructor(value: T) {
    this._value = value;
  }

  get value(): T {
    // 如果有当前正在执行的 effect，建立依赖关系
    if (currentEffect) {
      // 避免重复添加依赖关系
      if (!this._deps.has(currentEffect)) {
        this._deps.add(currentEffect);
        // 同时在effect中记录依赖
        if (currentEffect instanceof Effect) {
          currentEffect.track(this);
        } else if (currentEffect instanceof Computed) {
          currentEffect.track(this);
        }
      }
    }
    return this._value;
  }

  set value(newValue: T) {
    if (Object.is(this._value, newValue)) return;

    this._value = newValue;
    // 触发依赖于此信号的所有 effect 重新执行
    this._deps.forEach((effect) => {
      if (effect instanceof Computed) {
        effect.markDirty();
      } else {
        // 检查effect是否已被dispose
        if (effect.isActive()) {
          effect.execute();
        }
      }
    });
  }
}

function signal<T>(initialValue: T): Signal<T> {
  return new Signal(initialValue);
}

class Computed<T> {
  computeFn: () => T;
  _value: T;
  dirty: boolean = true;
  readonly _deps: Set<Reaction> = new Set();
  _sources: Set<Signal<unknown> | Computed<unknown>> = new Set();

  constructor(computeFn: () => T) {
    this.computeFn = computeFn;
    this._value = undefined as any; // 初始化为undefined，将在第一次访问时计算
  }

  get value(): T {
    if (this.dirty) {
      this.compute();
    }

    // 建立依赖关系
    if (currentEffect) {
      // 避免重复添加依赖关系
      if (!this._deps.has(currentEffect)) {
        this._deps.add(currentEffect);
        if (currentEffect instanceof Effect) {
          currentEffect.track(this);
        } else if (currentEffect instanceof Computed) {
          currentEffect.track(this);
        }
      }
    }

    return this._value;
  }

  compute(): void {
    // 先标记为不脏
    this.dirty = false;

    // 保存当前effect和sources
    const prevEffect = currentEffect;
    const prevSources = this._sources;
    this._sources = new Set();

    // 设置当前effect为this，用于收集依赖
    currentEffect = this;

    try {
      this._value = this.computeFn();
    } finally {
      currentEffect = prevEffect;
      // 清理不再依赖的sources
      prevSources.forEach((source) => {
        if (!this._sources.has(source)) {
          const deps = depMap.get(source);
          if (deps) {
            deps.delete(this);
          }
        }
      });
    }
  }

  markDirty(): void {
    if (this.dirty) return;
    this.dirty = true;
    // 通知依赖于这个 computed 的 effects
    this._deps.forEach((effect) => {
      if (effect instanceof Computed) {
        effect.markDirty();
      } else {
        // 检查effect是否已被dispose
        if (effect.isActive()) {
          effect.execute();
        }
      }
    });
  }

  // 用于在计算时跟踪依赖
  track(source: Signal<unknown> | Computed<unknown>): void {
    // 避免重复添加source
    if (!this._sources.has(source)) {
      this._sources.add(source);
      let deps = depMap.get(source);
      if (!deps) {
        deps = new Set();
        depMap.set(source, deps);
      }
      deps.add(this);
    }
  }
}

class Effect {
  effectFn: () => void;
  readonly _deps: Set<Signal<unknown> | Computed<unknown>> = new Set();
  cleanupFn: (() => void) | null = null;
  disposed: boolean = false;

  constructor(effectFn: () => void) {
    this.effectFn = effectFn;
  }

  execute(): void {
    if (this.disposed) return;

    // 执行清理函数（如果存在）
    if (this.cleanupFn) {
      this.cleanupFn();
      this.cleanupFn = null;
    }

    // 执行effect并收集新的依赖
    const prevEffect = currentEffect;
    currentEffect = this;

    try {
      const result = this.effectFn();
      // 如果effect返回清理函数，保存它
      if (typeof result === "function") {
        this.cleanupFn = result;
      }
    } finally {
      currentEffect = prevEffect;
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    // 清理所有依赖关系
    this._deps.forEach((dep) => {
      const deps = depMap.get(dep);
      if (deps) {
        deps.delete(this);
      }
    });
    this._deps.clear();

    // 执行清理函数（如果存在）
    if (this.cleanupFn) {
      this.cleanupFn();
      this.cleanupFn = null;
    }
  }

  isActive(): boolean {
    return !this.disposed;
  }

  // 用于在执行时跟踪依赖
  track(source: Signal<unknown> | Computed<unknown>): void {
    if (this.disposed) return;
    // 避免重复添加依赖
    if (!this._deps.has(source)) {
      this._deps.add(source);
      let deps = depMap.get(source);
      if (!deps) {
        deps = new Set();
        depMap.set(source, deps);
      }
      deps.add(this);
    }
  }
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
  const prevEffect = currentEffect;
  currentEffect = null;

  try {
    return fn();
  } finally {
    currentEffect = prevEffect;
  }
}

// 导出所有API
export { signal, computed, effect, untrack, Signal, Computed, Effect };
