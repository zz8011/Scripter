/**
 * route.ts - AI Skills API路由 (简化版，用于测试)
 */

import { AgentManager } from '../../lib/agents/core/AgentManager';
import { CodeSkill, ReviewSkill } from '../../lib/agents/skills/Skill';
import { agentBus } from '../../lib/agents/core/AgentBus';

const agentManager = new AgentManager(agentBus);

/**
 * GET /api/ai/skills
 * 获取所有可用的技能
 */
export async function getSkills(): Promise<{ skills: any[] }> {
  const skills = [
    {
      id: 'code',
      name: '代码生成',
      description: '根据描述生成代码',
      parameters: {
        language: { type: 'string', required: true },
        prompt: { type: 'string', required: true }
      }
    },
    {
      id: 'review',
      name: '代码审查',
      description: '审查代码并提供建议',
      parameters: {
        code: { type: 'string', required: true }
      }
    }
  ];

  return { skills };
}

/**
 * POST /api/ai/skills
 * 执行技能
 */
export async function executeSkill(body: { skillId: string; params: any; agentId?: string }): Promise<{ success: boolean; result?: any; error?: string }> {
  try {
    const { skillId, params, agentId = 'default' } = body;

    if (!skillId) {
      return { success: false, error: 'Skill ID is required' };
    }

    // 初始化Agent（幂等）
    agentManager.initializeDefaultAgents();

    // 执行技能
    let result: any;
    switch (skillId) {
      case 'code':
        const codeSkill = new CodeSkill(agentId);
        result = await codeSkill.execute(params);
        break;
      case 'review':
        const reviewSkill = new ReviewSkill(agentId);
        result = await reviewSkill.execute(params);
        break;
      default:
        return { success: false, error: `Unknown skill: ${skillId}` };
    }

    return { success: true, result };
  } catch (error) {
    console.error('Failed to execute skill:', error);
    return { success: false, error: 'Failed to execute skill' };
  }
}

/**
 * DELETE /api/ai/skills
 * 取消正在执行的任务
 */
export async function cancelTask(taskId: string): Promise<{ success: boolean }> {
  try {
    if (!taskId) {
      return { success: false };
    }

    const scheduler = agentManager.getScheduler();
    const cancelled = scheduler.cancelTask(taskId);

    return { success: cancelled };
  } catch (error) {
    console.error('Failed to cancel task:', error);
    return { success: false };
  }
}
