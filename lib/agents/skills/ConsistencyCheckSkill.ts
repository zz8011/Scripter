/* ==================================================
   一致性检查技能
   Consistency Check Skill
   ================================================== */

import { Skill, Context, ContextRequirement } from '../core/types';
import { callZhipuAI } from '@/lib/zhipu';

/**
 * 一致性问题类型
 */
export type ConsistencyIssueType =
  | 'character' // 人物一致性
  | 'plot' // 剧情一致性
  | 'world' // 世界观一致性
  | 'timeline' // 时间线一致性
  | 'logic'; // 逻辑一致性

/**
 * 一致性问题
 */
export interface ConsistencyIssue {
  type: ConsistencyIssueType;
  severity: 'low' | 'medium' | 'high';
  sceneId?: string;
  sceneNumber?: number;
  description: string;
  details: string;
  suggestion: string;
}

/**
 * 一致性检查结果
 */
export interface ConsistencyCheckResult {
  overallScore: number; // 0-100
  issueCount: number;
  issues: ConsistencyIssue[];
  summary: string;
  recommendations: string[];
  breakdown: {
    character: number; // 人物一致性得分
    plot: number; // 剧情一致性得分
    world: number; // 世界观一致性得分
    timeline: number; // 时间线一致性得分
    logic: number; // 逻辑一致性得分
  };
}

/**
 * 一致性检查技能
 * 检查剧本中的一致性问题，包括人物、剧情、世界观、时间线、逻辑等
 */
export class ConsistencyCheckSkill implements Skill {
  public readonly id = 'consistency-check';
  public readonly name = '一致性检查';
  public readonly description = '检查剧本中的一致性问题，包括人物性格、剧情逻辑、世界观设定、时间线等';
  public readonly category = 'analysis';
  public readonly metadata = {
    version: '1.0.0',
    author: '剧灵',
    tags: ['consistency', 'quality', 'analysis', 'validation'],
    confidence: 0.88,
  };

  // 上下文需求：需要所有人物、剧情大纲、世界观规则
  public readonly requiredContext: ContextRequirement[] = [
    { type: 'allCharacters' },
    { type: 'plotOutline' },
    { type: 'worldRules' },
    { type: 'creativeIntent' },
  ];

  // 输入 Schema
  public readonly inputSchema = {
    checkTypes: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['character', 'plot', 'world', 'timeline', 'logic'],
      },
      required: false,
    },
    sceneRange: {
      type: 'object',
      properties: {
        start: { type: 'number' },
        end: { type: 'number' },
      },
      required: false,
    },
  };

  // 输出 Schema
  public readonly outputSchema = {
    overallScore: { type: 'number', min: 0, max: 100 },
    issueCount: { type: 'number' },
    issues: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          severity: { type: 'string', enum: ['low', 'medium', 'high'] },
          sceneId: { type: 'string' },
          sceneNumber: { type: 'number' },
          description: { type: 'string' },
          details: { type: 'string' },
          suggestion: { type: 'string' },
        },
      },
    },
    summary: { type: 'string' },
    recommendations: { type: 'array', items: { type: 'string' } },
    breakdown: {
      type: 'object',
      properties: {
        character: { type: 'number' },
        plot: { type: 'number' },
        world: { type: 'number' },
        timeline: { type: 'number' },
        logic: { type: 'number' },
      },
    },
  };

  // 预估 token 消耗
  public readonly estimatedTokens = (input: any) => {
    // 一致性检查需要处理大量数据，token 消耗较高
    return 4000;
  };

  /**
   * 执行一致性检查
   */
  public async execute(
    context: Context,
    input: {
      checkTypes?: ConsistencyIssueType[];
      sceneRange?: { start: number; end: number };
    } = {}
  ): Promise<ConsistencyCheckResult> {
    try {
      // 从上下文获取数据
      const allCharacters = (context as any).allCharacters || [];
      const plotOutline = (context as any).plotOutline || [];
      const worldRules = (context as any).worldRules || {};
      const creativeIntent = (context as any).creativeIntent || {};

      if (plotOutline.length === 0) {
        throw new Error('剧情大纲为空，无法进行一致性检查');
      }

      // 过滤场景范围
      const scenesToCheck = this.filterScenes(plotOutline, input.sceneRange);

      // 构建检查提示词
      const prompt = this.buildCheckPrompt(
        allCharacters,
        scenesToCheck,
        worldRules,
        creativeIntent,
        input.checkTypes
      );

      // 调用 AI 进行检查
      const response = await callZhipuAI(
        [
          {
            role: 'system',
            content: `你是一位资深的剧本质量审查专家，擅长发现剧本中的一致性问题。

检查维度：
1. **人物一致性**：人物性格、行为、说话风格是否前后一致
2. **剧情一致性**：剧情发展是否合理，有无前后矛盾
3. **世界观一致性**：是否符合世界观设定，有无违反规则
4. **时间线一致性**：时间顺序是否合理，有无时间错乱
5. **逻辑一致性**：因果关系是否合理，有无逻辑漏洞

问题严重度：
- high: 严重问题，影响剧本质量，必须修改
- medium: 中等问题，建议修改
- low: 轻微问题，可以忽略

请返回 JSON 格式：
{
  "overallScore": 85,
  "issues": [
    {
      "type": "character",
      "severity": "high",
      "sceneNumber": 3,
      "description": "人物性格前后不一致",
      "details": "李明在第 1 场表现勇敢，但在第 3 场却表现胆怯",
      "suggestion": "建议在第 3 场增加铺垫，解释李明为何胆怯"
    }
  ],
  "summary": "整体一致性良好，发现 2 个需要注意的问题",
  "recommendations": ["建议统一人物性格描写"],
  "breakdown": {
    "character": 80,
    "plot": 90,
    "world": 85,
    "timeline": 95,
    "logic": 88
  }
}`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        {
          model: 'glm-4-plus',
          temperature: 0.2, // 检查类任务使用低温度，确保准确性
          maxTokens: 4000,
        }
      );

      // 解析 AI 响应
      const aiContent =
        'isFallback' in response
          ? response.content
          : response.choices[0].message.content;
      const result = this.parseResponse(aiContent, scenesToCheck);

      return result;
    } catch (error) {
      console.error('[ConsistencyCheckSkill] 一致性检查失败:', error);

      // 返回降级结果
      return this.getFallbackResult();
    }
  }

  /**
   * 过滤场景范围
   */
  private filterScenes(
    plotOutline: any[],
    sceneRange?: { start: number; end: number }
  ): any[] {
    if (!sceneRange) {
      return plotOutline;
    }

    return plotOutline.filter(
      (scene) =>
        scene.sceneNumber >= sceneRange.start &&
        scene.sceneNumber <= sceneRange.end
    );
  }

  /**
   * 构建检查提示词
   */
  private buildCheckPrompt(
    characters: any[],
    scenes: any[],
    worldRules: any,
    creativeIntent: any,
    checkTypes?: ConsistencyIssueType[]
  ): string {
    const checkTypesDesc = checkTypes
      ? `重点检查：${checkTypes.join('、')}`
      : '全面检查所有维度';

    const charactersDesc = characters
      .map(
        (char) =>
          `${char.name}：${char.personality || '无性格描述'}（${char.role || '未知角色'}）`
      )
      .join('\n');

    const worldRulesDesc = `
世界观规则：
- 时代背景：${worldRules.era || '未指定'}
- 地理环境：${worldRules.geography || '未指定'}
- 社会规则：${worldRules.socialRules || '未指定'}
- 约束条件：${worldRules.constraints?.join('；') || '无'}
`;

    const scenesDesc = scenes
      .map(
        (scene) =>
          `场景 ${scene.sceneNumber}：${scene.summary || '无摘要'}
出场人物：${scene.characters?.join('、') || '未知'}
关键剧情点：${scene.plotPoints?.join('；') || '无'}`
      )
      .join('\n\n');

    return `${checkTypesDesc}

人物列表：
${charactersDesc}

${worldRulesDesc}

剧情大纲：
${scenesDesc}

请检查以上内容的一致性，找出所有问题并提供修改建议。`;
  }

  /**
   * 解析 AI 响应
   */
  private parseResponse(
    content: string,
    scenes: any[]
  ): ConsistencyCheckResult {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        // 补充 sceneId
        const issuesWithId = (parsed.issues || []).map((issue: any) => {
          const scene = scenes.find((s) => s.sceneNumber === issue.sceneNumber);
          return {
            ...issue,
            sceneId: scene?.sceneId || undefined,
          };
        });

        return {
          overallScore: parsed.overallScore || 80,
          issueCount: issuesWithId.length,
          issues: issuesWithId,
          summary: parsed.summary || '一致性检查完成',
          recommendations: parsed.recommendations || [],
          breakdown: parsed.breakdown || {
            character: 80,
            plot: 80,
            world: 80,
            timeline: 80,
            logic: 80,
          },
        };
      }
    } catch (e) {
      console.error('[ConsistencyCheckSkill] JSON 解析失败:', e);
    }

    // 解析失败，返回基础结果
    return this.getFallbackResult();
  }

  /**
   * 获取降级结果
   */
  private getFallbackResult(): ConsistencyCheckResult {
    return {
      overallScore: 80,
      issueCount: 0,
      issues: [],
      summary: '检查失败，返回默认数据',
      recommendations: [],
      breakdown: {
        character: 80,
        plot: 80,
        world: 80,
        timeline: 80,
        logic: 80,
      },
    };
  }
}
