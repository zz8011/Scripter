/**
 * AgentScheduler - 任务调度器
 * 负责任务的调度、分配和状态管理
 */

import { AgentBus, Message, MessageType, MessagePriority } from './AgentBus';

export enum TaskStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  TIMEOUT = 'timeout',
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  agentId?: string;
  status: TaskStatus;
  priority: TaskPriority;
  payload: unknown;
  createdAt: number;
  scheduledAt?: number;
  startedAt?: number;
  completedAt?: number;
  result?: unknown;
  error?: string;
  retryCount: number;
  maxRetries: number;
  timeout: number;
  dependencies: string[];
  tags: string[];
  metadata?: Record<string, unknown>;
}

export enum TaskPriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  CRITICAL = 4,
}

export interface ScheduleOptions {
  priority?: TaskPriority;
  agentId?: string;
  delay?: number;
  timeout?: number;
  maxRetries?: number;
  dependencies?: string[];
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface AgentCapacity {
  agentId: string;
  maxConcurrent: number;
  currentTasks: number;
  availableSlots: number;
}

type TaskHandler = (task: Task) => Promise<unknown>;
type TaskStatusCallback = (task: Task, oldStatus: TaskStatus) => void;

export class AgentScheduler {
  private tasks: Map<string, Task> = new Map();
  private taskQueue: string[] = [];
  private runningTasks: Map<string, string> = new Map(); // agentId -> taskId
  private handlers: Map<string, TaskHandler> = new Map();
  private statusCallbacks: TaskStatusCallback[] = [];
  private agentBus: AgentBus;
  private readonly maxConcurrentTasks: number;
  private readonly defaultTimeout: number;
  private readonly maxRetries: number;
  private isRunning: boolean = false;
  private checkInterval?: ReturnType<typeof setInterval>;

  constructor(
    agentBus: AgentBus,
    options: {
      maxConcurrentTasks?: number;
      defaultTimeout?: number;
      maxRetries?: number;
      checkIntervalMs?: number;
    } = {}
  ) {
    this.agentBus = agentBus;
    this.maxConcurrentTasks = options.maxConcurrentTasks ?? 5;
    this.defaultTimeout = options.defaultTimeout ?? 30000; // 30秒
    this.maxRetries = options.maxRetries ?? 3;

    // 启动调度循环
    const intervalMs = options.checkIntervalMs ?? 1000;
    this.checkInterval = setInterval(() => this.scheduleLoop(), intervalMs);

    // 监听任务完成消息
    this.agentBus.subscribe('scheduler', async (message) => {
      if (message.type === MessageType.RESPONSE) {
        await this.handleTaskResponse(message);
      }
    });
  }

  /**
   * 注册任务处理器
   */
  registerHandler(taskType: string, handler: TaskHandler): void {
    this.handlers.set(taskType, handler);
  }

  /**
   * 注销任务处理器
   */
  unregisterHandler(taskType: string): boolean {
    return this.handlers.delete(taskType);
  }

  /**
   * 提交任务
   */
  async submit(
    name: string,
    payload: unknown,
    options: ScheduleOptions = {}
  ): Promise<Task> {
    const task: Task = {
      id: this.generateId(),
      name,
      description: options.metadata?.description as string,
      agentId: options.agentId,
      status: TaskStatus.PENDING,
      priority: options.priority ?? TaskPriority.NORMAL,
      payload,
      createdAt: Date.now(),
      retryCount: 0,
      maxRetries: options.maxRetries ?? this.maxRetries,
      timeout: options.timeout ?? this.defaultTimeout,
      dependencies: options.dependencies ?? [],
      tags: options.tags ?? [],
      metadata: options.metadata,
    };

    // 检查依赖任务是否完成
    const unresolvedDeps = task.dependencies.filter(
      (depId) => !this.isTaskCompleted(depId)
    );

    if (unresolvedDeps.length > 0) {
      task.status = TaskStatus.PENDING;
      console.log(`Task ${task.id} waiting for dependencies: ${unresolvedDeps.join(', ')}`);
    } else {
      task.status = TaskStatus.SCHEDULED;
      task.scheduledAt = Date.now();
      this.enqueueTask(task);
    }

    this.tasks.set(task.id, task);
    this.notifyStatusChange(task, TaskStatus.PENDING);

    // 如果有延迟，设置定时调度
    if (options.delay && options.delay > 0) {
      setTimeout(() => {
        this.enqueueTask(task);
      }, options.delay);
    }

    return task;
  }

  /**
   * 取消任务
   */
  async cancel(taskId: string): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    if (task.status === TaskStatus.RUNNING) {
      // 发送取消消息
      if (task.agentId) {
        await this.agentBus.send({
          from: 'scheduler',
          to: task.agentId,
          type: MessageType.CONTROL,
          payload: { action: 'cancel', taskId },
          priority: MessagePriority.HIGH,
        });
      }
    }

    this.updateTaskStatus(task, TaskStatus.CANCELLED);
    this.removeFromQueue(taskId);
    return true;
  }

  /**
   * 获取任务状态
   */
  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * 获取所有任务
   */
  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  /**
   * 获取指定状态的任务
   */
  getTasksByStatus(status: TaskStatus): Task[] {
    return this.getAllTasks().filter((t) => t.status === status);
  }

  /**
   * 获取 Agent 容量信息
   */
  getAgentCapacities(): AgentCapacity[] {
    const agents = this.agentBus.getAgents();
    return agents.map((agent) => {
      const currentTasks = this.getAgentCurrentTasks(agent.id).length;
      return {
        agentId: agent.id,
        maxConcurrent: agent.maxConcurrentTasks,
        currentTasks,
        availableSlots: agent.maxConcurrentTasks - currentTasks,
      };
    });
  }

  /**
   * 订阅任务状态变化
   */
  onStatusChange(callback: TaskStatusCallback): () => void {
    this.statusCallbacks.push(callback);
    return () => {
      const index = this.statusCallbacks.indexOf(callback);
      if (index > -1) {
        this.statusCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * 启动调度器
   */
  start(): void {
    this.isRunning = true;
    console.log('AgentScheduler started');
  }

  /**
   * 停止调度器
   */
  stop(): void {
    this.isRunning = false;
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    console.log('AgentScheduler stopped');
  }

  /**
   * 获取调度器统计信息
   */
  getStats(): {
    total: number;
    pending: number;
    scheduled: number;
    running: number;
    completed: number;
    failed: number;
    cancelled: number;
  } {
    const all = this.getAllTasks();
    return {
      total: all.length,
      pending: all.filter((t) => t.status === TaskStatus.PENDING).length,
      scheduled: all.filter((t) => t.status === TaskStatus.SCHEDULED).length,
      running: all.filter((t) => t.status === TaskStatus.RUNNING).length,
      completed: all.filter((t) => t.status === TaskStatus.COMPLETED).length,
      failed: all.filter((t) => t.status === TaskStatus.FAILED).length,
      cancelled: all.filter((t) => t.status === TaskStatus.CANCELLED).length,
    };
  }

  private enqueueTask(task: Task): void {
    // 按优先级插入队列
    const insertIndex = this.taskQueue.findIndex((id) => {
      const t = this.tasks.get(id);
      return t && t.priority < task.priority;
    });

    if (insertIndex === -1) {
      this.taskQueue.push(task.id);
    } else {
      this.taskQueue.splice(insertIndex, 0, task.id);
    }
  }

  private removeFromQueue(taskId: string): void {
    const index = this.taskQueue.indexOf(taskId);
    if (index > -1) {
      this.taskQueue.splice(index, 1);
    }
  }

  private async scheduleLoop(): Promise<void> {
    if (!this.isRunning) return;

    // 检查依赖任务
    this.checkDependencies();

    // 分配任务
    while (this.taskQueue.length > 0) {
      const taskId = this.taskQueue[0];
      const task = this.tasks.get(taskId);

      if (!task || task.status !== TaskStatus.SCHEDULED) {
        this.taskQueue.shift();
        continue;
      }

      const assigned = await this.assignTask(task);
      if (assigned) {
        this.taskQueue.shift();
      } else {
        // 没有可用 Agent，等待下次循环
        break;
      }
    }
  }

  private async assignTask(task: Task): Promise<boolean> {
    const capacities = this.getAgentCapacities();
    
    // 优先分配给指定 Agent
    if (task.agentId) {
      const capacity = capacities.find((c) => c.agentId === task.agentId);
      if (capacity && capacity.availableSlots > 0) {
        return this.executeTask(task, task.agentId);
      }
      return false;
    }

    // 选择负载最轻的 Agent
    const availableAgents = capacities
      .filter((c) => c.availableSlots > 0)
      .sort((a, b) => b.availableSlots - a.availableSlots);

    if (availableAgents.length === 0) {
      return false;
    }

    // 分配给第一个可用 Agent
    return this.executeTask(task, availableAgents[0].agentId);
  }

  private async executeTask(task: Task, agentId: string): Promise<boolean> {
    this.updateTaskStatus(task, TaskStatus.RUNNING);
    task.agentId = agentId;
    task.startedAt = Date.now();
    this.runningTasks.set(agentId, task.id);

    // 设置超时
    const timeoutId = setTimeout(() => {
      this.handleTimeout(task);
    }, task.timeout);

    try {
      // 发送任务消息给 Agent
      await this.agentBus.send({
        from: 'scheduler',
        to: agentId,
        type: MessageType.TASK,
        payload: {
          taskId: task.id,
          name: task.name,
          payload: task.payload,
        },
        priority: this.mapPriority(task.priority),
      });

      // 如果有本地处理器，也执行它
      const handler = this.handlers.get(task.name);
      if (handler) {
        const result = await handler(task);
        await this.completeTask(task, result);
      }

      return true;
    } catch (error) {
      clearTimeout(timeoutId);
      await this.handleTaskError(task, error);
      return false;
    }
  }

  private async handleTaskResponse(message: Message): Promise<void> {
    const { taskId, result, error } = message.payload as {
      taskId: string;
      result?: unknown;
      error?: string;
    };

    const task = this.tasks.get(taskId);
    if (!task) return;

    if (error) {
      await this.handleTaskError(task, new Error(error));
    } else {
      await this.completeTask(task, result);
    }
  }

  private async completeTask(task: Task, result: unknown): Promise<void> {
    task.result = result;
    task.completedAt = Date.now();
    this.updateTaskStatus(task, TaskStatus.COMPLETED);
    
    if (task.agentId) {
      this.runningTasks.delete(task.agentId);
    }

    console.log(`Task ${task.id} completed`);
  }

  private async handleTaskError(task: Task, error: unknown): Promise<void> {
    task.retryCount++;
    task.error = error instanceof Error ? error.message : String(error);

    if (task.retryCount <= task.maxRetries) {
      console.log(`Task ${task.id} failed, retrying (${task.retryCount}/${task.maxRetries})`);
      task.status = TaskStatus.SCHEDULED;
      task.scheduledAt = Date.now();
      this.enqueueTask(task);
    } else {
      this.updateTaskStatus(task, TaskStatus.FAILED);
      if (task.agentId) {
        this.runningTasks.delete(task.agentId);
      }
      console.error(`Task ${task.id} failed permanently:`, task.error);
    }
  }

  private handleTimeout(task: Task): void {
    if (task.status === TaskStatus.RUNNING) {
      console.warn(`Task ${task.id} timed out`);
      this.updateTaskStatus(task, TaskStatus.TIMEOUT);
      if (task.agentId) {
        this.runningTasks.delete(task.agentId);
      }
    }
  }

  private checkDependencies(): void {
    const pendingTasks = this.getTasksByStatus(TaskStatus.PENDING);
    
    for (const task of pendingTasks) {
      const unresolvedDeps = task.dependencies.filter(
        (depId) => !this.isTaskCompleted(depId)
      );

      if (unresolvedDeps.length === 0) {
        this.updateTaskStatus(task, TaskStatus.SCHEDULED);
        task.scheduledAt = Date.now();
        this.enqueueTask(task);
      }
    }
  }

  private isTaskCompleted(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    return task?.status === TaskStatus.COMPLETED;
  }

  private getAgentCurrentTasks(agentId: string): Task[] {
    return this.getAllTasks().filter(
      (t) => t.agentId === agentId && t.status === TaskStatus.RUNNING
    );
  }

  private updateTaskStatus(task: Task, newStatus: TaskStatus): void {
    const oldStatus = task.status;
    task.status = newStatus;
    this.notifyStatusChange(task, oldStatus);
  }

  private notifyStatusChange(task: Task, oldStatus: TaskStatus): void {
    for (const callback of this.statusCallbacks) {
      try {
        callback(task, oldStatus);
      } catch (error) {
        console.error('Error in status callback:', error);
      }
    }
  }

  private mapPriority(taskPriority: TaskPriority): MessagePriority {
    switch (taskPriority) {
      case TaskPriority.LOW:
        return MessagePriority.LOW;
      case TaskPriority.NORMAL:
        return MessagePriority.NORMAL;
      case TaskPriority.HIGH:
        return MessagePriority.HIGH;
      case TaskPriority.CRITICAL:
        return MessagePriority.CRITICAL;
      default:
        return MessagePriority.NORMAL;
    }
  }

  private generateId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
