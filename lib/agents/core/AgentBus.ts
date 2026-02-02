/**
 * AgentBus - 优化版
 * 
 * 优化内容：
 * 1. 基于内容签名的去重逻辑 + LRU缓存 + TTL机制
 * 2. 内存泄漏修复 - 完整的监听器清理
 * 3. 异步broadcast防止阻塞主线程
 * 4. 异常隔离 - 单个listener失败不影响其他
 * 5. 线程安全 - 消息队列机制
 */

import { EventEmitter } from 'events';
import { createHash } from 'crypto';

// ==================== 类型定义 ====================

export interface AgentMessage {
  id?: string;
  from: string;
  to?: string; // broadcast时可选
  type: string;
  payload: any;
  timestamp?: number;
  signature?: string; // 内容签名
}

export interface Agent {
  id: string;
  name: string;
  handler?: (message: AgentMessage) => void;
}

export interface AgentBusOptions {
  deduplicateWindow?: number;    // 去重窗口时间(ms)，默认5000ms
  maxCacheSize?: number;         // LRU缓存最大大小，默认10000
  asyncBroadcast?: boolean;      // 是否异步broadcast，默认true
  enableTTL?: boolean;           // 是否启用TTL，默认true
  defaultTTL?: number;           // 默认TTL(ms)，默认30000ms
}

interface LRUCacheEntry {
  signature: string;
  timestamp: number;
  ttl: number;
}

// ==================== LRU缓存实现 ====================

class LRUCache<T> {
  private cache: Map<string, T>;
  private maxSize: number;

  constructor(maxSize: number) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: string): T | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // 移动到末尾（最近使用）
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: string, value: T): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // 删除最旧的条目
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // 清理过期条目
  cleanup(predicate: (value: T) => boolean): number {
    let cleaned = 0;
    for (const [key, value] of this.cache.entries()) {
      if (predicate(value)) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    return cleaned;
  }
}

// ==================== 消息队列（线程安全） ====================

class MessageQueue {
  private queue: AgentMessage[] = [];
  private processing = false;
  private processor: (msg: AgentMessage) => Promise<void>;

  constructor(processor: (msg: AgentMessage) => Promise<void>) {
    this.processor = processor;
  }

  enqueue(message: AgentMessage): void {
    this.queue.push(message);
    if (!this.processing) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    this.processing = true;
    
    while (this.queue.length > 0) {
      const message = this.queue.shift();
      if (message) {
        try {
          await this.processor(message);
        } catch (error) {
          console.error('[AgentBus] Message processing error:', error);
        }
      }
    }
    
    this.processing = false;
  }

  clear(): void {
    this.queue = [];
  }

  size(): number {
    return this.queue.length;
  }
}

// ==================== AgentBus主类 ====================

export class AgentBus extends EventEmitter {
  private agents: Map<string, Agent> = new Map();
  private messageCache: LRUCache<LRUCacheEntry>;
  private options: Required<AgentBusOptions>;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;
  private messageQueue: MessageQueue;
  private stats = {
    messagesSent: 0,
    messagesDropped: 0,
    errorsCaught: 0,
    cacheHits: 0,
    cacheMisses: 0,
  };

  constructor(options: AgentBusOptions = {}) {
    super();
    
    this.options = {
      deduplicateWindow: options.deduplicateWindow ?? 5000,
      maxCacheSize: options.maxCacheSize ?? 10000,
      asyncBroadcast: options.asyncBroadcast ?? true,
      enableTTL: options.enableTTL ?? true,
      defaultTTL: options.defaultTTL ?? 30000,
    };

    // 初始化LRU缓存
    this.messageCache = new LRUCache<LRUCacheEntry>(this.options.maxCacheSize);

    // 初始化消息队列
    this.messageQueue = new MessageQueue(this.processMessage.bind(this));

    // 启动定期清理
    this.startCleanupInterval();

    // 设置最大监听器数量（防止内存警告）
    this.setMaxListeners(100);
  }

  // ==================== 核心方法 ====================

  /**
   * 注册Agent
   */
  register(agent: Agent): boolean {
    if (this.agents.has(agent.id)) {
      console.warn(`[AgentBus] Agent ${agent.id} already registered`);
      return false;
    }

    this.agents.set(agent.id, agent);
    
    // 注册监听器（如果提供了handler）
    if (agent.handler) {
      const eventName = `msg:${agent.id}`;
      this.on(eventName, agent.handler);
    }

    this.emit('agent:registered', agent.id);
    return true;
  }

  /**
   * 注销Agent（修复内存泄漏）
   */
  unregister(agentId: string): boolean {
    const agent = this.agents.get(agentId);
    if (!agent) {
      return false;
    }

    // 移除特定监听器
    if (agent.handler) {
      const eventName = `msg:${agentId}`;
      this.removeListener(eventName, agent.handler);
    }

    // 清理Agent相关的事件监听器
    this.removeAllListeners(`msg:${agentId}`);
    this.removeAllListeners(`ack:${agentId}`);

    this.agents.delete(agentId);
    this.emit('agent:unregistered', agentId);
    return true;
  }

  /**
   * 发送消息（点对点）
   */
  async send(message: Required<Pick<AgentMessage, 'to'>> & AgentMessage): Promise<boolean> {
    // 生成内容签名用于去重
    const signature = this.generateSignature(message);
    
    // 检查重复
    if (this.isDuplicate(signature)) {
      this.stats.messagesDropped++;
      this.stats.cacheHits++;
      return false;
    }

    // 添加到缓存
    this.addToCache(signature);
    this.stats.cacheMisses++;

    // 填充元数据
    const enrichedMessage: AgentMessage = {
      ...message,
      id: message.id || this.generateId(),
      timestamp: Date.now(),
      signature,
    };

    // 目标Agent是否存在
    const targetAgent = this.agents.get(message.to);
    if (!targetAgent) {
      console.warn(`[AgentBus] Target agent ${message.to} not found`);
      return false;
    }

    // 异步发送
    if (this.options.asyncBroadcast) {
      this.messageQueue.enqueue(enrichedMessage);
      return true;
    }

    // 同步发送
    await this.deliverMessage(enrichedMessage);
    return true;
  }

  /**
   * 广播消息（性能优化：异步执行）
   */
  async broadcast(message: AgentMessage, excludeSelf = true): Promise<number> {
    const signature = this.generateSignature(message);
    
    if (this.isDuplicate(signature)) {
      this.stats.messagesDropped++;
      this.stats.cacheHits++;
      return 0;
    }

    this.addToCache(signature);
    this.stats.cacheMisses++;

    const enrichedMessage: AgentMessage = {
      ...message,
      id: message.id || this.generateId(),
      timestamp: Date.now(),
      signature,
    };

    const agents = Array.from(this.agents.values()).filter(
      agent => !excludeSelf || agent.id !== message.from
    );

    if (this.options.asyncBroadcast) {
      // 异步执行防止阻塞主线程
      setImmediate(() => {
        this.executeBroadcast(enrichedMessage, agents);
      });
    } else {
      await this.executeBroadcast(enrichedMessage, agents);
    }

    return agents.length;
  }

  /**
   * 执行广播（异常隔离）
   */
  private async executeBroadcast(
    message: AgentMessage, 
    agents: Agent[]
  ): Promise<void> {
    const promises = agents.map(async (agent) => {
      try {
        await this.deliverMessage({
          ...message,
          to: agent.id,
        });
      } catch (error) {
        // 异常隔离：单个失败不影响其他
        this.stats.errorsCaught++;
        console.error(`[AgentBus] Error delivering to ${agent.id}:`, error);
        this.emit('error', { agentId: agent.id, error, message });
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * 投递消息（带异常隔离）
   */
  private async deliverMessage(message: AgentMessage): Promise<void> {
    if (!message.to) return;
    const agent = this.agents.get(message.to);
    if (!agent) return;

    this.stats.messagesSent++;

    // 异常隔离
    try {
      // 触发事件
      this.emit(`msg:${message.to}`, message);
      
      // 调用handler（如果存在）
      if (agent.handler) {
        await Promise.resolve(agent.handler(message));
      }

      this.emit('message:delivered', message);
    } catch (error) {
      this.stats.errorsCaught++;
      console.error(`[AgentBus] Handler error for ${message.to}:`, error);
      this.emit('error', { agentId: message.to, error, message });
    }
  }

  /**
   * 处理队列中的消息
   */
  private async processMessage(message: AgentMessage): Promise<void> {
    await this.deliverMessage(message);
  }

  // ==================== 去重逻辑 ====================

  /**
   * 生成内容签名（基于from+to+type+payload）
   */
  private generateSignature(message: AgentMessage): string {
    const content = `${message.from}:${message.to}:${message.type}:${JSON.stringify(message.payload)}`;
    return createHash('md5').update(content).digest('hex');
  }

  /**
   * 检查是否是重复消息
   */
  private isDuplicate(signature: string): boolean {
    const entry = this.messageCache.get(signature);
    if (!entry) return false;

    // 检查TTL
    if (this.options.enableTTL) {
      const now = Date.now();
      if (now - entry.timestamp > entry.ttl) {
        // 过期，删除
        this.messageCache.delete(signature);
        return false;
      }
    }

    return true;
  }

  /**
   * 添加到缓存
   */
  private addToCache(signature: string): void {
    this.messageCache.set(signature, {
      signature,
      timestamp: Date.now(),
      ttl: this.options.defaultTTL,
    });
  }

  // ==================== 清理机制 ====================

  /**
   * 启动定期清理
   */
  private startCleanupInterval(): void {
    if (!this.options.enableTTL) return;

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.options.deduplicateWindow);

    // 确保interval不阻塞程序退出
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * 清理过期缓存
   */
  private cleanup(): number {
    if (!this.options.enableTTL) return 0;

    const now = Date.now();
    const cleaned = this.messageCache.cleanup(
      entry => now - entry.timestamp > entry.ttl
    );

    if (cleaned > 0) {
      this.emit('cache:cleanup', { removed: cleaned, remaining: this.messageCache.size() });
    }

    return cleaned;
  }

  // ==================== 工具方法 ====================

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取Agent
   */
  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * 获取所有Agent
   */
  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * 检查Agent是否存在
   */
  hasAgent(agentId: string): boolean {
    return this.agents.has(agentId);
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      ...this.stats,
      cacheSize: this.messageCache.size(),
      agentCount: this.agents.size,
      queueSize: this.messageQueue.size(),
    };
  }

  /**
   * 重置统计
   */
  resetStats(): void {
    this.stats = {
      messagesSent: 0,
      messagesDropped: 0,
      errorsCaught: 0,
      cacheHits: 0,
      cacheMisses: 0,
    };
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.messageCache.clear();
    this.emit('cache:cleared');
  }

  /**
   * 销毁（彻底清理）
   */
  destroy(): void {
    // 停止清理定时器
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    // 清理消息队列
    this.messageQueue.clear();

    // 注销所有Agent（触发监听器清理）
    const agentIds = Array.from(this.agents.keys());
    agentIds.forEach(id => this.unregister(id));

    // 移除所有监听器
    this.removeAllListeners();

    // 清空缓存
    this.clearCache();

    this.emit('destroyed');
  }
}

// ==================== 默认导出 ====================

export default AgentBus;
