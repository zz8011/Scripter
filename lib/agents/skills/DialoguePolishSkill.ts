/* ==================================================
   对白润色技能
   Dialogue Polish Skill
   ================================================== */

import { Skill, Context, ContextRequirement } from '../core/types';
import { callZhipuAI } from '@/lib/zhipu';

/**
 * 润色选项
 */
export interface PolishOption {
  id: string;
  label: string;
  description: string;
  style: 'natural' | 'dramatic' | 'concise' | 'poetic';
}

/**
 * 对白润色技能
 * 优化对白表达，保持人物性格一致性
 */
export class DialoguePolishSkill implements Skill {
  public readonly id = 'dialogue-polish';
  public readonly name = '对白润色';
  public readonly description = '优化对白表达，保持人物性格一致性，提供多个润色选项';
  public readonly category = 'writing';
  public readonly metadata = {
    version: '1.0.0',
    author: '剧灵',
    tags: ['dialogue', 'polish', 'writing', 'style'],
    confidence: 0.85,
  };

  // 上下文需求：需要当前场景、人物档案和相邻场景（用于理解对话上下文）
  public readonly requiredContext: ContextRequirement[] = [
    { type: 'currentScene' },
    { type: 'characterProfile' },
    { type: 'adjacentScenes', range: 1 }
  ];

  // 输入 Schema
  public readonly inputSchema = {
    dialogue: { type: 'string', required: true },
    characterName: { type: 'string', required: true },
    characterProfile: { type: 'object', required: false },
    sceneContext: { type: 'string', required: false },
    style: { type: 'string', enum: ['natural', 'dramatic', 'concise', 'poetic'], required: false }
  };

  // 输出 Schema
  public readonly outputSchema = {
    original: { type: 'string' },
    polished: { type: 'string' },
    alternatives: { type: 'array', items: { type: 'string' } },
    explanation: { type: 'string' }
  };

  // 预估 token 消耗
  public readonly estimatedTokens = (input: any) => {
    const dialogueLength = input.dialogue?.length || 0;
    const profileLength = JSON.stringify(input.characterProfile || {}).length;
    return Math.ceil((dialogueLength + profileLength) / 2) + 500; // 基础消耗 + 输入
  };

  /**
   * 执行对白润色
   */
  public async execute(
    context: Context,
    input: {
      dialogue: string;
      characterName: string;
      characterProfile?: {
        personality?: string[];
        speechStyle?: string;
        age?: number;
        occupation?: string;
      };
      sceneContext?: string;
      style?: 'natural' | 'dramatic' | 'concise' | 'poetic';
    }
  ): Promise<{
    original: string;
    polished: string;
    alternatives: string[];
    explanation: string;
  }> {
    if (!this.validateInput(input)) {
      throw new Error('输入格式不正确');
    }

    const { dialogue, characterName, characterProfile, sceneContext, style = 'natural' } = input;

    try {
      // 构建人物描述
      const characterDesc = this.buildCharacterDesc(characterProfile);

      // 调用 AI 进行润色
      const response = await callZhipuAI(
        [
          {
            role: 'system',
            content: `你是一位资深的剧本对白编辑。请优化以下对白，使其更符合人物性格和场景氛围。

润色原则：
1. 保持人物性格一致性 - 对白要符合人物的性格、年龄、职业
2. 符合场景氛围 - 对白的语气要适应当前场景的情绪
3. 自然流畅 - 避免过于书面化或生硬
4. 简洁有力 - 删除冗余词汇，保留核心意思
5. 口语化 - 符合中文口语习惯

润色风格：
- natural: 自然流畅，贴近生活
- dramatic: 戏剧化，情绪饱满
- concise: 简洁精炼，直击要点
- poetic: 诗意优美，富有文采

请返回 JSON 格式：
{
  "polished": "润色后的对白",
  "alternatives": ["备选1", "备选2", "备选3"],
  "explanation": "润色说明，解释为什么这样修改"
}`,
          },
          {
            role: 'user',
            content: `人物：${characterName}
${characterDesc}

场景：${sceneContext || '未指定'}

润色风格：${style}

原始对白：
"${dialogue}"

请润色这段对白。`,
          },
        ],
        {
          model: 'glm-4-plus',
          temperature: 0.7,
          maxTokens: 2000,
        }
      );

      // 解析 AI 响应
      const aiContent = 'isFallback' in response
        ? response.content
        : response.choices[0].message.content;
      const result = this.parseResponse(aiContent);

      return {
        original: dialogue,
        polished: result.polished || dialogue,
        alternatives: result.alternatives || [],
        explanation: result.explanation || '',
      };
    } catch (error) {
      console.error('[DialoguePolishSkill] 对白润色失败:', error);
      return {
        original: dialogue,
        polished: dialogue,
        alternatives: [],
        explanation: '润色失败，返回原始对白',
      };
    }
  }

  /**
   * 验证输入
   */
  protected validateInput(input: any): boolean {
    return (
      input &&
      typeof input.dialogue === 'string' &&
      input.dialogue.length > 0 &&
      typeof input.characterName === 'string' &&
      input.characterName.length > 0
    );
  }

  /**
   * 获取润色选项
   */
  public getPolishOptions(): PolishOption[] {
    return [
      {
        id: 'natural',
        label: '自然流畅',
        description: '贴近生活，口语化表达',
        style: 'natural',
      },
      {
        id: 'dramatic',
        label: '戏剧张力',
        description: '情绪饱满，富有感染力',
        style: 'dramatic',
      },
      {
        id: 'concise',
        label: '简洁精炼',
        description: '直击要点，删除冗余',
        style: 'concise',
      },
      {
        id: 'poetic',
        label: '诗意优美',
        description: '文采斐然，富有韵味',
        style: 'poetic',
      },
    ];
  }

  /**
   * 构建人物描述
   */
  private buildCharacterDesc(profile?: {
    personality?: string[];
    speechStyle?: string;
    age?: number;
    occupation?: string;
  }): string {
    if (!profile) return '';

    const parts: string[] = [];
    if (profile.age) parts.push(`年龄：${profile.age}岁`);
    if (profile.occupation) parts.push(`职业：${profile.occupation}`);
    if (profile.personality?.length) parts.push(`性格：${profile.personality.join('、')}`);
    if (profile.speechStyle) parts.push(`说话风格：${profile.speechStyle}`);

    return parts.length > 0 ? `人物特征：\n${parts.join('\n')}` : '';
  }

  /**
   * 解析 AI 响应
   */
  private parseResponse(content: string): {
    polished: string;
    alternatives: string[];
    explanation: string;
  } {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          polished: parsed.polished || '',
          alternatives: parsed.alternatives || [],
          explanation: parsed.explanation || '',
        };
      }
    } catch (e) {
      console.error('[DialoguePolishSkill] JSON 解析失败:', e);
    }

    return {
      polished: '',
      alternatives: [],
      explanation: '',
    };
  }
}
