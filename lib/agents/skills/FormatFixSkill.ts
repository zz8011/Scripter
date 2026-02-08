/* ==================================================
   格式修复技能
   Format Fix Skill
   ================================================== */

import { Skill, Context, ContextRequirement } from '../core/types';
import { callZhipuAI } from '@/lib/zhipu';

/**
 * 剧本格式错误类型
 */
export interface FormatError {
  type: 'scene-heading' | 'character' | 'dialogue' | 'action' | 'parenthetical';
  line: number;
  message: string;
  suggestion: string;
}

/**
 * 格式修复技能
 * 检查并修复剧本格式问题
 */
export class FormatFixSkill implements Skill {
  public readonly id = 'format-fix';
  public readonly name = '格式修复';
  public readonly description = '检查剧本格式是否符合规范，自动修复格式错误';
  public readonly category = 'editing';
  public readonly metadata = {
    version: '1.0.0',
    author: '剧灵',
    tags: ['format', 'fix', 'script', 'editing'],
    confidence: 0.9,
  };

  // 上下文需求：只需要选中的文本或当前场景
  public readonly requiredContext: ContextRequirement[] = [
    { type: 'selectedText' },
    { type: 'currentScene' }
  ];

  // 输入 Schema
  public readonly inputSchema = {
    content: { type: 'string', required: true },
    format: { type: 'string', enum: ['standard', 'short-drama'], required: false }
  };

  // 输出 Schema
  public readonly outputSchema = {
    fixed: { type: 'boolean' },
    content: { type: 'string' },
    errors: { type: 'array', items: { type: 'object' } },
    changes: { type: 'array', items: { type: 'string' } }
  };

  // 预估 token 消耗
  public readonly estimatedTokens = (input: any) => {
    const contentLength = input.content?.length || 0;
    return Math.ceil(contentLength / 2) + 300; // 基础消耗 + 输入
  };

  /**
   * 执行格式修复
   */
  public async execute(context: Context, input: { content: string; format?: 'standard' | 'short-drama' }): Promise<{
    fixed: boolean;
    content: string;
    errors: FormatError[];
    changes: string[];
  }> {
    if (!this.validateInput(input)) {
      throw new Error('输入格式不正确');
    }

    const { content, format = 'standard' } = input;

    // 构建 Prompt
    const prompt = this.buildPrompt(content, format);

    try {
      // 调用 AI 进行格式检查和修复
      const response = await callZhipuAI(
        [
          {
            role: 'system',
            content: `你是一位专业的剧本格式检查专家。请检查以下剧本内容，识别格式错误并提供修复建议。

检查规则：
1. 场景标题格式：**场X-Y 时间/内外 地点 主要人物**
   - 示例：场1-1 日/内 咖啡厅 李明、张华
2. 人物名格式：加粗，居中或左对齐，后不加冒号
   - 示例：**李明**
3. 对白格式：人物名下方，缩进或居中
   - 示例：今天天气真好。
4. 动作描述格式：靠左，不加特殊标记
   - 示例：李明走进咖啡厅，环顾四周。
5. 括号说明格式：括号内，位于人物名和对白之间
   - 示例：（激动地）

请返回 JSON 格式：
{
  "valid": boolean,
  "errors": [
    {
      "type": "scene-heading|character|dialogue|action|parenthetical",
      "line": number,
      "message": "错误描述",
      "suggestion": "修复建议"
    }
  ],
  "fixedContent": "修复后的剧本内容",
  "changes": ["变更描述1", "变更描述2"]
}`,
          },
          {
            role: 'user',
            content: `请检查以下剧本内容：\n\n${content}`,
          },
        ],
        {
          model: 'glm-4-flash',
          temperature: 0.3,
          maxTokens: 4000,
        }
      );

      // 解析 AI 响应
      const aiContent = 'isFallback' in response
        ? response.content
        : response.choices[0].message.content;
      const result = this.parseResponse(aiContent);

      return {
        fixed: result.errors.length > 0,
        content: result.fixedContent || content,
        errors: result.errors,
        changes: result.changes,
      };
    } catch (error) {
      console.error('[FormatFixSkill] 格式修复失败:', error);
      return {
        fixed: false,
        content,
        errors: [],
        changes: [],
      };
    }
  }

  /**
   * 验证输入
   */
  protected validateInput(input: any): boolean {
    return input && typeof input.content === 'string' && input.content.length > 0;
  }

  /**
   * 构建 Prompt
   */
  private buildPrompt(content: string, format: string): string {
    const formatRules =
      format === 'short-drama'
        ? '短剧格式：场景紧凑，对白精炼，动作描述简洁'
        : '标准剧本格式：完整的场景描述和人物动作';

    return `${formatRules}\n\n剧本内容：\n${content}`;
  }

  /**
   * 解析 AI 响应
   */
  private parseResponse(content: string): {
    valid: boolean;
    errors: FormatError[];
    fixedContent: string;
    changes: string[];
  } {
    try {
      // 尝试提取 JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          valid: parsed.valid ?? true,
          errors: parsed.errors || [],
          fixedContent: parsed.fixedContent || '',
          changes: parsed.changes || [],
        };
      }
    } catch (e) {
      console.error('[FormatFixSkill] JSON 解析失败:', e);
    }

    // 默认返回
    return {
      valid: true,
      errors: [],
      fixedContent: '',
      changes: [],
    };
  }
}
