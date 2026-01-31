/* ==================================================
   代码审查 Agent
   Code Reviewer Agent
   ================================================== */

import { Agent, Context, Thought, Action, AgentRole, Personality, Feedback } from '@/lib/agents/core/types';
import { callZhipuAI } from '@/lib/zhipu';

/**
 * 代码审查 Agent
 * 专门审查 Scripter 代码，提供专业建议
 */
export class CodeReviewerAgent extends Agent {
  constructor(personality: Personality, agentBus: any) {
    super(
      '代码审查专家',
      AgentRole.SCRIPT_DOCTOR, // 复用剧本医生角色，但专注于代码审查
      personality,
      agentBus
    );
  }
  
  /**
   * 思考：分析代码质量和安全性
   */
  public async think(context: Context): Promise<Thought> {
    this.setState('thinking' as any);
    
    console.log(`[${this.name}] 开始分析代码...`);
    
    // 构建分析提示词
    const prompt = this.buildCodeReviewPrompt(context);
    
    // 调用智谱 AI
    const response = await callZhipuAI([
      {
        role: 'system',
        content: `你是一位专业的代码审查专家，擅长 TypeScript、React、Next.js 和多 Agent 系统架构。你的性格：${this.getPersonalityDescription()}

审查重点：
1. **类型安全**：TypeScript 类型是否正确，是否避免使用 any
2. **错误处理**：所有异步操作是否有 try-catch，错误处理是否完善
3. **安全性**：是否有 SQL 注入、XSS 攻击等安全风险
4. **性能**：是否有内存泄漏、死循环、N+1 查询等性能问题
5. **架构**：代码结构是否合理，模块解耦是否充分
6. **最佳实践**：是否遵循 TypeScript、React、Next.js 最佳实践`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ]);
    
    const analysis = response.choices[0].message.content;
    
    // 解析分析结果
    const { insights, suggestions, confidence, issues } = this.parseCodeReview(analysis);
    
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
    
    console.log(`[${this.name}] 代码审查完成，发现 ${issues.length} 个问题`);
    
    return thought;
  }
  
  /**
   * 行动：提供代码改进建议
   */
  public async act(context: Context, thought: Thought): Promise<Action> {
 {
    this.setState('acting' as any);
    
    console.log(`[${this.name}] 生成改进建议...`);
    
    // 根据思考结果生成行动
    const action: Action = {
      agentId: this.id,
      taskId: context.taskId,
      type: 'suggest',
      target: 'code',
      content: {
        suggestions: thought.suggestions,
        priority: this.calculatePriority(thought),
        issues: this.extractIssues(thought),
      },
      reason: `基于代码审查，发现 ${thought.suggestions.length} 个改进点`,
      timestamp: new Date(),
    };
    
    this.actionHistory.push(action);
    
    console.log(`[${this.name}] 改进建议生成完成`);
    
    return action;
  }
  
  /**
   * 学习：根据反馈调整审查策略
   */
  public async learn(feedback: Feedback): Promise<void> {
    this.feedbackHistory.push(feedback);
    
    console.log(`[${this.name}] 学习反馈: ${feedback.type}`);
    
    // 如果是负面反馈，变得更谨慎
    if (feedback.type === 'negative') {
      {
        this.personality.decisionStyle.cautious = Math.min(1, this.personality.decisionStyle.cautious + 0.1);
        this.personality.decisionStyle.analytical = Math.min(1, this.personality.decisionStyle.analytical + 0.05);
      }
    }
    
    // 如果是正面反馈，增强信心
    if (feedback.type === 'positive') {
      {
        this.personality.decisionStyle.analytical = Math.min(1, this.personality.decisionStyle.analytical + 0.05);
        this.personality.speakingStyle.direct = Math.min(1, this.personality.speakingStyle.direct + 0.05);
      }
    }
  }
  
  /**
   * 构建代码审查提示词
   */
  private buildCodeReviewPrompt(context: Context): string {
    // 这里应该从上下文中获取代码内容
    // 暂时使用示例代码
    const codeToReview = context.script?.content || `// 示例代码
export function exampleFunction() {
  const data = fetchData();
  return data.map(item => item.value);
}`;
    
    return `请审查以下代码，重点关注：
1. **类型安全**：TypeScript 类型是否正确
2. **错误处理**：异步操作是否有 try-catch
3. **安全性**：是否有安全风险
4. **性能**：是否有性能问题
5. **架构**：代码结构是否合理
6. **最佳实践**：是否遵循最佳实践

代码：
\`\`\`typescript
${codeToReview}
\`\`\`

请以 JSON 格式返回审查结果：
{
  "analysis": "详细分析...",
  "insights": ["洞察1", "洞察2", ...],
  "suggestions": ["建议1", "建议2", ...],
  "issues": [
    {
      "type": "type_safety" | "error_handling" | "security" | "performance" | "architecture" | "best_practice",
      "severity": "low" | "medium" | "high",
      "message": "问题描述",
      "location": "代码位置（可选）",
      "suggestion": "改进建议"
    }
  ],
  "confidence": 0.85
}`;
  }
  
  /**
   * 解析代码审查结果
   */
  private parseCodeReview(analysis: string): {
    insights: string[];
    suggestions: string[];
    confidence: number;
    issues: any[];
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
          issues: parsed.issues || [],
        };
      }
    } catch (e) {
      console.warn(`[${this.name}] 解析审查结果失败，使用默认值`);
    }
    
    // 解析失败，返回默认值
    return {
      insights: ['代码需要进一步审查'],
      suggestions: ['建议添加类型检查', '建议完善错误处理'],
      confidence: 0.5,
      issues: [],
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
   * 提取问题
   */
  private extractIssues(thought: Thought): any[] {
    // 从思考结果中提取问题
    const issuesMatch = thought.analysis.match(/问题：([^。]+)/g);
    if (issuesMatch) {
      return issuesMatch.map((match, index) => ({
        type: 'general',
        severity: 'medium',
        message: match[1],
        location: `line ${index + 1}`,
        suggestion: '请检查并修复',
      }));
    }
    return [];
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
    
    return `五行：${elementNames[element]}，说话风格：${speakingStyle.formal > 0.7 ? '正式' : '随意'}，决策风格：${decisionStyle.analytical > 0.7 ? '分析型' : '直觉型'}`;
  }
}
