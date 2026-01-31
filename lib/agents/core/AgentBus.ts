/* ==================================================
   Agent 通信总线
   Agent Communication Bus
   ================================================== */

import { v4 as uuidv4 } from 'uuid';
import { Message, MessageType } from './types';

/**
 * Agent 通信总线
 * 负责 Agent 之间的消息传递
 */
export class AgentBus {
  private agents: Map<string, any> = new Map(); // Agent ID -> Agent
  private messageHistory: Message[] = [];
  private subscriptions: Map<string, Set<string>> = new Map(); // Agent ID -> Topics
  
  /**
   * 注册 Agent
   */
  public register(agent: any): void {
    this.agents.set(agent.id, agent);
    console.log(`[AgentBus] Agent 注册: ${agent.name} (${agent.id})`);
  }
  
  /**
   * 注销 Agent
   */
  public unregister(agentId: string): void {
    this.agents.delete(agentId);
    this.subscriptions.delete(agentId);
    console.log(`[AgentBus] Agent 注销: ${agentId}`);
  }
  
  /**
   * 获取 Agent
   */
  public getAgent(agentId: string): any | undefined {
    return this.agents.get(agentId);
  }
  
  /**
   * 获取所有 Agent
   */
  public getAllAgents(): any[] {
    return Array.from(this.agents.values());
  }
  
  /**
   * 发送消息（点对点）
   */
  public async send(from: string, to: string, message: Message): Promise<void> {
    // 记录消息历史
    this.messageHistory.push(message);
    
    // 查找接收者
    const toAgent = this.agents.get(to);
    if (!toAgent) {
      console.warn(`[AgentBus] Agent 不存在: ${to}`);
      return;
    }
    
    // 发送消息
    await toAgent.receiveMessage(message);
    
    console.log(`[AgentBus] 消息发送: ${from} -> ${to} (${message.type})`);
  }
  
  /**
   * 广播消息（发送给所有 Agent）
   */
  public async broadcast(from: string, message: Omit<Message, 'id' | 'from' | 'timestamp' | 'to'>): Promise<void> {
    const fullMessage: Message = {
      id: uuidv4(),
      from,
      to: 'broadcast',
      ...message,
      timestamp: new Date(),
    };
    
    // 记录消息历史
    this.messageHistory.push(fullMessage);
    
    // 发送给所有 Agent（除了发送者）
    for (const [agentId, agent] of this.agents) {
      if (agentId !== from) {
        await agent.receiveMessage(fullMessage);
      }
    }
    
    console.log(`[AgentBus] 广播消息: ${from} -> all (${message.type})`);
  }
  
  /**
   * 订阅主题
   */
  public subscribe(agentId: string, topic: string): void {
    if (!this.subscriptions.has(agentId)) {
      this.subscriptions.set(agentId, new Set());
    }
    this.subscriptions.get(agentId)!.add(topic);
    console.log(`[AgentBus] Agent ${agentId} 订阅主题: ${topic}`);
  }
  
  /**
   * 取消订阅
   */
  public unsubscribe(agentId: string, topic: string): void {
    const topics = this.subscriptions.get(agentId);
    if (topics) {
      topics.delete(topic);
      console.log(`[AgentBus] Agent ${agentId} 取消订阅: ${topic}`);
    }
  }
  
  /**
   * 发布主题消息
   */
  public async publish(topic: string, message: Omit<Message, 'id' | 'from' | 'timestamp' | 'to'>): Promise<void> {
    // 找到订阅该主题的所有 Agent
    for (const [agentId, agent] of this.agents) {
      const topics = this.subscriptions.get(agentId);
      if (topics && topics.has(topic)) {
        const fullMessage: Message = {
          id: uuidv4(),
          from: 'system',
          to: agentId,
          ...message,
          timestamp: new Date(),
        };
        
        await agent.receiveMessage(fullMessage);
      }
    }
    
    console.log(`[AgentBus] 发布主题: ${topic}`);
  }
  
  /**
   * 获取消息历史
   */
  public getMessageHistory(): Message[] {
    return this.messageHistory;
  }
  
  /**
   * 获取指定 Agent 的消息历史
   */
  public getMessageHistoryForAgent(agentId: string): Message[] {
    return this.messageHistory.filter(m => m.from === agentId || m.to === agentId);
  }
  
  /**
   * 清理消息历史
   */
  public clearMessageHistory(): void {
    this.messageHistory = [];
  }
  
  /**
   * 获取统计信息
   */
  public getStats() {
    return {
      agentCount: this.agents.size,
      messageCount: this.messageHistory.length,
      subscriptions: Array.from(this.subscriptions.entries()).map(([agentId, topics]) => ({
        agentId,
        topics: Array.from(topics),
      })),
    };
  }
}
