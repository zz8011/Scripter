/**
 * AgentManager.ts - Agent管理器
 */

import { AgentBus, agentBus } from './AgentBus';
import { AgentScheduler } from './AgentScheduler';

export interface Agent {
  id: string;
  name: string;
  skills: string[];
  status: 'idle' | 'busy' | 'offline';
  sendMessage(message: any): void;
}

export class AgentManager {
  private agentBus: AgentBus;
  private agents: Map<string, Agent>;
  private scheduler: AgentScheduler;
  private initialized: boolean = false;

  constructor(agentBusInstance: AgentBus = agentBus) {
    this.agentBus = agentBusInstance;
    this.agents = new Map();
    
    // BUG: 这里创建AgentScheduler时，scheduler agent还未注册
    // 会导致AgentBus.subscribe抛出错误
    this.scheduler = new AgentScheduler(this.agentBus);
    this.scheduler.start();
  }

  /**
   * 初始化默认Agent
   * 修复：确保幂等性，多次调用不会重复创建Agent
   */
  initializeDefaultAgents(): void {
    // 修复：如果已初始化，直接返回
    if (this.initialized) {
      console.log('Default agents already initialized');
      return;
    }

    const defaultAgents: Agent[] = [
      {
        id: 'coder',
        name: '代码助手',
        skills: ['code', 'debug'],
        status: 'idle',
        sendMessage: (msg) => console.log(`Coder: ${msg}`)
      },
      {
        id: 'reviewer',
        name: '代码审查员',
        skills: ['review', 'analyze'],
        status: 'idle',
        sendMessage: (msg) => console.log(`Reviewer: ${msg}`)
      },
      {
        id: 'tester',
        name: '测试员',
        skills: ['test', 'validate'],
        status: 'idle',
        sendMessage: (msg) => console.log(`Tester: ${msg}`)
      }
    ];

    for (const agent of defaultAgents) {
      // 修复：检查Agent是否已存在，避免重复注册
      if (!this.agents.has(agent.id)) {
        this.registerAgent(agent);
      } else {
        console.log(`Agent ${agent.id} already exists, skipping`);
      }
    }

    this.initialized = true;
  }

  /**
   * 注册Agent
   */
  registerAgent(agent: Agent): void {
    if (this.agents.has(agent.id)) {
      throw new Error(`Agent ${agent.id} already exists`);
    }

    this.agents.set(agent.id, agent);
    this.agentBus.register({ id: agent.id, name: agent.name, handler: agent.sendMessage });
  }

  /**
   * 注销Agent
   */
  unregisterAgent(agentId: string): void {
    this.agents.delete(agentId);
    this.agentBus.unregister(agentId);
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
   * 获取调度器
   */
  getScheduler(): AgentScheduler {
    return this.scheduler;
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.scheduler.stop();
    for (const agentId of this.agents.keys()) {
      this.agentBus.unregister(agentId);
    }
    this.agents.clear();
  }
}
