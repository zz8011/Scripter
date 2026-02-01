/* ==================================================
   情节策划 Agent
   Plot Planner Agent
   ================================================== */

import { Agent } from '../core/Agent';
import { Context, Thought, Action, AgentRole, Personality, AgentState } from '../core/types';
import { callZhipuAI } from '@/lib/zhipu';

/**
 * 情节策划 Agent (火命)
 * 负责剧情设计、冲突构建、反转构思
 * 性格：热情、大胆、启发
 */
export class PlotPlannerAgent extends Agent {
  constructor(personality: Personality, agentBus: any) {
    super(
      '情节策划',
      AgentRole.PLOT_PLANNER,
      personality,
      agentBus
    );
  }

  /**
   * 思考：分析剧情和构思反转
   */
  public async think(context: Context): Promise<Thought> {
    this.setState(AgentState.THINKING);

    console.log('[情节策划] 开始策划剧情...');

    // 构建分析提示词
    const prompt = this.buildAnalysisPrompt(context);

    // 调用智谱 AI
    const response = await callZhipuAI([
      {
        role: 'system',
        content: '你是一位专业的情节策划师，擅长剧情设计、冲突构建和反转构思。你的性格：' + (this.personality?.motto || '热情、大胆、启发'),
      },
      {
        role: 'user',
        content: prompt,
      },
    ]);

    const analysis = response.choices[0].message.content;

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

    console.log('[情节策划] 策划完成，置信度:', confidence);

    return thought;
  }

  /**
   * 行动：提出剧情优化建议
   */
  public async act(context: Context, thought: Thought): Promise<Action> {
    this.setState(AgentState.ACTING);

    console.log('[情节策划] 生成剧情建议...');

    // 根据思考结果生成行动
    const action: Action = {
      agentId: this.id,
      taskId: context.taskId,
      type: 'suggest',
      target: 'plot',
      content: {
        suggestions: thought.suggestions,
        plotPoints: this.extractPlotPoints(thought),
        twists: this.identifyTwists(thought),
      },
      reason: '基于剧情分析，发现 ' + thought.suggestions.length + ' 个可以优化的地方',
      timestamp: new Date(),
    };

    this.actionHistory.push(action);

    console.log('[情节策划] 剧情建议生成完成');

    return action;
  }

  /**
   * 学习：根据反馈调整策略
   */
  public async learn(feedback: any): Promise<void> {
    this.feedbackHistory.push(feedback);

    console.log('[情节策划] 学习反馈:', feedback);

    // 如果是负面反馈，调整剧情设计策略
    if (feedback.type === 'negative') {
      this.personality.decisionStyle.cautious = Math.min(1, this.personality.decisionStyle.cautious + 0.05);
      this.personality.decisionStyle.creative = Math.max(0, this.personality.decisionStyle.creative - 0.05);
    }

    // 如果是正面反馈，增强创造性
    if (feedback.type === 'positive') {
      this.personality.decisionStyle.creative = Math.min(1, this.personality.decisionStyle.creative + 0.05);
    }
  }

  /**
   * 构建分析提示词
   */
  private buildAnalysisPrompt(context: Context): string {
    const { script, projectSettings } = context;

    return `请分析以下剧本的剧情设计，重点关注：

1. **剧情结构**：
   - 激励事件是否明确？
   - 中点转折是否有力？
   - 高潮是否令人满意？

2. **冲突构建**：
   - 主要冲突是否清晰？
   - 冲突升级是否合理？
   - 是否有足够的戏剧张力？

3. **反转构思**：
   - 是否有意外的情节转折？
   - 反转是否合乎逻辑？
   - 是否有更精彩的反转可能？

4. **节奏控制**：
   - 情节推进是否流畅？
   - 是否有拖沓或跳跃？
   - 悬念设置是否得当？

剧本类型：${projectSettings?.genre?.join('、') || '未知'}

剧本内容（前 2000 字）：
${typeof script === 'string' ? script.slice(0, 2000) : script?.content?.slice(0, 2000) || ''}

请以 JSON 格式返回分析结果：
{
  "analysis": "详细分析...",
  "insights": ["洞察1", "洞察2", ...],
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
      console.warn('[情节策划] 解析分析结果失败，使用默认值');
    }

    // 解析失败，返回默认值
    return {
      insights: ['剧情结构需要进一步优化'],
      suggestions: ['建议加强冲突构建', '建议增加情节反转'],
      confidence: 0.5,
    };
  }

  /**
   * 提取情节点
   */
  private extractPlotPoints(thought: Thought): string[] {
    return thought.insights.filter(i => 
      i.includes('情节点') || 
      i.includes('转折') || 
      i.includes('高潮')
    );
  }

  /**
   * 识别反转点
   */
  private identifyTwists(thought: Thought): string[] {
    return thought.suggestions.filter(s => 
      s.includes('反转') || 
      s.includes('转折') || 
      s.includes('意外')
    );
  }

  /**
   * 获取个性描述
   */
  private getPersonalityDescription(): string {
    const { element, speakingStyle, decisionStyle } = this.personality;

    const elementNames: Record<string, string> = {
      wood: '木（生长、创造）',
      fire: '火（热情、活跃）',
      earth: '土（稳重、可靠）',
      metal: '金（严谨、精准）',
      water: '水（灵活、深邃）',
    };

    return `五行：${elementNames[element] || element}，说话风格：${speakingStyle.formal > 0.7 ? '正式' : '随意'}，决策风格：${decisionStyle.creative > 0.7 ? '创造型' : '分析型'}`;
  }
}
