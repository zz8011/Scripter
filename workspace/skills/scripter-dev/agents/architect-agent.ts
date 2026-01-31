/* ==================================================
   架构设计 Agent
   Architect Agent
   ================================================== */

import { Agent, Context, Thought, Action, AgentRole, Personality, Feedback } from '@/lib/agents/core/types';
import { callZhipuAI } from '@/lib/zhipu';

/**
 * 架构设计 Agent
 * 专门设计 Scripter 的架构和模块
 */
export class ArchitectAgent extends Agent {
  constructor(personality: Personality, agentBus: any) {
    super(
      '架构设计师',
      AgentRole.SCRIPT_DOCTOR, // 复用剧本医生角色，但专注于架构设计
      personality,
      agentBus
    );
  }
  
  /**
   * 思考：分析架构设计需求
   */
  public async think(context: Context): Promise<Thought> {
    this.setState('thinking' as any);
    
    console.log(`[${this.name}] 开始分析架构需求...`);
    
    // 构建分析提示词
    const prompt = this.buildArchitecturePrompt(context);
    
    // 调用智谱 AI
    const response = await callZhipuAI([
      {
        role: 'system',
        content: `你是一位专业的软件架构师，擅长多 Agent 系统、WebSocket 协议、事件驱动架构。你的性格：${this.getPersonalityDescription()}

分析重点：
1. **模块解耦**：模块之间是否松耦合
2. **可扩展性**：是否支持动态添加 Agent
3. **可观测性**：是否易于调试和监控
4. **性能**：是否有性能瓶颈
5. **安全性**：是否有安全风险`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ]);
    
    const analysis = response.choices[0].message.content;
    
    // 解析分析结果
    const { insights, suggestions, confidence, modules } = this.parseArchitectureAnalysis(analysis);
    
    const thought: Thought = {
      agentId: this.id,
      taskId: context.taskId,
      analysis,
      insights,
      suggestions,
      confidence,
      timestamp: new Date(),
    };
    
    this.thinkingHistory.push(thought);
    
    console.log(`[${this.name}] 架构分析完成，建议 ${modules?.length || 0} 个模块`);
    
    return thought;
  }
  
  /**
   * 行动：提供架构设计方案
   */
  public async act(context: Context, thought: Thought): Promise<Action> {
    this.setState('acting' as any);
    
    console.log(`[${this.name}] 生成架构设计方案...`);
    
    // 根据思考结果生成行动
    const action: Action = {
      agentId: this.id,
      taskId: context.taskId,
      type: 'suggest',
      target: 'architecture',
      content: {
        suggestions: thought.suggestions,
        modules: this.extractModules(thought),
        priority: this.calculatePriority(thought),
      },
      reason: `基于架构分析，提供 ${thought.suggestions.length} 个改进建议`,
      timestamp: new Date(),
    };
    
    this.actionHistory.push(action);
    
    console.log(`[${this.name}] 架构设计方案生成完成`);
    
    return action;
  }
  
  /**
   * 学习：根据反馈调整设计策略
   */
  public async learn(feedback: Feedback): Promise<void> {
    this.feedbackHistory.push(feedback);
    
    console.log(`[${this.name}] 学习反馈: ${feedback.type}`);
    
    // 如果是负面反馈，变得更保守
    if (feedback.type === 'negative') {
      {
        this.personality.decisionStyle.cautious = Math.min(1, this.personality.decisionStyle.cautious + 0.1);
        this.personality.decisionStyle.creative = Math.max(0, this.personality.decisionStyle.creative - 0.05);
      }
    }
    
    // 如果是正面反馈，增强创造性
    if (feedback.type === 'positive') {
      {
        this.personality.decisionStyle.creative = Math.min(1, this.personality.decisionStyle.creative + 0.1);
        this.personality.decisionStyle.cautious = Math.max(0, this.personality.decisionStyle.cautious - 0.05);
      }
    }
  }
  
  /**
   * 构建架构分析提示词
   */
  private buildArchitecturePrompt(context: Context): string {
    return `请分析 Scripter 项目的架构设计，重点关注：

1. **多 Agent 系统**：
   - Agent 之间如何通信？
   - 是否支持动态添加/移除 Agent？
   - Agent 之间的依赖关系是否清晰？

2. **Gateway 设计**：
   - WebSocket 协议是否合理？
   - 事件系统是否完善？
   - 消息路由是否高效？

3. **模块组织**：
   - 代码结构是否清晰？
   - 模块职责是否单一？
   - 依赖关系是否合理？

4. **可扩展性**：
   - 是否支持自定义 Agent？
   - 是否支持插件式技能？
   - 配置系统是否灵活？

5. **性能和安全性**：
   - 是否有性能瓶颈？
   - 是否有安全风险？
   - 错误处理是否完善？

请以 JSON 格式返回分析结果：
{
  "analysis": "详细分析...",
  "insights": ["洞察1", "洞察2", ...],
  "suggestions": ["建议1", "建议2", ...],
  "modules": [
    {
      "name": "模块名称",
      "purpose": "模块目的",
      "status": "existing" | "missing" | "needs_improvement"
    }
  ],
  "confidence": 0.85
}`;
  }
  
  /**
   * 解析架构分析结果
   */
  private parseArchitectureAnalysis(analysis: string): {
    insights: string[];
    suggestions: string[];
    confidence: number;
    modules?: any[];
  } {
    try {
      // 尝试解析 JSON
      const jsonMatch = analysis.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          insights: parsed.insights || [],
          suggestions: parsed.suggestions || [],
          confidence: parsed.confidence || 0.7,
          modules: parsed.modules || [],
        };
      }
    } catch (e) {
      console.warn(`[${this.name}] 解析架构分析结果失败，使用默认值`);
    }
    
    // 解析失败，返回默认值
    return {
      insights: ['架构需要进一步优化'],
      suggestions: ['建议加强模块解耦', '建议完善事件系统'],
      confidence: 0.5,
      modules: [],
    };
  }
  
  /**
   * 提取模块信息
   */
  private extractModules(thought: Thought): any[] {
    // 从思考结果中提取模块信息
    const modulesMatch = thought.analysis.match(/模块：([^。]+)/g);
    if (modulesMatch) {
      return modulesMatch.map((match, index) => ({
        name: `模块 ${index + 1}`,
        purpose: match[1],
        status: 'existing',
      }));
    }
    return [];
  }
  
  /**
   * 计算优先级
   */
  private calculatePriority(thought: Thought): 'low' | 'normal' | 'high' {
    if (thought.confidence > 0.8) return 'high';
    if (thought.confidence > 0.6) return 'normal';
    return 'low';
  }
  
  /**
   * 获取个性描述
   */
  private getPersonalityDescription(): string {
    const { element, speakingStyle, decisionStyle } = this.personality;
    
    const elementNames = {
      wood: '木（生长、创造）',
      fire: '火（热情、活跃）',
      earth: '土（稳重、可靠）',
      metal: '金（严谨、精准）',
      water: '水（灵活、深邃）',
    };
    
    return `五行：${elementNames[element]}，说话风格：${speakingStyle.formal > 0.7 ? '正式' : '随意'}，决策风格：${decisionStyle.creative > 0.7 ? '创造型' : '分析型'}`;
  }
}
