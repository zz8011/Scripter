/* ==================================================
   Agent 基类
   Agent Base Class
   ================================================== */

import { v4 as uuidv4 } from 'uuid';
import {
  AgentRole,
  AgentState,
  Personality,
  Message,
  MessageType,
  Thought,
  Action,
  Feedback,
  Context,
  Skill,
} from './types';

/**
 * Agent 基类
 * 所有 Agent 都继承此类
 */
export abstract class Agent {
  // 基本信息
  public readonly id: string;
  public readonly name: string;
  public readonly role: AgentRole;
  public readonly personality: Personality;
  
  // 状态
  protected state: AgentState = AgentState.IDLE;
  protected skills: Map<string, Skill> = new Map();
  protected messageQueue: Message[] = [];
  protected thinkingHistory: Thought[] = [];
  protected actionHistory: Action[] = [];
  protected feedbackHistory: Feedback[] = [];
  
  // 依赖
  protected agentBus: any; // AgentBus，避免循环依赖
  
  /**
   * 构造函数
   */
  constructor(
    name: string,
    role: AgentRole,
    personality: Personality,
    agentBus: any
  ) {
    this.id = uuidv4();
    this.name = name;
    this.role = role;
    this.personality = personality;
    this.agentBus = agentBus;
  }
  
  /**
   * 注册技能
   */
  public registerSkill(skill: Skill): void {
    this.skills.set(skill.id, skill);
  }
  
  /**
   * 注销技能
   */
  public unregisterSkill(skillId: string): void {
    this.skills.delete(skillId);
  }
  
  /**
   * 获取技能
   */
  public getSkill(skillId: string): Skill | undefined {
    return this.skills.get(skillId);
  }
  
  /**
   * 获取所有技能
   */
  public getAllSkills(): Skill[] {
    return Array.from(this.skills.values());
  }
  
  /**
   * 获取状态
   */
  public getState(): AgentState {
    return this.state;
  }
  
  /**
   * 设置状态
   */
  protected setState(state: AgentState): void {
    this.state = state;
  }
  
  /**
   * 核心能力：思考
   * Agent 根据上下文进行分析和思考
   */
  public abstract think(context: Context): Promise<Thought>;
  
  /**
   * 核心能力：行动
   * Agent 根据思考结果执行行动
   */
  public abstract act(context: Context, thought: Thought): Promise<Action>;
  
  /**
   * 核心能力：学习
   * Agent 根据反馈进行学习
   */
  public abstract learn(feedback: Feedback): Promise<void>;
  
  /**
   * 发送消息
   */
  public async sendMessage(to: string, message: Omit<Message, 'id' | 'from' | 'timestamp'>): Promise<void> {
    const fullMessage: Message = {
      id: uuidv4(),
      from: this.id,
      to,
      type: message.type,
      content: message.content,
      timestamp: new Date(),
      metadata: message.metadata,
    };
    
    await this.agentBus.send(this.id, to, fullMessage);
  }
  
  /**
   * 接收消息
   */
  public async receiveMessage(message: Message): Promise<void> {
    this.messageQueue.push(message);
    
    // 如果需要响应，自动处理
    if (message.metadata?.requiresResponse) {
      await this.handleMessage(message);
    }
  }
  
  /**
   * 处理消息
   */
  protected async handleMessage(message: Message): Promise<void> {
    // 子类可以重写此方法
    console.log(`[${this.name}] 收到消息: ${message.type}`);
  }
  
  /**
   * 处理消息队列
   */
  public async processMessageQueue(): Promise<void> {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        await this.handleMessage(message);
      }
    }
  }
  
  /**
   * 执行技能
   */
  public async executeSkill(skillId: string, context: Context, input: any): Promise<any> {
    const skill = this.skills.get(skillId);
    if (!skill) {
      throw new Error(`Skill not found: ${skillId}`);
    }
    
    return await skill.execute(context, input);
  }
  
  /**
   * 获取思考历史
   */
  public getThinkingHistory(): Thought[] {
    return this.thinkingHistory;
  }
  
  /**
   * 获取行动历史
   */
  public getActionHistory(): Action[] {
    return this.actionHistory;
  }
  
  /**
   * 获取反馈历史
   */
  public getFeedbackHistory(): Feedback[] {
    return this.feedbackHistory;
  }
  
  /**
   * 清理历史
   */
  public clearHistory(): void {
    this.thinkingHistory = [];
    this.actionHistory = [];
    this.feedbackHistory = [];
  }
  
  /**
   * 自我演化
   * Agent 根据历史反馈进行自我优化
   */
  public async evolve(): Promise<void> {
    // 默认实现：分析反馈历史，调整个性参数
    const positiveFeedbacks = this.feedbackHistory.filter(f => f.type === 'positive');
    const negativeFeedbacks = this.feedbackHistory.filter(f => f.type === 'negative');
    
    // 如果负面反馈多，变得更谨慎
    if (negativeFeedbacks.length > positiveFeedbacks.length * 2) {
      this.personality.decisionStyle.cautious = Math.min(1, this.personality.decisionStyle.cautious + 0.1);
      this.personality.decisionStyle.creative = Math.max(0, this.personality.decisionStyle.creative - 0.05);
    }
    
    // 如果正面反馈多，变得更有创造性
    if (positiveFeedbacks.length > negativeFeedbacks.length * 2) {
      this.personality.decisionStyle.creative = Math.min(1, this.personality.decisionStyle.creative + 0.1);
      this.personality.decisionStyle.cautious = Math.max(0, this.personality.decisionStyle.cautious - 0.05);
    }
    
    console.log(`[${this.name}] 自我演化完成`, this.personality);
  }
  
  /**
   * 获取描述
   */
  public getDescription(): string {
    return `${this.name} (${this.role}) - ${this.state}`;
  }
}
