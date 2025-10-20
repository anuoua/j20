let currentEffect: Reaction | null = null;

type Reaction = Effect | Computed<unknown>;

class Signal<T> {
  _value: T;
  readonly _deps: Set<Reaction> = new Set();
  _version: number = 0; // 版本号，用于性能优化

  constructor(value: T) {
    this._value = value;
  }

  get value(): T {
    // 如果有当前正在执行的 effect，建立依赖关系
    if (currentEffect) {
      // 避免重复添加依赖关系
      if (!this._deps.has(currentEffect)) {
        this._deps.add(currentEffect);
        // 同时在 effect/ computed 中记录依赖
        currentEffect.track(this);
      }
    }
    return this._value;
  }

  set value(newValue: T) {
    if (Object.is(this._value, newValue)) return;

    this._value = newValue;
    this._version++; // 增加版本号

    // 触发依赖于此信号的所有 reaction（先拷贝，避免迭代时被修改）
    const depsSnapshot = Array.from(this._deps);
    for (const reaction of depsSnapshot) {
      if (reaction instanceof Computed) {
        // computed 只需要被标脏（cheap）
        reaction.markDirty();
      } else {
        // effect：调度到微任务队列执行
        if (reaction.isActive()) {
          scheduleEffect(reaction);
        }
      }
    }
  }

  // 获取当前版本号
  get version(): number {
    return this._version;
  }
}

function signal<T>(initialValue: T): Signal<T> {
  return new Signal(initialValue);
}

class Computed<T> {
  computeFn: () => T;
  _value: T;
  dirty: boolean = true;
  // 反向依赖：依赖此 computed 的 reactions（effect / computed）
  readonly _deps: Set<Reaction> = new Set();
  // 正向依赖来源：被 this 依赖的 signal / computed
  _sources: Set<Signal<unknown> | Computed<unknown>> = new Set();
  _version: number = 0; // 版本号，用于性能优化

  constructor(computeFn: () => T) {
    this.computeFn = computeFn;
    this._value = undefined as any; // 初始化为 undefined，首次访问时计算
  }

  get value(): T {
    if (this.dirty) {
      this.compute();
    }

    // 建立依赖关系（其他 effect/computed 在读取此 computed 时）
    if (currentEffect) {
      if (!this._deps.has(currentEffect)) {
        this._deps.add(currentEffect);
        currentEffect.track(this);
      }
    }

    return this._value;
  }

  compute(): void {
    // 先标记为不脏（如果 compute 中抛错可能要恢复，但这里保持简单）
    this.dirty = false;

    // 保存之前的 sources，用于清理不再依赖的 source
    const prevSources = this._sources;
    this._sources = new Set();

    // 设置当前 effect 为 this，用于收集依赖
    const prevEffect = currentEffect;
    currentEffect = this;

    try {
      this._value = this.computeFn();
      this._version++; // 计算成功后增加版本号
    } finally {
      currentEffect = prevEffect;
      // 清理不再依赖的 sources：把自己从旧 source 的 _deps 中移除
      prevSources.forEach((source) => {
        if (!this._sources.has(source)) {
          (source as any)._deps?.delete(this);
        }
      });
    }
  }

  markDirty(): void {
    if (this.dirty) return;
    this.dirty = true;
    // 通知依赖于这个 computed 的 reactions（拷贝后遍历）
    const depsSnapshot = Array.from(this._deps);
    for (const reaction of depsSnapshot) {
      if (reaction instanceof Computed) {
        reaction.markDirty();
      } else {
        if (reaction.isActive()) {
          scheduleEffect(reaction);
        }
      }
    }
  }

  // 在计算时跟踪依赖（signal 或 其他 computed）
  track(source: Signal<unknown> | Computed<unknown>): void {
    // 避免重复添加 source
    if (!this._sources.has(source)) {
      this._sources.add(source);
      // 同时把自己加入到 source._deps（反向依赖）
      (source as any)._deps?.add(this);
    }
  }

  // 获取当前版本号
  get version(): number {
    return this._version;
  }
}

class Effect {
  effectFn: () => void;
  // 正向依赖来源：signal / computed
  _deps: Set<Signal<unknown> | Computed<unknown>> = new Set();
  cleanupFn: (() => void) | null = null;
  disposed: boolean = false;
  // 存储依赖的版本号（可选优化）
  _depVersions: Map<Signal<unknown> | Computed<unknown>, number> = new Map();

  constructor(effectFn: () => void) {
    this.effectFn = effectFn;
  }

  execute(): void {
    if (this.disposed) return;

    // 执行之前的清理函数（如果存在）
    if (this.cleanupFn) {
      try {
        this.cleanupFn();
      } catch (e) {
        // 忽略清理函数错误以保证后续能继续执行 effect
        console.error("Error during effect cleanup:", e);
      }
      this.cleanupFn = null;
    }

    // 保存并重置之前的依赖集合，用于清理不再依赖的 source
    const prevDeps = this._deps;
    this._deps = new Set();
    this._depVersions.clear();

    // 执行 effect 并收集新的依赖
    const prevEffect = currentEffect;
    currentEffect = this;

    try {
      const result = this.effectFn();
      if (typeof result === "function") {
        this.cleanupFn = result;
      }
    } finally {
      currentEffect = prevEffect;
      // 清理 prevDeps 中现在不再依赖的 source：把 this 从 source._deps 删除
      prevDeps.forEach((source) => {
        if (!this._deps.has(source)) {
          (source as any)._deps?.delete(this);
        }
      });
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    // 清理所有依赖关系：从每个 source 的 _deps 中删除自己
    this._deps.forEach((dep) => {
      (dep as any)._deps?.delete(this);
    });
    this._deps.clear();
    this._depVersions.clear();

    if (this.cleanupFn) {
      try {
        this.cleanupFn();
      } catch (e) {
        console.error("Error during effect cleanup:", e);
      }
      this.cleanupFn = null;
    }
  }

  isActive(): boolean {
    return !this.disposed;
  }

  // 在执行时跟踪依赖
  track(source: Signal<unknown> | Computed<unknown>): void {
    if (this.disposed) return;
    // 避免重复添加依赖
    if (!this._deps.has(source)) {
      this._deps.add(source);
      // 记录依赖的当前版本号（供未来优化）
      if ('version' in source) {
        try {
          this._depVersions.set(source, (source as any).version);
        } catch {
          // ignore
        }
      }
      // 同时把自己加入到 source._deps（反向依赖）
      (source as any)._deps?.add(this);
    }
  }

  // 检查依赖是否发生变化（当前未被自动用到，但保留供未来优化）
  hasDepsChanged(): boolean {
    for (const [dep, version] of this._depVersions) {
      if ('version' in dep && (dep as any).version !== version) {
        return true;
      }
    }
    return false;
  }
}

function computed<T>(computeFn: () => T): Computed<T> {
  return new Computed(computeFn);
}

function effect(effectFn: () => void | (() => void)): Effect {
  const effectInstance = new Effect(effectFn);
  // 初次执行（立即收集依赖）
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

/* ---- 简单调度器（微任务） ----
   - 对 effect 的执行进行去重调度（收集到队列，微任务中一次性 flush）
   - 保证在同一 tick 多次 signal.set 的情况下 effect 只会被合并执行
*/
const pendingEffects = new Set<Effect>();
let scheduled = false;

function scheduleEffect(e: Effect) {
  if (e.disposed) return;
  pendingEffects.add(e);
  if (!scheduled) {
    scheduled = true;
    Promise.resolve().then(() => {
      scheduled = false;
      const toRun = Array.from(pendingEffects);
      pendingEffects.clear();
      // 这里直接执行，执行时会再次收集/清理依赖
      for (const eff of toRun) {
        if (!eff.disposed) {
          try {
            eff.execute();
          } catch (err) {
            console.error("Error executing scheduled effect:", err);
          }
        }
      }
    });
  }
}

/* 导出 API */
export { signal, computed, effect, untrack, Signal, Computed, Effect };