/* ==================================================
   Agent 调度器
   Agent Scheduler
   ================================================== */

import { Agent, Context, Thought, Action } from './types';

/**
 * Agent 调度器
 * 负责 Agent 的执行调度
 */
export class AgentScheduler {
  private agentBus: any;
  
  constructor(agentBus: any) {
    this.agentBus = agentBus;
  }
  
  /**
   * 串行调度
   * Agent 按顺序依次执行
   */
  public async scheduleSequential(
    agents: Agent[],
    context: Context
  ): Promise<{ agent: Agent; thought: Thought; action: Action }[]> {
    const results: { agent: Agent; thought: Thought; action: Action }[] = [];
    
    for (const agent of agents) {
      console.log(`[Scheduler] 执行 Agent: ${agent.name}`);
      
      // 思考
      const thought = await agent.think(context);
      
      // 行动
      const action = await agent.act(context, thought);
      
      results.push({ agent, thought, action });
    }
    
    return results;
  }
  
  /**
   * 并行调度
   * Agent 同时并执行
   */
  public async scheduleParallel(
    agents: Agent[],
    context: Context
  ): Promise<{ agent: Agent; thought: Thought; action: Action }[]> {
    const results = await Promise.all(
      agents.map(async (agent) => {
        console.log(`[Scheduler] 并行执行 Agent: ${agent.name}`);
        
        // 思考
        const thought = await agent.think(context);
        
        // 行动
        const action = await agent.act(context, thought);
        
        return { agent, thought, action };
      })
    );
    
    return results;
  }
  
  /**
   * 协作调度（Agent 间多轮对话）
   * Agent 之间可以互相交流，多轮迭代
   */
  public async scheduleCollaborative(
    agents: Agent[],
    context: Context,
    options: {
      rounds?: number;              // 对话轮数
      maxDuration?: number;          // 最大时长（毫秒）
      convergenceThreshold?: number; // 收敛阈值（当 Agent 意见一致时停止）
    } = {}
  ): Promise<{ round: number; results: any[] }[]> {
    const {
      rounds = 3,
      maxDuration = 30000,
      convergenceThreshold = 0.9,
    } = options;
    
    const history: { round: number; results: any[] }[] = [];
    const startTime = Date.now();
    
    for (let round = 1; round <= rounds; round++) {
      console.log(`[Scheduler] 协作轮次 ${round}/${rounds}`);
      
      // 检查超时
      if (Date.now() - startTime > maxDuration) {
        console.warn(`[Scheduler] 协作超时，停止`);
        break;
      }
      
      // 处理所有 Agent 的消息队列
      for (const agent of agents) {
        await agent.processMessageQueue();
      }
      
      // 并行执行所有 Agent
      const roundResults = await this.scheduleParallel(agents, context);
      
      history.push({
        round,
        results: roundResults,
      });
      
      // 检查收敛（简化版：检查所有 Agent 的建议是否一致）
      if (this.checkConvergence(roundResults, convergenceThreshold)) {
        console.log(`[Scheduler] Agent 意见已收敛，停止协作`);
        break;
      }
      
      // 等待一段时间再进行下一轮
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return history;
  }
  
  /**
   * 检查收敛
   */
  private checkConvergence(
    results: { agent: any; thought: any; action: any }[],
    threshold: number
  ): boolean {
    // 简化版：检查所有 Agent 的置信度是否都很高
    const avgConfidence = results.reduce((sum, r) => sum + r.thought.confidence, 0) / results.length;
    return avgConfidence >= threshold;
  }
  
  /**
   * 工作流调度
   * 按照预定义的工作流执行 Agent
   */
  public async scheduleWorkflow(
    workflow: WorkflowStep[],
    context: Context
  ): Promise<any> {
    const results: any = {};
    
    for (const step of workflow) {
      console.log(`[Scheduler] 执行工作流步骤: ${step.name}`);
      
      const agent = this.agentBus.getAgent(step.agentId);
      if (!agent) {
        console.error(`[Scheduler] Agent 不存在: ${step.agentId}`);
        continue;
      }
      
      // 思考
      const thought = await agent.think(context);
      
      // 行动
      const action = await agent.act(context, thought);
      
      results[step.name] = { agent, thought, action };
      
      // 如果有下一步的输入，更新上下文
      if (step.nextStepInput) {
        context = step.nextStepInput(context, thought, action);
      }
    }
    
    return results;
  }
}

/**
 * 工作流步骤
 */
export interface WorkflowStep {
  name: string;
  agentId: string;
  nextStepInput?: (context: Context, thought: any, action: any) => Context;
}
