/**
 * AgentScheduler.ts - Agent调度器，负责任务调度
 */

import { AgentBus, AgentMessage, agentBus } from './AgentBus';

export enum TaskPriority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  NORMAL = 'NORMAL',
  LOW = 'LOW'
}

export interface Task {
  id: string;
  type: string;
  priority: TaskPriority;
  payload: any;
  agentId: string;
  timeout?: number;
  createdAt: number;
}

export class AgentScheduler {
  private agentBus: AgentBus;
  private taskQueue: Task[];
  private runningTasks: Map<string, { task: Task; timeoutId: NodeJS.Timeout }>;
  private isRunning: boolean;
  private processInterval: NodeJS.Timeout | null;
  private readonly agentId: string = 'scheduler';

  constructor(agentBus: AgentBus) {
    this.agentBus = agentBus;
    this.taskQueue = [];
    this.runningTasks = new Map();
    this.isRunning = false;
    this.processInterval = null;

    // BUG: 这里尝试订阅消息，但"scheduler" agent还未注册
    // 这会导致AgentBus.subscribe抛出错误
    this.agentBus.subscribe(this.agentId, this.handleMessage.bind(this));
  }

  /**
   * 启动调度器
   */
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.processInterval = setInterval(() => {
      this.processTasks();
    }, 100);

    console.log('AgentScheduler started');
  }

  /**
   * 停止调度器
   */
  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.processInterval) {
      clearInterval(this.processInterval);
      this.processInterval = null;
    }

    // 修复：清除所有运行中的任务定时器，防止定时器泄露
    for (const [taskId, { timeoutId }] of this.runningTasks) {
      clearTimeout(timeoutId);
    }
    this.runningTasks.clear();

    console.log('AgentScheduler stopped');
  }

  /**
   * 提交任务
   */
  submitTask(task: Omit<Task, 'id' | 'createdAt'>): string {
    const fullTask: Task = {
      ...task,
      id: generateId(),
      createdAt: Date.now()
    };

    // 按优先级插入队列
    const insertIndex = this.taskQueue.findIndex(
      t => this.priorityValue(t.priority) < this.priorityValue(fullTask.priority)
    );
    
    if (insertIndex === -1) {
      this.taskQueue.push(fullTask);
    } else {
      this.taskQueue.splice(insertIndex, 0, fullTask);
    }

    return fullTask.id;
  }

  /**
   * 取消任务
   */
  cancelTask(taskId: string): boolean {
    const index = this.taskQueue.findIndex(t => t.id === taskId);
    if (index !== -1) {
      this.taskQueue.splice(index, 1);
      return true;
    }

    // 检查是否在运行中
    const runningTask = this.runningTasks.get(taskId);
    if (runningTask) {
      clearTimeout(runningTask.timeoutId);
      this.runningTasks.delete(taskId);
      return true;
    }

    return false;
  }

  /**
   * 处理消息
   */
  private handleMessage(message: AgentMessage): void {
    switch (message.type) {
      case 'TASK_COMPLETE':
        this.handleTaskComplete(message.payload.taskId);
        break;
      case 'TASK_FAILED':
        this.handleTaskFailed(message.payload.taskId, message.payload.error);
        break;
    }
  }

  /**
   * 处理任务完成
   */
  private handleTaskComplete(taskId: string): void {
    const runningTask = this.runningTasks.get(taskId);
    if (runningTask) {
      // 修复：清除超时定时器，防止定时器泄露
      clearTimeout(runningTask.timeoutId);
      this.runningTasks.delete(taskId);
    }
  }

  /**
   * 处理任务失败
   */
  private handleTaskFailed(taskId: string, error: string): void {
    console.error(`Task ${taskId} failed: ${error}`);
    const runningTask = this.runningTasks.get(taskId);
    if (runningTask) {
      // 修复：清除超时定时器，防止定时器泄露
      clearTimeout(runningTask.timeoutId);
      this.runningTasks.delete(taskId);
    }
  }

  /**
   * 处理任务队列
   */
  private processTasks(): void {
    if (this.taskQueue.length === 0) return;

    const task = this.taskQueue.shift()!;
    this.executeTask(task);
  }

  /**
   * 执行任务
   */
  private executeTask(task: Task): void {
    const timeout = task.timeout || 30000;

    // 设置任务超时定时器
    const timeoutId = setTimeout(() => {
      this.handleTaskTimeout(task.id);
    }, timeout);

    this.runningTasks.set(task.id, { task, timeoutId });

    // 发送任务执行消息
    this.agentBus.send({
      id: generateId(),
      type: 'EXECUTE_TASK',
      priority: task.priority,
      payload: { taskId: task.id, ...task.payload },
      from: this.agentId,
      to: task.agentId,
      timestamp: Date.now()
    });
  }

  /**
   * 处理任务超时
   */
  private handleTaskTimeout(taskId: string): void {
    console.error(`Task ${taskId} timed out`);
    this.runningTasks.delete(taskId);
  }

  /**
   * 获取优先级数值
   */
  private priorityValue(priority: string): number {
    const values: Record<string, number> = {
      'CRITICAL': 4,
      'HIGH': 3,
      'NORMAL': 2,
      'LOW': 1
    };
    return values[priority] || 0;
  }

  /**
   * 获取队列长度
   */
  getQueueLength(): number {
    return this.taskQueue.length;
  }

  /**
   * 获取运行中任务数
   */
  getRunningCount(): number {
    return this.runningTasks.size;
  }

  /**
   * 获取定时器数量（用于检测泄露）
   */
  getActiveTimerCount(): number {
    return this.runningTasks.size;
  }

  /**
   * 并行调度多个Agent执行任务
   */
  async scheduleParallel(agents: string[], context: any): Promise<any[]> {
    const promises = agents.map(agentId => {
      const taskId = this.submitTask({
        type: 'PARALLEL_EXECUTION',
        priority: TaskPriority.NORMAL,
        payload: context,
        agentId,
        timeout: 30000
      });
      
      return new Promise((resolve) => {
        // 模拟任务完成处理
        setTimeout(() => {
          resolve({ agentId, taskId, status: 'completed' });
        }, 100);
      });
    });
    
    return Promise.all(promises);
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
