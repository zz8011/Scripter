/**
 * AgentBus.ts - 消息总线，负责Agent间的消息传递
 */

import { EventEmitter } from 'events';

export interface AgentMessage {
  id: string;
  type: string;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  payload: any;
  from: string;
  to: string;
  timestamp: number;
}

export class AgentBus {
  private eventEmitter: EventEmitter;
  private agents: Map<string, any>;
  private messageHistory: Set<string>;
  private maxAgents: number;

  constructor(maxAgents: number = 100) {
    this.eventEmitter = new EventEmitter();
    this.agents = new Map();
    this.messageHistory = new Set();
    this.maxAgents = maxAgents;
  }

  /**
   * 注册Agent
   */
  register(agentId: string, agent: any): void {
    if (this.agents.has(agentId)) {
      throw new Error(`Agent ${agentId} already registered`);
    }
    if (this.agents.size >= this.maxAgents) {
      throw new Error(`Max agents limit (${this.maxAgents}) reached`);
    }
    this.agents.set(agentId, agent);
  }

  /**
   * 注销Agent
   */
  unregister(agentId: string): void {
    this.agents.delete(agentId);
  }

  /**
   * 订阅消息
   * 修复：允许未注册的agent订阅消息，但会发出警告
   * 这允许内部服务（如scheduler）在注册前先订阅
   */
  subscribe(agentId: string, callback: (message: AgentMessage) => void): void {
    // 修复：如果agent未注册，发出警告但不阻止订阅
    // 这对于内部服务（如scheduler）是必需的
    if (!this.agents.has(agentId)) {
      console.warn(`Agent ${agentId} subscribing before registration`);
    }
    this.eventEmitter.on(`message:${agentId}`, callback);
  }

  /**
   * 取消订阅
   */
  unsubscribe(agentId: string, callback: (message: AgentMessage) => void): void {
    this.eventEmitter.off(`message:${agentId}`, callback);
  }

  /**
   * 发送消息 - 问题2：签名可能需要调整
   */
  send(message: AgentMessage): void;
  send(to: string, type: string, payload: any): void;
  send(arg1: AgentMessage | string, arg2?: string, arg3?: any): void {
    let message: AgentMessage;
    
    if (typeof arg1 === 'string') {
      // 简化的send(to, type, payload) 形式
      message = {
        id: generateId(),
        type: arg2!,
        priority: 'NORMAL',
        payload: arg3,
        from: 'system',
        to: arg1,
        timestamp: Date.now()
      };
    } else {
      message = arg1;
    }

    // CRITICAL消息去重检查
    if (message.priority === 'CRITICAL') {
      if (this.messageHistory.has(message.id)) {
        console.log(`Duplicate CRITICAL message ignored: ${message.id}`);
        return;
      }
      this.messageHistory.add(message.id);
    }

    this.eventEmitter.emit(`message:${message.to}`, message);
  }

  /**
   * 广播消息
   */
  broadcast(message: Omit<AgentMessage, 'to'>): void {
    for (const agentId of this.agents.keys()) {
      this.send({ ...message, to: agentId });
    }
  }

  /**
   * 获取已注册Agent数量
   */
  getAgentCount(): number {
    return this.agents.size;
  }

  /**
   * 检查Agent是否注册
   */
  isRegistered(agentId: string): boolean {
    return this.agents.has(agentId);
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 导出单例
export const agentBus = new AgentBus();
