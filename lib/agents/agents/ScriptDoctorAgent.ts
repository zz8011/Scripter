/* ==================================================
   剧本医生 Agent
   Script Doctor Agent
   ================================================== */

import { Agent } from '../core/Agent';
import { Context, Thought, Action, AgentRole, Personality } from '../core/types';
import { callZhipuAI } from '@/lib/zhipu';

/**
 * 剧本医生 Agent
 * 负责结构分析、节奏把控、问题诊断
 */
export class ScriptDoctorAgent extends Agent {
  constructor(personality: Personality, agentBus: any) {
    super(
      '剧本医生',
      AgentRole.SCRIPT_DOCTOR,
      personality,
      agentBus
    );
  }
  
  /**
   * 思考：分析剧本结构和节奏
   */
  public async think(context: Context): Promise<Thought> {
    this.setState(AgentRole.SCRIPT_DOCTOR as any);
    
    console.log(`[${this.name}] 开始分析剧本...`);
    
    // 构建分析提示词
    const prompt = this.buildAnalysisPrompt(context);
    
    // 调用智谱 AI
    const response = await callZhipuAI([
      {
        role: 'system',
        content: `你是一位专业的剧本医生，擅长分析剧本结构、节奏和问题诊断。你的性格：${this.getPersonalityDescription()}`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ]);
    
    const analysis = 'isFallback' in response
      ? response.content
      : response.choices[0].message.content;
    
    // 解析分析结果
    const { insights, suggestions, confidence } = this.parseAnalysis(analysis);
    
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
    
    console.log(`[${this.name}] 分析完成，置信度: ${confidence}`);
    
    return thought;
  }
  
  /**
   * 行动：提出修改建议
   */
  public async act(context: Context, thought: Thought): Promise<Action> {
    this.setState('acting' as any);
    
    console.log(`[${this.name}] 生成行动建议...`);
    
    // 根据思考结果生成行动
    const action: Action = {
      agentId: this.id,
      taskId: context.taskId,
      type: 'suggest',
      target: 'script',
      content: {
        suggestions: thought.suggestions,
        priority: this.calculatePriority(thought),
      },
      reason: `基于剧本分析，发现 ${thought.suggestions.length} 个需要改进的地方`,
      timestamp: new Date(),
    };
    
    this.actionHistory.push(action);
    
    console.log(`[${this.name}] 行动建议生成完成`);
    
    return action;
  }
  
  /**
   * 学习：根据反馈调整分析策略
   */
  public async learn(feedback: any): Promise<void> {
    this.feedbackHistory.push(feedback);
    
    console.log(`[${this.name}] 学习反馈: ${feedback.type}`);
    
    // 如果是负面反馈，变得更谨慎
    if (feedback.type === 'negative') {
      this.personality.decisionStyle.cautious = Math.min(1, this.personality.decisionStyle.cautious + 0.05);
    }
    
    // 如果是正面反馈，增强信心
    if (feedback.type === 'positive') {
      this.personality.decisionStyle.analytical = Math.min(1, this.personality.decisionStyle.analytical + 0.05);
    }
  }
  
  /**
   * 构建分析提示词
   */
  private buildAnalysisPrompt(context: Context): string {
    const { script, projectSettings } = context;
    
    return `请分析以下剧本，重点关注：

1. **结构分析**：
   - 是否符合三幕式结构？
   - 激励事件、中点、高潮是否清晰？
   - 节奏是否张弛有度？

2. **节奏把控**：
   - 场景长度是否合理？
   - 对白与动作的比例是否平衡？
   - 高潮分布是否均匀？

3. **问题诊断**：
   - 是否有逻辑漏洞？
   - 人物行为是否连贯？
   - 对白是否自然？

剧本类型：${projectSettings.scriptType}
类型：${projectSettings.genre.join(', ')}

剧本内容（前 2000 字）：
${script.content.slice(0, 2000)}

请以 JSON 格式返回分析结果：
{
  "analysis": "详细分析...",
  "insights": ["洞察1. ", "洞察2", ...],
  "suggestions": ["建议1", "建议2", ...],
  "confidence": 0.85
}`;
  }
  
  /**
   * 解析分析结果
   */
    private parseAnalysis(analysis: string): {
    insights: string[];
    suggestions: string[];
    confidence: number;
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
        };
      }
    } catch (e) {
      console.warn(`[${this.name}] 解析分析结果失败，使用默认值`);
    }
    
    // 解析失败，返回默认值
    return {
      insights: ['剧本结构需要进一步分析'],
      suggestions: ['建议检查三幕式结构', '建议优化节奏'],
      confidence: 0.5,
    };
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
    
    return `五行：${elementNames[element as keyof typeof elementNames]}，说话风格：${speakingStyle.formal > 0.7 ? '正式' : '随意'}，决策风格：${decisionStyle.analytical > 0.7 ? '分析型' : '直觉型'}`;
  }
}
