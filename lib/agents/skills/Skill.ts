/**
 * Skill.ts - 技能基类
 */

import { agentBus, AgentMessage } from '../core/AgentBus';

export interface SkillConfig {
  id: string;
  name: string;
  description: string;
  parameters?: Record<string, any>;
}

export abstract class Skill {
  protected config: SkillConfig;
  protected agentId: string;

  constructor(agentId: string, config: SkillConfig) {
    this.agentId = agentId;
    this.config = config;
  }

  /**
   * 获取技能ID
   */
  getId(): string {
    return this.config.id;
  }

  /**
   * 获取技能名称
   */
  getName(): string {
    return this.config.name;
  }

  /**
   * 执行技能
   */
  abstract execute(params: any): Promise<any>;

  /**
   * 发送消息
   * BUG: 调用签名不匹配，agentBus.send期望1个或3个参数，但这里传了3个参数
   * 而且消息结构不完整
   */
  protected sendMessage(to: string, type: string, payload: any): void {
    // BUG: 调用方式不匹配agentBus.send的签名
    // agentBus.send 定义为: send(message: AgentMessage): void 或 send(to, type, payload): void
    // 但这样调用会导致第二个参数被当作type，第三个参数被当作payload
    // 然而agentBus.send的第二个重载需要三个参数
    
    // 更好的方式是构建完整的AgentMessage对象
    const message: AgentMessage = {
      id: generateId(),
      type,
      priority: 'NORMAL',
      payload,
      from: this.agentId,
      to,
      timestamp: Date.now()
    };
    
    agentBus.send(message);
  }

  /**
   * 发送结果消息
   */
  protected sendResult(taskId: string, result: any): void {
    this.sendMessage('scheduler', 'TASK_COMPLETE', { taskId, result });
  }

  /**
   * 发送错误消息
   */
  protected sendError(taskId: string, error: string): void {
    this.sendMessage('scheduler', 'TASK_FAILED', { taskId, error });
  }
}

/**
 * 代码技能
 */
export class CodeSkill extends Skill {
  constructor(agentId: string) {
    super(agentId, {
      id: 'code',
      name: '代码生成',
      description: '生成代码',
      parameters: {
        language: 'string',
        prompt: 'string'
      }
    });
  }

  async execute(params: { language: string; prompt: string }): Promise<any> {
    console.log(`Generating ${params.language} code for: ${params.prompt}`);
    return { code: `// Generated code\n// ${params.prompt}` };
  }
}

/**
 * 审查技能
 */
export class ReviewSkill extends Skill {
  constructor(agentId: string) {
    super(agentId, {
      id: 'review',
      name: '代码审查',
      description: '审查代码质量',
      parameters: {
        code: 'string'
      }
    });
  }

  async execute(params: { code: string }): Promise<any> {
    console.log(`Reviewing code: ${params.code.substring(0, 50)}...`);
    return { issues: [] };
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
