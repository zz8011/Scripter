/* ==================================================
   场景设计 Agent
   Scene Designer Agent
   ================================================== */

import { Agent, Context, Thought, Action, AgentRole, Personality } from '../core/types';
import { callZhipuAI } from '@/lib/zhipu';

/**
 * 场景设计 Agent (木命)
 * 负责场景描写、氛围营造、视觉呈现
 * 性格：温和、成长、创造力
 */
export class SceneDesignerAgent extends Agent {
  constructor(personality: Personality, agentBus: any) {
    super(
      '场景设计',
      AgentRole.SCENE_DESIGNER,
      personality,
      agentBus
    );
  }

  /**
   * 思考：分析场景和氛围
   */
  public async think(context: Context): Promise<Thought> {
    this.setState('thinking' as any);

    console.log([] 开始设计场景...);

    // 构建分析提示词
    const prompt = this.buildAnalysisPrompt(context);

    // 调用智谱 AI
    const response = await callZhipuAI([
      {
        role: 'system',
        content: 你是一位专业的场景设计师，擅长场景描写、氛围营造和视觉呈现。你的性格：,
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

    console.log([] 场景设计完成，置信度: );

    return thought;
  }

  /**
   * 行动：提出场景优化建议
   */
  public async act(context: Context, thought: Thought): Promise<Action> {
    this.setState('acting' as any);

    console.log([] 生成场景建议...);

    // 根据思考结果生成行动
    const action: Action = {
      agentId: this.id,
      taskId: context.taskId,
      type: 'suggest',
      target: 'scenes',
      content: {
        suggestions: thought.suggestions,
        atmosphere: this.extractAtmosphere(thought),
        visualElements: this.extractVisualElements(thought),
      },
      reason: 基于场景分析，发现  个可以优化的地方,
      timestamp: new Date(),
    };

    this.actionHistory.push(action);

    console.log([] 场景建议生成完成);

    return action;
  }

  /**
   * 学习：根据反馈调整策略
   */
  public async learn(feedback: any): Promise<void> {
    this.feedbackHistory.push(feedback);

    console.log([] 学习反馈: );

    // 如果是负面反馈，调整场景设计策略
    if (feedback.type === 'negative') {
      this.personality.speakingStyle.poetic = Math.max(0, this.personality.speakingStyle.poetic - 0.05);
      this.personality.speakingStyle.direct = Math.min(1, this.personality.speakingStyle.direct + 0.05);
    }

    // 如果是正面反馈，增强诗意表达
    if (feedback.type === 'positive') {
      this.personality.speakingStyle.poetic = Math.min(1, this.personality.speakingStyle.poetic + 0.05);
    }
  }

  /**
   * 构建分析提示词
   */
  private buildAnalysisPrompt(context: Context): string {
    const { script, projectSettings } = context;

    return 请分析以下剧本的场景设计，重点关注：

1. **场景描写**：
   - 场景是否清晰可感？
   - 空间布局是否合理？
   - 场景转换是否流畅？

2. **氛围营造**：
   - 情绪基调是否恰当？
   - 是否有足够的感官细节？
   - 氛围是否与情节匹配？

3. **视觉呈现**：
   - 画面感是否强烈？
   - 镜头语言是否丰富？
   - 色彩运用是否得当？

4. **环境细节**：
   - 时间地点是否明确？
   - 环境元素是否服务于故事？
   - 是否有独特的环境特征？

剧本类型：
类型：

剧本内容（前 2000 字）：


请以 JSON 格式返回分析结果：
{
   analysis: 详细分析...,
  insights: [洞察1, 洞察2, ...],
  suggestions: [建议1, 建议2, ...],
  confidence: 0.85
};
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
      console.warn([] 解析分析结果失败，使用默认值);
    }

    // 解析失败，返回默认值
    return {
      insights: ['场景设计需要进一步优化'],
      suggestions: ['建议增强氛围描写', '建议丰富视觉细节'],
      confidence: 0.5,
    };
  }

  /**
   * 提取氛围建议
   */
  private extractAtmosphere(thought: Thought): string[] {
    return thought.suggestions.filter(s => 
      s.includes('氛围') || 
      s.includes('情绪') || 
      s.includes('基调')
    );
  }

  /**
   * 提取视觉元素
   */
  private extractVisualElements(thought: Thought): string[] {
    return thought.insights.filter(i => 
      i.includes('视觉') || 
      i.includes('画面') || 
      i.includes('镜头') ||
      i.includes('色彩')
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

    return 五行：，说话风格：，决策风格：;
  }
}
