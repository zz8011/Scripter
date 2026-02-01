/* ==================================================
   世界观构建 Agent
   World Builder Agent
   ================================================== */

import { Agent } from '../core/Agent';
import { Context, Thought, Action, AgentRole, Personality, AgentState } from '../core/types';
import { callZhipuAI } from '@/lib/zhipu';

/**
 * 世界观构建 Agent (土命)
 * 负责设定整理、一致性检查、背景完善
 * 性格：稳重、可靠、包容
 */
export class WorldBuilderAgent extends Agent {
  constructor(personality: Personality, agentBus: any) {
    super(
      '世界观构建',
      AgentRole.WORLD_BUILDER,
      personality,
      agentBus
    );
  }

  /**
   * 思考：分析世界观和设定
   */
  public async think(context: Context): Promise<Thought> {
    this.setState(AgentState.THINKING);

    console.log('[世界观构建] 开始构建世界观...');

    // 构建分析提示词
    const prompt = this.buildAnalysisPrompt(context);

    // 调用智谱 AI
    const response = await callZhipuAI([
      {
        role: 'system',
        content: '你是一位专业的世界观构建师，擅长设定整理、一致性检查和背景完善。你的性格：' + (this.getPersonalityDescription()),
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

    console.log('[世界观构建] 世界观分析完成，置信度:', confidence);

    return thought;
  }

  /**
   * 行动：提出世界观优化建议
   */
  public async act(context: Context, thought: Thought): Promise<Action> {
    this.setState(AgentState.ACTING);

    console.log('[世界观构建] 生成世界观建议...');

    // 根据思考结果生成行动
    const action: Action = {
      agentId: this.id,
      taskId: context.taskId,
      type: 'suggest',
      target: 'worldbuilding',
      content: {
        suggestions: thought.suggestions,
        inconsistencies: this.identifyInconsistencies(thought),
        missingElements: this.identifyMissingElements(thought),
      },
      reason: '基于世界观分析，发现 ' + thought.suggestions.length + ' 个需要完善的地方',
      timestamp: new Date(),
    };

    this.actionHistory.push(action);

    console.log('[世界观构建] 世界观建议生成完成');

    return action;
  }

  /**
   * 学习：根据反馈调整策略
   */
  public async learn(feedback: any): Promise<void> {
    this.feedbackHistory.push(feedback);

    console.log('[世界观构建] 学习反馈:', feedback);

    // 如果是负面反馈，变得更严谨
    if (feedback.type === 'negative') {
      this.personality.decisionStyle.cautious = Math.min(1, this.personality.decisionStyle.cautious + 0.05);
    }

    // 如果是正面反馈，增强系统性
    if (feedback.type === 'positive') {
      this.personality.decisionStyle.creative = Math.min(1, this.personality.decisionStyle.creative + 0.05);
    }
  }

  /**
   * 构建分析提示词
   */
  private buildAnalysisPrompt(context: Context): string {
    const { script, projectSettings } = context;

    return `请分析以下剧本的世界观设定，重点关注：

1. **设定整理**：
   - 世界规则是否清晰？
   - 社会结构是否合理？
   - 历史背景是否完整？

2. **一致性检查**：
   - 设定是否前后一致？
   - 规则是否被遵守？
   - 是否有逻辑矛盾？

3. **背景完善**：
   - 文化习俗是否丰富？
   - 地理环境是否具体？
   - 时代特征是否鲜明？

4. **细节补充**：
   - 有哪些设定可以深化？
   - 有哪些背景可以展开？
   - 有哪些元素可以增加真实感？

剧本类型：${projectSettings?.genre?.join('、') || '未知'}

剧本内容（前 2000 字）：
${script?.slice(0, 2000) || ''}

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
      console.warn('[世界观构建] 解析分析结果失败，使用默认值');
    }

    // 解析失败，返回默认值
    return {
      insights: ['世界观设定需要进一步完善'],
      suggestions: ['建议检查设定一致性', '建议丰富背景细节'],
      confidence: 0.5,
    };
  }

  /**
   * 识别不一致之处
   */
  private identifyInconsistencies(thought: Thought): string[] {
    return thought.insights.filter(i => 
      i.includes('矛盾') || 
      i.includes('不一致') || 
      i.includes('冲突') ||
      i.includes('漏洞')
    );
  }

  /**
   * 识别缺失元素
   */
  private identifyMissingElements(thought: Thought): string[] {
    return thought.suggestions.filter(s => 
      s.includes('缺失') || 
      s.includes('缺少') || 
      s.includes('补充') ||
      s.includes('完善')
    );
  }

  /**
   * 获取个性描述
   */
  private getPersonalityDescription(): string {
    const { element, speakingStyle, decisionStyle } = this.getPersonality();

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
