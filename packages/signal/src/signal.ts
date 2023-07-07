// 当前正在执行的effect或computed
let currentReaction: Reaction | null = null;

// 存储所有信号的依赖关系
const depMap = new WeakMap<
  Signal<unknown> | Computed<unknown>,
  Set<Reaction>
>();

type Reaction = Effect | Computed<unknown>;

/**
 * Signal类 - 用于存储响应式数据
 */
class Signal<T> {
  private _value: T;
  private _version: number = 0;
  public readonly _deps: Set<Reaction> = new Set();

  constructor(value: T) {
    this._value = value;
  }

  get value(): T {
    // 如果有当前正在执行的reaction，建立依赖关系
    if (currentReaction) {
      this.track(currentReaction);
    }
    return this._value;
  }

  set value(newValue: T) {
    if (Object.is(this._value, newValue)) return;

    this._value = newValue;
    this._version++;
    
    // 通知所有依赖项
    this._deps.forEach((reaction) => {
      if (reaction instanceof Computed) {
        reaction.markDirty();
      } else if (reaction.isActive()) {
        // 对于effect，使用版本检查优化
        if (reaction._depVersions.has(this) || reaction.hasDepsChanged()) {
          reaction.execute();
        }
      }
    });
  }

  get version(): number {
    return this._version;
  }

  // 建立依赖关系
  private track(reaction: Reaction): void {
    if (!this._deps.has(reaction)) {
      this._deps.add(reaction);
      
      // 维护反向依赖关系
      let reactions = depMap.get(this);
      if (!reactions) {
        reactions = new Set();
        depMap.set(this, reactions);
      }
      reactions.add(reaction);
      
      // 在reaction中记录依赖
      reaction.track(this);
    }
  }
}

/**
 * Computed类 - 用于计算派生值
 */
class Computed<T> {
  private computeFn: () => T;
  private _value: T;
  private _version: number = 0;
  public dirty: boolean = true;
  public disposed: boolean = false;
  public readonly _deps: Set<Reaction> = new Set();
  private sources: Set<Signal<unknown> | Computed<unknown>> = new Set();

  constructor(computeFn: () => T) {
    this.computeFn = computeFn;
    // 使用symbol作为初始值占位符
    this._value = undefined as unknown as T;
  }

  get value(): T {
    if (this.disposed) {
      throw new Error('Cannot access value of disposed computed');
    }
    
    if (this.dirty) {
      this.compute();
    }

    // 建立依赖关系
    if (currentReaction) {
      if (!this._deps.has(currentReaction)) {
        this._deps.add(currentReaction);
        currentReaction.track(this);
      }
    }

    return this._value;
  }

  get version(): number {
    return this._version;
  }

  private compute(): void {
    if (this.disposed) {
      throw new Error('Cannot compute disposed computed');
    }
    
    // 检查循环依赖
    if (computationStack.includes(this)) {
      throw new Error('Circular dependency detected in computed values');
    }
    
    this.dirty = false;

    // 保存当前状态
    const prevReaction = currentReaction;
    const prevSources = this.sources;
    this.sources = new Set();

    // 将当前computed加入计算栈
    computationStack.push(this);
    currentReaction = this;

    try {
      this._value = this.computeFn();
      this._version++;
    } catch (e) {
      this.dirty = true;
      throw e;
    } finally {
      // 清理工作
      const index = computationStack.indexOf(this);
      if (index !== -1) {
        computationStack.splice(index, 1);
      }
      
      currentReaction = prevReaction;
      
      // 清理不再依赖的sources
      prevSources.forEach((source) => {
        if (!this.sources.has(source)) {
          const reactions = depMap.get(source);
          if (reactions) {
            reactions.delete(this);
          }
        }
      });
    }
  }

  markDirty(): void {
    if (this.disposed || this.dirty) return;
    this.dirty = true;
    
    // 通知依赖项
    this._deps.forEach((reaction) => {
      if (reaction instanceof Computed) {
        reaction.markDirty();
      } else if (reaction.isActive()) {
        reaction.execute();
      }
    });
  }

  track(source: Signal<unknown> | Computed<unknown>): void {
    if (this.disposed) return;
    
    if (!this.sources.has(source)) {
      this.sources.add(source);
      
      let reactions = depMap.get(source);
      if (!reactions) {
        reactions = new Set();
        depMap.set(source, reactions);
      }
      reactions.add(this);
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    // 清理所有依赖关系
    this.sources.forEach((source) => {
      const reactions = depMap.get(source);
      if (reactions) {
        reactions.delete(this);
      }
    });
    
    this.sources.clear();
    this._deps.clear();
    
    // 清理引用
    this._value = undefined as unknown as T;
    this.computeFn = undefined as unknown as () => T;
  }
}

// 用于检测循环依赖
const computationStack: Computed<unknown>[] = [];

/**
 * Effect类 - 用于执行副作用
 */
class Effect {
  private effectFn: () => void | (() => void);
  private cleanupFn: (() => void) | null = null;
  public disposed: boolean = false;
  public readonly _deps: Set<Signal<unknown> | Computed<unknown>> = new Set();
  public readonly _depVersions: Map<Signal<unknown> | Computed<unknown>, number> = new Map();

  constructor(effectFn: () => void | (() => void)) {
    this.effectFn = effectFn;
  }

  execute(): void {
    if (this.disposed) return;

    // 执行清理函数
    if (this.cleanupFn) {
      try {
        this.cleanupFn();
      } catch (e) {
        console.warn('Error in effect cleanup function:', e);
      }
      this.cleanupFn = null;
    }

    // 执行effect并收集依赖
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

    // 清理所有依赖关系
    this._deps.forEach((dep) => {
      const reactions = depMap.get(dep);
      if (reactions) {
        reactions.delete(this);
      }
    });
    
    this._deps.clear();
    this._depVersions.clear();

    // 执行清理函数
    if (this.cleanupFn) {
      try {
        this.cleanupFn();
      } catch (e) {
        console.warn('Error in effect cleanup function:', e);
      }
      this.cleanupFn = null;
    }
  }

  isActive(): boolean {
    return !this.disposed;
  }

  track(source: Signal<unknown> | Computed<unknown>): void {
    if (this.disposed) return;
    
    if (!this._deps.has(source)) {
      this._deps.add(source);
      
      // 记录依赖的版本号
      if ('version' in source) {
        this._depVersions.set(source, source.version);
      }
      
      let reactions = depMap.get(source);
      if (!reactions) {
        reactions = new Set();
        depMap.set(source, reactions);
      }
      reactions.add(this);
    }
  }

  hasDepsChanged(): boolean {
    for (const [dep, version] of this._depVersions) {
      if ('version' in dep && dep.version !== version) {
        return true;
      }
    }
    return false;
  }
}

// 创建信号
function signal<T>(initialValue: T): Signal<T> {
  return new Signal(initialValue);
}

// 创建计算值
function computed<T>(computeFn: () => T): Computed<T> {
  return new Computed(computeFn);
}

// 创建副作用
function effect(effectFn: () => void | (() => void)): Effect {
  const effectInstance = new Effect(effectFn);
  effectInstance.execute();
  return effectInstance;
}

// 临时取消追踪
function untrack<T>(fn: () => T): T {
  const prevReaction = currentReaction;
  currentReaction = null;

  try {
    return fn();
  } finally {
    currentReaction = prevReaction;
  }
}

// 导出所有API
export { signal, computed, effect, untrack, Signal, Computed, Effect };