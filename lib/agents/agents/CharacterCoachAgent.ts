/* ==================================================
   角色教练 Agent
   Character Coach Agent
   ================================================== */

import { Agent } from '../core/Agent';
import { Context, Thought, Action, AgentRole, Personality, AgentState } from '../core/types';
import { callZhipuAI } from '@/lib/zhipu';

/**
 * 角色教练 Agent
 * 负责人物塑造、对白优化、一致性检查
 */
export class CharacterCoachAgent extends Agent {
  constructor(personality: Personality, agentBus: any) {
    super(
      '角色教练',
      AgentRole.CHARACTER_COACH,
      personality,
      agentBus
    );
  }
  
  /**
   * 思考：分析人物和对白
   */
  public async think(context: Context): Promise<Thought> {
    this.setState(AgentState.THINKING);
    
    console.log('[角色教练] 开始分析人物和对白...');
    
    // 构建分析提示词
    const prompt = this.buildAnalysisPrompt(context);
    
    // 调用智谱 AI
    const response = await callZhipuAI([
      {
        role: 'system',
        content: '你是一位专业的角色教练，擅长人物塑造、对白优化和一致性检查。你的性格：' + (this.personality?.motto || '智慧、灵活、深邃'),
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
    
    console.log('[角色教练] 分析完成，置信度:', confidence);
    
    return thought;
  }
  
  /**
   * 行动：提出人物优化建议
   */
  public async act(context: Context, thought: Thought): Promise<Action> {
    this.setState(AgentState.ACTING);
    
    console.log('[角色教练] 生成人物优化建议...');
    
    // 根据思考结果生成行动
    const action: Action = {
      agentId: this.id,
      taskId: context.taskId,
      type: 'suggest',
      target: 'characters',
      content: {
        suggestions: thought.suggestions,
        focus: this.determineFocus(thought),
      },
      reason: '基于人物分析，发现 ' + thought.suggestions.length + ' 个可以优化的地方',
      timestamp: new Date(),
    };
    
    this.actionHistory.push(action);
    
    console.log('[角色教练] 行动建议生成完成');
    
    return action;
  }
  
  /**
   * 学习：根据反馈调整策略
   */
  public async learn(feedback: any): Promise<void> {
    this.feedbackHistory.push(feedback);
    
    console.log('[角色教练] 学习反馈:', feedback);
    
    // 如果是负面反馈，调整对白优化策略
    if (feedback.type === 'negative') {
      this.personality.speakingStyle.poetic = Math.max(0, this.personality.speakingStyle.poetic - 0.05);
      this.personality.speakingStyle.direct = Math.min(1, this.personality.speakingStyle.direct + 0.05);
    }
    
    // 如果是正面反馈，增强艺术性
    if (feedback.type === 'positive') {
      this.personality.speakingStyle.poetic = Math.min(1, this.personality.speakingStyle.poetic + 0.05);
    }
  }
  
  /**
   * 构建分析提示词
   */
  private buildAnalysisPrompt(context: Context): string {
    const { script, projectSettings } = context;
    
    return `请分析以下剧本中的人物和对白，重点关注：

1. **人物塑造**：
   - 人物性格是否鲜明？
   - 人物动机是否清晰？
   - 人物成长弧是否完整？

2. **对白优化**：
   - 对白是否符合人物性格？
   - 对白是否有潜台词？
   - 对白是否自然流畅？

3. **一致性检查**：
   - 人物行为是否符合设定？
   - 人物说话风格是否一致？
   - 人物关系是否清晰？

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
      console.warn('[角色教练] 解析分析结果失败，使用默认值');
    }
    
    // 解析失败，返回默认值
    return {
      insights: ['人物塑造需要进一步打磨'],
      suggestions: ['建议深化人物性格', '建议优化对白'],
      confidence: 0.5,
    };
  }
  
  /**
   * 确定关注点
   */
  private determineFocus(thought: Thought): string {
    // 根据建议内容确定关注点
    const suggestionsText = thought.suggestions.join(' ');
    
    if (suggestionsText.includes('对白')) {
      return '对白优化';
    }
    if (suggestionsText.includes('性格')) {
      return '人物塑造';
    }
    if (suggestionsText.includes('一致')) {
      return '一致性检查';
    }
    
    return '综合优化';
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
