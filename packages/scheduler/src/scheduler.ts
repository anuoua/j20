import { Priority, Task, Scheduler } from './types';
import { TaskQueue } from './queue';

// 优先级权重映射
const PRIORITY_WEIGHTS: Record<Priority, number> = {
  'sync': 5,
  'batch-sync': 4,
  'async-immediate': 3,
  'async-high': 2,
  'async-normal': 1,
  'async-low': 0
};

// 不同优先级的触发器
const flushers = new Map<Priority, (callback: () => void) => void>([
  ['async-immediate', (callback) => queueMicrotask(callback)],
  ['async-high', (callback) => requestAnimationFrame(() => callback())],
  ['async-normal', (callback) => setTimeout(callback, 0)],
  ['async-low', (callback) => setTimeout(callback, 16)] // 约1帧后执行
]);

export function createScheduler(): Scheduler {
  // 任务队列管理器
  const taskQueue = new TaskQueue();
  
  // 生成唯一ID
  let taskIdCounter = 0;
  const generateId = () => `task_${++taskIdCounter}`;
  
  // 批量执行标志
  let isBatching = false;
  let batchTasks: string[] = [];
  
  // 已经调度的异步任务标志
  const scheduled = new Map<Priority, boolean>();
  
  // 添加任务
  const addTask = (callback: () => void, priority: Priority): string => {
    const id = generateId();
    const task: Task = {
      id,
      priority,
      callback,
      createdAt: Date.now()
    };
    
    taskQueue.addTask(task);
    
    // 如果是同步任务，立即执行
    if (priority === 'sync') {
      // 直接执行同步任务
      try {
        callback();
      } finally {
        taskQueue.removeTask(id);
      }
    } else if (priority === 'batch-sync') {
      // batch-sync任务不立即执行，等待flushSync调用
    } else {
      // 异步任务调度
      scheduleAsyncTask(priority);
    }
    
    return id;
  };
  
  // 调度异步任务
  const scheduleAsyncTask = (priority: Priority) => {
    // 如果该优先级的任务已经调度，则不需要再次调度
    if (scheduled.get(priority)) {
      return;
    }
    
    // 获取对应的触发器
    const flusher = flushers.get(priority);
    if (flusher) {
      scheduled.set(priority, true);
      flusher(() => {
        scheduled.set(priority, false);
        flushByPriority(priority);
      });
    }
  };
  
  // 移除任务
  const removeTask = (id: string): boolean => {
    // 如果在批量任务中，也移除
    const batchIndex = batchTasks.indexOf(id);
    if (batchIndex !== -1) {
      batchTasks.splice(batchIndex, 1);
    }
    
    const task = taskQueue.getTask(id);
    const result = taskQueue.removeTask(id);
    
    return result;
  };
  
  // 执行单个任务
  const executeTask = (id: string) => {
    const task = taskQueue.getTask(id);
    if (!task) return;
    
    try {
      task.callback();
    } finally {
      // 执行完后清理任务
      removeTask(id);
    }
  };
  
  // 按优先级排序任务
  const sortTasksByPriority = (taskIds: string[]): string[] => {
    return taskIds.sort((a, b) => {
      const taskA = taskQueue.getTask(a);
      const taskB = taskQueue.getTask(b);
      
      // 如果任务不存在，保持原顺序
      if (!taskA || !taskB) return 0;
      
      // 首先按优先级权重排序
      const weightDiff = PRIORITY_WEIGHTS[taskB.priority] - PRIORITY_WEIGHTS[taskA.priority];
      if (weightDiff !== 0) return weightDiff;
      
      // 如果优先级相同，按创建时间排序
      return taskA.createdAt - taskB.createdAt;
    });
  };
  
  // 按优先级刷新任务
  const flushByPriority = (priority: Priority) => {
    const taskIds = taskQueue.getTaskIdsByPriority(priority);
    
    // 按优先级排序
    const sortedTaskIds = sortTasksByPriority(taskIds);
    
    // 执行所有该优先级的任务
    for (const id of sortedTaskIds) {
      const task = taskQueue.getTask(id);
      if (task) {
        try {
          task.callback();
        } finally {
          // 执行完后清理任务
          removeTask(id);
        }
      }
    }
  };
  
  // 刷新所有异步任务
  const flush = () => {
    // 收集所有异步任务
    const asyncTaskIds: string[] = [];
    
    for (const priority of Object.keys(PRIORITY_WEIGHTS) as Priority[]) {
      if (priority !== 'sync' && priority !== 'batch-sync') {
        asyncTaskIds.push(...taskQueue.getTaskIdsByPriority(priority));
      }
    }
    
    // 按优先级排序
    const sortedTaskIds = sortTasksByPriority(asyncTaskIds);
    
    // 执行所有异步任务
    for (const id of sortedTaskIds) {
      const task = taskQueue.getTask(id);
      if (task) {
        try {
          task.callback();
        } finally {
          // 执行完后清理任务
          removeTask(id);
        }
      }
    }
  };
  
  // 刷新同步和批量同步任务
  const flushSync = () => {
    // 执行所有同步任务
    const syncTaskIds = taskQueue.getTaskIdsByPriority('sync');
    // 执行所有同步任务
    for (const id of syncTaskIds) {
      const task = taskQueue.getTask(id);
      if (task) {
        try {
          task.callback();
        } finally {
          // 执行完后清理任务
          removeTask(id);
        }
      }
    }
    
    // 执行批量同步任务
    if (!isBatching) {
      isBatching = true;
      const batchTaskIds = [...taskQueue.getTaskIdsByPriority('batch-sync')];
      
      // 按优先级排序
      const sortedTaskIds = sortTasksByPriority(batchTaskIds);
      
      // 执行所有批量同步任务
      for (const id of sortedTaskIds) {
        const task = taskQueue.getTask(id);
        if (task) {
          try {
            task.callback();
          } finally {
            // 执行完后清理任务
            removeTask(id);
          }
        }
      }
      
      isBatching = false;
      batchTasks = [];
    }
  };
  
  return {
    addTask,
    removeTask,
    flush,
    flushSync
  };
}