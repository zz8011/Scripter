/* ==================================================
   场景扩展技能
   Scene Expand Skill
   ================================================== */

import { Skill } from './Skill';
import { Context } from '../core/types';
import { callZhipuAI } from '@/lib/zhipu';

/**
 * 扩展类型
 */
export type ExpandType = 'action' | 'description' | 'emotion' | 'dialogue';

/**
 * 场景扩展技能
 * 根据现有场景内容扩展，增加动作描述、环境描写
 */
export class SceneExpandSkill extends Skill {
  constructor() {
    super(
      '场景扩展',
      '根据现有场景内容扩展，增加动作描述、环境描写，保持情节连贯性',
      'writing',
      {
        version: '1.0.0',
        author: '剧灵',
        tags: ['scene', 'expand', 'writing', 'description'],
        confidence: 0.8,
      }
    );
  }

  /**
   * 执行场景扩展
   */
  public async execute(
    context: Context,
    input: {
      sceneContent: string;
      sceneHeading?: string;
      characters?: string[];
      expandType?: ExpandType;
      targetLength?: 'short' | 'medium' | 'long';
      focus?: string;
    }
  ): Promise<{
    original: string;
    expanded: string;
    additions: {
      type: ExpandType;
      content: string;
      position: 'before' | 'after' | 'inline';
    }[];
    explanation: string;
  }> {
    if (!this.validateInput(input)) {
      throw new Error('输入格式不正确');
    }

    const {
      sceneContent,
      sceneHeading,
      characters = [],
      expandType = 'action',
      targetLength = 'medium',
      focus,
    } = input;

    try {
      const response = await callZhipuAI(
        [
          {
            role: 'system',
            content: `你是一位资深的剧本扩展专家。请根据现有场景内容进行扩展，增加细节描写。

扩展原则：
1. 保持情节连贯 - 扩展内容要与原有情节自然衔接
2. 符合人物性格 - 动作和对话要符合人物设定
3. 增强画面感 - 增加视觉细节，让读者能"看到"场景
4. 控制节奏 - 扩展要有助于剧情推进，不拖沓

扩展类型：
- action: 增加动作描写，让人物动作更具体
- description: 增加环境描写，营造氛围
- emotion: 增加情绪描写，深化人物内心
- dialogue: 增加对白，丰富人物互动

目标长度：
- short: 小幅扩展，增加1-2个细节
- medium: 中等扩展，增加3-5个细节
- long: 大幅扩展，增加多个细节和层次

请返回 JSON 格式：
{
  "expanded": "扩展后的完整场景",
  "additions": [
    {
      "type": "action|description|emotion|dialogue",
      "content": "新增内容",
      "position": "before|after|inline",
      "reference": "参考的原文位置"
    }
  ],
  "explanation": "扩展说明"
}`,
          },
          {
            role: 'user',
            content: this.buildPrompt(sceneContent, sceneHeading, characters, expandType, targetLength, focus),
          },
        ],
        {
          model: 'glm-4-plus',
          temperature: 0.7,
          maxTokens: 4000,
        }
      );

      const result = this.parseResponse(response.choices[0].message.content);

      return {
        original: sceneContent,
        expanded: result.expanded || sceneContent,
        additions: result.additions || [],
        explanation: result.explanation || '',
      };
    } catch (error) {
      console.error('[SceneExpandSkill] 场景扩展失败:', error);
      return {
        original: sceneContent,
        expanded: sceneContent,
        additions: [],
        explanation: '扩展失败，返回原始场景',
      };
    }
  }

  /**
   * 验证输入
   */
  protected validateInput(input: any): boolean {
    return input && typeof input.sceneContent === 'string' && input.sceneContent.length > 0;
  }

  /**
   * 构建 Prompt
   */
  private buildPrompt(
    sceneContent: string,
    sceneHeading?: string,
    characters?: string[],
    expandType?: ExpandType,
    targetLength?: string,
    focus?: string
  ): string {
    const parts: string[] = [];

    if (sceneHeading) {
      parts.push(`场景标题：${sceneHeading}`);
    }

    if (characters?.length) {
      parts.push(`出场人物：${characters.join('、')}`);
    }

    parts.push(`扩展类型：${expandType}`);
    parts.push(`目标长度：${targetLength}`);

    if (focus) {
      parts.push(`扩展重点：${focus}`);
    }

    parts.push('\n原始场景内容：');
    parts.push(sceneContent);

    return parts.join('\n');
  }

  /**
   * 解析 AI 响应
   */
  private parseResponse(content: string): {
    expanded: string;
    additions: {
      type: ExpandType;
      content: string;
      position: 'before' | 'after' | 'inline';
      reference?: string;
    }[];
    explanation: string;
  } {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          expanded: parsed.expanded || '',
          additions: parsed.additions || [],
          explanation: parsed.explanation || '',
        };
      }
    } catch (e) {
      console.error('[SceneExpandSkill] JSON 解析失败:', e);
    }

    return {
      expanded: '',
      additions: [],
      explanation: '',
    };
  }

  /**
   * 获取扩展类型选项
   */
  public getExpandOptions(): { id: ExpandType; label: string; description: string }[] {
    return [
      {
        id: 'action',
        label: '动作描写',
        description: '增加人物动作细节，让场景更生动',
      },
      {
        id: 'description',
        label: '环境描写',
        description: '增加环境氛围描写，营造场景感',
      },
      {
        id: 'emotion',
        label: '情绪深化',
        description: '增加人物内心活动和情绪变化',
      },
      {
        id: 'dialogue',
        label: '对白丰富',
        description: '增加人物对话，丰富互动',
      },
    ];
  }
}
