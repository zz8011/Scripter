/* ==================================================
   人性化润色技能（去 AI 味）
   Humanize Skill
   ================================================== */

import { Skill, Context, ContextRequirement } from '../core/types';
import { callZhipuAI } from '@/lib/zhipu';

/**
 * AI 味检测结果
 */
export interface AIFlavorDetection {
  score: number; // 0-100，分数越高 AI 味越重
  indicators: Array<{
    type: string;
    description: string;
    examples: string[];
  }>;
}

/**
 * 人性化润色结果
 */
export interface HumanizeResult {
  original: string;
  humanized: string;
  aiFlavorBefore: AIFlavorDetection;
  aiFlavorAfter: AIFlavorDetection;
  changes: Array<{
    type: string;
    before: string;
    after: string;
    reason: string;
  }>;
  explanation: string;
}

/**
 * 人性化润色技能
 * 去除文本中的 AI 味，使其更自然、更人性化
 */
export class HumanizeSkill implements Skill {
  public readonly id = 'humanize';
  public readonly name = '人性化润色';
  public readonly description = '去除文本中的 AI 味，使其更自然、更人性化、更符合真实创作风格';
  public readonly category = 'editing';
  public readonly metadata = {
    version: '1.0.0',
    author: '剧灵',
    tags: ['humanize', 'polish', 'natural', 'ai-detection'],
    confidence: 0.83,
  };

  // 上下文需求：需要创作意图、当前场景（可选）、人物档案（可选）
  public readonly requiredContext: ContextRequirement[] = [
    { type: 'creativeIntent' },
    { type: 'currentScene' },
    { type: 'characterProfile' },
  ];

  // 输入 Schema
  public readonly inputSchema = {
    text: { type: 'string', required: true },
    textType: {
      type: 'string',
      enum: ['dialogue', 'action', 'description', 'narration'],
      required: false,
    },
    characterName: { type: 'string', required: false },
  };

  // 输出 Schema
  public readonly outputSchema = {
    original: { type: 'string' },
    humanized: { type: 'string' },
    aiFlavorBefore: {
      type: 'object',
      properties: {
        score: { type: 'number' },
        indicators: { type: 'array' },
      },
    },
    aiFlavorAfter: {
      type: 'object',
      properties: {
        score: { type: 'number' },
        indicators: { type: 'array' },
      },
    },
    changes: { type: 'array' },
    explanation: { type: 'string' },
  };

  // 预估 token 消耗
  public readonly estimatedTokens = (input: any) => {
    const textLength = input.text?.length || 0;
    return Math.ceil(textLength / 2) + 1000; // 基础消耗 + 输入
  };

  /**
   * 执行人性化润色
   */
  public async execute(
    context: Context,
    input: {
      text: string;
      textType?: 'dialogue' | 'action' | 'description' | 'narration';
      characterName?: string;
    }
  ): Promise<HumanizeResult> {
    if (!input.text || input.text.trim().length === 0) {
      throw new Error('输入文本为空');
    }

    try {
      // 从上下文获取数据
      const creativeIntent = (context as any).creativeIntent || {};
      const currentScene = (context as any).currentScene;
      const characterProfile = (context as any).characterProfile;

      // 构建润色提示词
      const prompt = this.buildHumanizePrompt(
        input.text,
        input.textType,
        input.characterName,
        creativeIntent,
        characterProfile
      );

      // 调用 AI 进行润色
      const response = await callZhipuAI(
        [
          {
            role: 'system',
            content: `你是一位资深的剧本编辑，擅长识别和去除 AI 生成文本的痕迹，使其更自然、更人性化。

常见的 AI 味特征：
1. **过度修饰**：堆砌形容词、副词，如"深深地"、"静静地"、"缓缓地"
2. **套路化表达**：固定搭配过多，如"眼神中流露出"、"嘴角扬起一抹"
3. **情绪标签化**：直接说"愤怒"、"悲伤"，而非通过行为展现
4. **过于完整**：句子结构过于工整，缺乏口语化的停顿和省略
5. **缺乏个性**：所有人物说话风格相似，缺乏独特性
6. **过度解释**：把所有细节都说清楚，缺乏留白
7. **文学腔**：过于书面化，不符合口语习惯

人性化原则：
1. **简洁直接**：删除冗余修饰，保留核心意思
2. **口语化**：使用日常用语，避免书面语
3. **展现而非告知**：通过行为、对话展现情绪，而非直接说明
4. **不完美**：保留一些不完整的句子、停顿、重复
5. **个性化**：根据人物性格调整表达方式
6. **留白**：不把所有细节都说清楚，给读者想象空间

请返回 JSON 格式：
{
  "humanized": "润色后的文本",
  "aiFlavorBefore": {
    "score": 75,
    "indicators": [
      {
        "type": "过度修饰",
        "description": "使用了过多的形容词",
        "examples": ["深深地", "静静地"]
      }
    ]
  },
  "aiFlavorAfter": {
    "score": 30,
    "indicators": []
  },
  "changes": [
    {
      "type": "删除冗余修饰",
      "before": "他深深地叹了一口气",
      "after": "他叹气",
      "reason": "删除'深深地'，更简洁自然"
    }
  ],
  "explanation": "主要去除了过度修饰和套路化表达，使文本更简洁自然"
}`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        {
          model: 'glm-4-plus',
          temperature: 0.6, // 适中的温度，保持创造性但不过度
          maxTokens: 2000,
        }
      );

      // 解析 AI 响应
      const aiContent =
        'isFallback' in response
          ? response.content
          : response.choices[0].message.content;
      const result = this.parseResponse(aiContent, input.text);

      return result;
    } catch (error) {
      console.error('[HumanizeSkill] 人性化润色失败:', error);

      // 返回降级结果
      return this.getFallbackResult(input.text);
    }
  }

  /**
   * 构建润色提示词
   */
  private buildHumanizePrompt(
    text: string,
    textType?: string,
    characterName?: string,
    creativeIntent?: any,
    characterProfile?: any
  ): string {
    const typeDesc = textType
      ? `文本类型：${this.getTypeDescription(textType)}`
      : '';

    const characterDesc = characterName && characterProfile
      ? `
人物：${characterName}
性格：${characterProfile.personality || '未知'}
说话风格：${characterProfile.speechStyle || '未知'}
`
      : '';

    const intentDesc = creativeIntent
      ? `
创作意图：
- 类型：${creativeIntent.genre || '未指定'}
- 基调：${creativeIntent.tone || '未指定'}
`
      : '';

    return `${typeDesc}
${characterDesc}
${intentDesc}

原始文本：
${text}

请去除 AI 味，使其更自然、更人性化。`;
  }

  /**
   * 获取文本类型描述
   */
  private getTypeDescription(textType: string): string {
    const descriptions: Record<string, string> = {
      dialogue: '对白（人物对话）',
      action: '动作描写',
      description: '场景描写',
      narration: '旁白叙述',
    };
    return descriptions[textType] || textType;
  }

  /**
   * 解析 AI 响应
   */
  private parseResponse(content: string, originalText: string): HumanizeResult {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        return {
          original: originalText,
          humanized: parsed.humanized || originalText,
          aiFlavorBefore: parsed.aiFlavorBefore || {
            score: 50,
            indicators: [],
          },
          aiFlavorAfter: parsed.aiFlavorAfter || {
            score: 30,
            indicators: [],
          },
          changes: parsed.changes || [],
          explanation: parsed.explanation || '',
        };
      }
    } catch (e) {
      console.error('[HumanizeSkill] JSON 解析失败:', e);
    }

    // 解析失败，返回降级结果
    return this.getFallbackResult(originalText);
  }

  /**
   * 获取降级结果
   */
  private getFallbackResult(originalText: string): HumanizeResult {
    return {
      original: originalText,
      humanized: originalText,
      aiFlavorBefore: {
        score: 50,
        indicators: [],
      },
      aiFlavorAfter: {
        score: 50,
        indicators: [],
      },
      changes: [],
      explanation: '润色失败，返回原始文本',
    };
  }

  /**
   * 快速检测 AI 味（不调用 LLM）
   */
  public quickDetectAIFlavor(text: string): AIFlavorDetection {
    const indicators: AIFlavorDetection['indicators'] = [];
    let score = 0;

    // 检测过度修饰
    const excessiveModifiers = ['深深地', '静静地', '缓缓地', '轻轻地', '慢慢地'];
    const foundModifiers = excessiveModifiers.filter((mod) => text.includes(mod));
    if (foundModifiers.length > 0) {
      score += foundModifiers.length * 10;
      indicators.push({
        type: '过度修饰',
        description: '使用了过多的副词修饰',
        examples: foundModifiers,
      });
    }

    // 检测套路化表达
    const clichePhrases = [
      '眼神中流露出',
      '嘴角扬起一抹',
      '心中涌起',
      '不禁感到',
    ];
    const foundCliches = clichePhrases.filter((phrase) => text.includes(phrase));
    if (foundCliches.length > 0) {
      score += foundCliches.length * 15;
      indicators.push({
        type: '套路化表达',
        description: '使用了常见的 AI 套路表达',
        examples: foundCliches,
      });
    }

    // 检测情绪标签
    const emotionLabels = ['愤怒', '悲伤', '喜悦', '恐惧', '惊讶'];
    const foundEmotions = emotionLabels.filter((emotion) => text.includes(emotion));
    if (foundEmotions.length > 0) {
      score += foundEmotions.length * 8;
      indicators.push({
        type: '情绪标签化',
        description: '直接使用情绪词汇，而非通过行为展现',
        examples: foundEmotions,
      });
    }

    return {
      score: Math.min(score, 100),
      indicators,
    };
  }
}
