import { Priority, Task } from './types';

// 任务队列管理器
export class TaskQueue {
  private queues: Record<Priority, string[]> = {
    'sync': [],
    'batch-sync': [],
    'async-immediate': [],
    'async-high': [],
    'async-normal': [],
    'async-low': []
  };
  
  private tasks: Map<string, Task> = new Map();
  
  // 添加任务到队列
  addTask(task: Task): void {
    this.tasks.set(task.id, task);
    this.queues[task.priority].push(task.id);
  }
  
  // 从队列中移除任务
  removeTask(id: string): boolean {
    const task = this.tasks.get(id);
    if (!task) return false;
    
    this.tasks.delete(id);
    const index = this.queues[task.priority].indexOf(id);
    if (index !== -1) {
      this.queues[task.priority].splice(index, 1);
    }
    return true;
  }
  
  // 获取指定优先级的所有任务ID
  getTaskIdsByPriority(priority: Priority): string[] {
    return [...this.queues[priority]];
  }
  
  // 获取所有任务ID
  getAllTaskIds(): string[] {
    return [...this.tasks.keys()];
  }
  
  // 获取任务
  getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }
  
  // 检查队列是否为空
  isEmpty(): boolean {
    for (const priority of Object.keys(this.queues) as Priority[]) {
      if (this.queues[priority].length > 0) {
        return false;
      }
    }
    return true;
  }
  
  // 清空队列
  clear(): void {
    for (const priority of Object.keys(this.queues) as Priority[]) {
      this.queues[priority] = [];
    }
    this.tasks.clear();
  }
}