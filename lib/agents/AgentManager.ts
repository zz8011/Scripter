/* ==================================================
   Agent 管理器
   Agent Manager
   ================================================== */

import { AgentBus, AgentScheduler } from './core';
import { ScriptDoctorAgent, CharacterCoachAgent } from './agents';
import { AgentConfig, AgentRole, Personality } from './core/types';

/**
 * Agent 管理器
 * 负责 Agent 的初始化、注册和管理
 */
export class AgentManager {
  private static instance: AgentManager;
  private agentBus: AgentBus;
  private agentScheduler: AgentScheduler;
  private agents: Map<string, any> = new Map();
  
  private constructor() {
    this.agentBus = new AgentBus();
    this.agentScheduler = new AgentScheduler(this.agentBus);
  }
  
  /**
   * 获取单例
   */
  public static getInstance(): AgentManager {
    if (!AgentManager.instance) {
      AgentManager.instance = new AgentManager();
    }
    return AgentManager.instance;
  }
  
  /**
   * 初始化默认 Agent
   */
  public async initializeDefaultAgents(): Promise<void> {
    console.log('[AgentManager] 初始化默认 Agent...');
    
    // 创建剧本医生
    const scriptDoctor = new ScriptDoctorAgent(
      this.getDefaultPersonality('script-doctor'),
      this.agentBus
    );
    this.registerAgent(scriptDoctor);
    
    // 创建角色教练
    const characterCoach = new CharacterCoachAgent(
      this.getDefaultPersonality('character-coach'),
      this.agentBus
    );
    this.registerAgent(characterCoach);
    
    console.log('[AgentManager] 默认 Agent 初始化完成，共', this.agents.size, '个');
  }
  
  /**
   * 注册 Agent
   */
  public registerAgent(agent: any): void {
    this.agents.set(agent.id, agent);
    this.agentBus.register({
      id: agent.id,
      name: agent.name,
      handler: agent.receiveMessage?.bind(agent),
    });
    console.log('[AgentManager] Agent 注册:', agent.name);
  }

  /**
   * 注销 Agent
   */
  public unregisterAgent(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      this.agents.delete(agentId);
      this.agentBus.unregister(agentId);
      console.log('[AgentManager] Agent 注销:', agent.name);
    }
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
   * 按 Role 获取 Agent
   */
  public getAgentsByRole(role: AgentRole): any[] {
    return this.getAllAgents().filter(agent => agent.role === role);
  }
  
  /**
   * 获取 Agent Bus
   */
  public getAgentBus(): AgentBus {
    return this.agentBus;
  }
  
  /**
   * 获取 Agent Scheduler
   */
  public getAgentScheduler(): AgentScheduler {
    return this.agentScheduler;
  }
  
  /**
   * 获取统计信息
   */
  public getStats() {
    return {
      agentCount: this.agents.size,
      agents: Array.from(this.agents.values()).map(agent => ({
        id: agent.id,
        name: agent.name,
        role: agent.role,
        state: agent.getState(),
      })),
      busStats: this.agentBus.getStats(),
    };
  }
  
  /**
   * 获取默认个性配置
   */
  private getDefaultPersonality(type: 'script-doctor' | 'character-coach'): Personality {
    if (type === 'script-doctor') {
      return {
        element: 'metal',  // 金：严谨、精准
        speakingStyle: {
          formal: 0.8,
          humorous: 0.2,
          direct: 0.9,
          poetic: 0.1,
        },
        decisionStyle: {
          cautious: 0.8,
          creative: 0.3,
          analytical: 0.9,
        },
        motto: '结构即命运，节奏即生命',
      };
    }
    
    if (type === 'character-coach') {
      return {
        element: 'water',  // 水：灵活、深邃
        speakingStyle: {
          formal: 0.4,
          humorous: 0.6,
          direct: 0.6,
          poetic: 0.7,
        },
        decisionStyle: {
          cautious: 0.5,
          creative: 0.9,
          analytical: 0.6,
        },
        motto: '人物是故事的灵魂，对白是人物的心声',
      };
    }
    
    // 默认
    return {
      element: 'earth',
      speakingStyle: {
        formal: 0.5,
        humorous: 0.5,
        direct: 0.5,
        poetic: 0.5,
      },
      decisionStyle: {
        cautious: 0.5,
        creative: 0.5,
        analytical: 0.5,
      },
    };
  }
}

