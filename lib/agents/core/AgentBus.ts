/**
 * AgentBus - Agent 间消息总线
 * 负责 Agent 之间的消息传递和通信协调
 */

export interface Message {
  id: string;
  from: string;
  to: string | string[] | 'broadcast';
  type: MessageType;
  payload: unknown;
  timestamp: number;
  correlationId?: string;
  priority?: MessagePriority;
}

export enum MessageType {
  TASK = 'task',
  RESPONSE = 'response',
  EVENT = 'event',
  ERROR = 'error',
  HEARTBEAT = 'heartbeat',
  CONTROL = 'control',
}

export enum MessagePriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  CRITICAL = 4,
}

export interface AgentRegistration {
  id: string;
  name: string;
  capabilities: string[];
  maxConcurrentTasks: number;
  metadata?: Record<string, unknown>;
}

type MessageHandler = (message: Message) => void | Promise<void>;
type FilterPredicate = (message: Message) => boolean;

interface Subscription {
  id: string;
  agentId: string;
  handler: MessageHandler;
  filter?: FilterPredicate;
}

export class AgentBus {
  private agents: Map<string, AgentRegistration> = new Map();
  private subscriptions: Map<string, Subscription[]> = new Map();
  private messageQueue: Message[] = [];
  private readonly maxQueueSize: number;
  private readonly maxAgents: number;
  private messageHistory: Message[] = [];
  private readonly maxHistorySize: number;
  private isProcessing: boolean = false;

  constructor(options: { maxQueueSize?: number; maxAgents?: number; maxHistorySize?: number } = {}) {
    this.maxQueueSize = options.maxQueueSize ?? 1000;
    this.maxAgents = options.maxAgents ?? 5;
    this.maxHistorySize = options.maxHistorySize ?? 100;
  }

  /**
   * 注册 Agent 到总线
   */
  registerAgent(agent: AgentRegistration): boolean {
    if (this.agents.size >= this.maxAgents && !this.agents.has(agent.id)) {
      throw new Error(`Maximum number of agents (${this.maxAgents}) reached`);
    }

    if (this.agents.has(agent.id)) {
      console.warn(`Agent ${agent.id} is already registered, updating registration`);
    }

    this.agents.set(agent.id, agent);
    this.subscriptions.set(agent.id, []);
    console.log(`Agent registered: ${agent.name} (${agent.id})`);
    return true;
  }

  /**
   * 注销 Agent
   */
  unregisterAgent(agentId: string): boolean {
    if (!this.agents.has(agentId)) {
      return false;
    }

    this.agents.delete(agentId);
    this.subscriptions.delete(agentId);
    console.log(`Agent unregistered: ${agentId}`);
    return true;
  }

  /**
   * 订阅消息
   */
  subscribe(
    agentId: string,
    handler: MessageHandler,
    filter?: FilterPredicate
  ): string {
    if (!this.agents.has(agentId)) {
      throw new Error(`Agent ${agentId} is not registered`);
    }

    const subscriptionId = this.generateId();
    const subscription: Subscription = {
      id: subscriptionId,
      agentId,
      handler,
      filter,
    };

    const subs = this.subscriptions.get(agentId) || [];
    subs.push(subscription);
    this.subscriptions.set(agentId, subs);

    return subscriptionId;
  }

  /**
   * 取消订阅
   */
  unsubscribe(agentId: string, subscriptionId: string): boolean {
    const subs = this.subscriptions.get(agentId);
    if (!subs) return false;

    const index = subs.findIndex((s) => s.id === subscriptionId);
    if (index === -1) return false;

    subs.splice(index, 1);
    return true;
  }

  /**
   * 发送消息
   */
  async send(message: Omit<Message, 'id' | 'timestamp'>): Promise<string> {
    const fullMessage: Message = {
      ...message,
      id: this.generateId(),
      timestamp: Date.now(),
    };

    // 检查队列容量
    if (this.messageQueue.length >= this.maxQueueSize) {
      throw new Error('Message queue is full');
    }

    this.messageQueue.push(fullMessage);
    this.addToHistory(fullMessage);

    // 立即处理高优先级消息
    if (fullMessage.priority === MessagePriority.CRITICAL) {
      await this.processMessage(fullMessage);
    }

    // 启动消息处理循环
    if (!this.isProcessing) {
      this.startProcessing();
    }

    return fullMessage.id;
  }

  /**
   * 广播消息给所有 Agent
   */
  async broadcast(
    from: string,
    type: MessageType,
    payload: unknown,
    options: { priority?: MessagePriority; correlationId?: string } = {}
  ): Promise<string> {
    return this.send({
      from,
      to: 'broadcast',
      type,
      payload,
      priority: options.priority ?? MessagePriority.NORMAL,
      correlationId: options.correlationId,
    });
  }

  /**
   * 获取已注册的 Agent 列表
   */
  getAgents(): AgentRegistration[] {
    return Array.from(this.agents.values());
  }

  /**
   * 获取特定 Agent 信息
   */
  getAgent(agentId: string): AgentRegistration | undefined {
    return this.agents.get(agentId);
  }

  /**
   * 获取消息历史
   */
  getMessageHistory(limit?: number): Message[] {
    const history = [...this.messageHistory];
    if (limit) {
      return history.slice(-limit);
    }
    return history;
  }

  /**
   * 获取队列状态
   */
  getQueueStatus(): { size: number; maxSize: number; isProcessing: boolean } {
    return {
      size: this.messageQueue.length,
      maxSize: this.maxQueueSize,
      isProcessing: this.isProcessing,
    };
  }

  /**
   * 清空消息队列
   */
  clearQueue(): void {
    this.messageQueue = [];
    console.log('Message queue cleared');
  }

  /**
   * 清空历史记录
   */
  clearHistory(): void {
    this.messageHistory = [];
    console.log('Message history cleared');
  }

  private async startProcessing(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      while (this.messageQueue.length > 0) {
        // 按优先级排序
        this.messageQueue.sort((a, b) => (b.priority ?? 2) - (a.priority ?? 2));
        
        const message = this.messageQueue.shift();
        if (message) {
          await this.processMessage(message);
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async processMessage(message: Message): Promise<void> {
    const targets = this.resolveTargets(message);

    for (const agentId of targets) {
      const subs = this.subscriptions.get(agentId) || [];
      
      for (const sub of subs) {
        try {
          // 应用过滤器
          if (sub.filter && !sub.filter(message)) {
            continue;
          }

          await sub.handler(message);
        } catch (error) {
          console.error(`Error handling message in agent ${agentId}:`, error);
          
          // 发送错误消息给发送方
          await this.send({
            from: 'system',
            to: message.from,
            type: MessageType.ERROR,
            payload: {
              originalMessageId: message.id,
              error: error instanceof Error ? error.message : String(error),
              agentId,
            },
            priority: MessagePriority.HIGH,
            correlationId: message.correlationId,
          });
        }
      }
    }
  }

  private resolveTargets(message: Message): string[] {
    if (message.to === 'broadcast') {
      // 广播给所有 Agent（除了发送者）
      return Array.from(this.agents.keys()).filter((id) => id !== message.from);
    }

    if (Array.isArray(message.to)) {
      return message.to.filter((id) => this.agents.has(id));
    }

    if (this.agents.has(message.to)) {
      return [message.to];
    }

    return [];
  }

  private addToHistory(message: Message): void {
    this.messageHistory.push(message);
    if (this.messageHistory.length > this.maxHistorySize) {
      this.messageHistory.shift();
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 导出单例实例
export const agentBus = new AgentBus();
