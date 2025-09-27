export type Priority = 
  | 'sync'           // 同步执行
  | 'batch-sync'     // 批量同步执行
  | 'async-low'      // 异步低优先级
  | 'async-normal'   // 异步普通优先级
  | 'async-high'     // 异步高优先级
  | 'async-immediate'; // 异步立即执行

export interface Task {
  id: string;
  priority: Priority;
  callback: () => void;
  createdAt: number;
}

export interface Scheduler {
  addTask: (callback: () => void, priority: Priority) => string;
  removeTask: (id: string) => boolean;
  flush: () => void;
  flushSync: () => void;
}