/* ==================================================
   节奏分析技能
   Rhythm Analyze Skill
   ================================================== */

import { Skill, Context, ContextRequirement } from '../core/types';
import { callZhipuAI } from '@/lib/zhipu';

/**
 * 节奏分析结果
 */
export interface RhythmAnalysis {
  overallPace: 'slow' | 'moderate' | 'fast' | 'varied';
  paceScore: number; // 0-100
  scenes: Array<{
    sceneId: string;
    sceneNumber: number;
    pace: 'slow' | 'moderate' | 'fast';
    duration: number;
    intensity: number; // 0-10
    issues: string[];
  }>;
  insights: string[];
  suggestions: string[];
  visualization: {
    labels: string[]; // 场景标签
    paceData: number[]; // 节奏数据
    intensityData: number[]; // 强度数据
  };
}

/**
 * 节奏分析技能
 * 分析剧本的节奏变化，识别节奏问题，提供优化建议
 */
export class RhythmAnalyzeSkill implements Skill {
  public readonly id = 'rhythm-analyze';
  public readonly name = '节奏分析';
  public readonly description = '分析剧本的节奏变化，识别节奏问题（过快、过慢、单调），提供优化建议';
  public readonly category = 'analysis';
  public readonly metadata = {
    version: '1.0.0',
    author: '剧灵',
    tags: ['rhythm', 'pacing', 'analysis', 'structure'],
    confidence: 0.82,
  };

  // 上下文需求：需要剧情大纲、创作意图、当前场景（可选）
  public readonly requiredContext: ContextRequirement[] = [
    { type: 'plotOutline' },
    { type: 'creativeIntent' },
    { type: 'currentScene' }, // 可选，用于高亮当前场景
  ];

  // 输入 Schema
  public readonly inputSchema = {
    sceneRange: {
      type: 'object',
      properties: {
        start: { type: 'number' },
        end: { type: 'number' },
      },
      required: false,
    },
    focusSceneId: { type: 'string', required: false },
  };

  // 输出 Schema
  public readonly outputSchema = {
    overallPace: { type: 'string', enum: ['slow', 'moderate', 'fast', 'varied'] },
    paceScore: { type: 'number', min: 0, max: 100 },
    scenes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          sceneId: { type: 'string' },
          sceneNumber: { type: 'number' },
          pace: { type: 'string', enum: ['slow', 'moderate', 'fast'] },
          duration: { type: 'number' },
          intensity: { type: 'number', min: 0, max: 10 },
          issues: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    insights: { type: 'array', items: { type: 'string' } },
    suggestions: { type: 'array', items: { type: 'string' } },
    visualization: {
      type: 'object',
      properties: {
        labels: { type: 'array', items: { type: 'string' } },
        paceData: { type: 'array', items: { type: 'number' } },
        intensityData: { type: 'array', items: { type: 'number' } },
      },
    },
  };

  // 预估 token 消耗
  public readonly estimatedTokens = (input: any) => {
    // 节奏分析需要处理整个剧情大纲，token 消耗较高
    return 3000;
  };

  /**
   * 执行节奏分析
   */
  public async execute(
    context: Context,
    input: {
      sceneRange?: { start: number; end: number };
      focusSceneId?: string;
    } = {}
  ): Promise<RhythmAnalysis> {
    try {
      // 从上下文获取数据
      const plotOutline = (context as any).plotOutline || [];
      const creativeIntent = (context as any).creativeIntent || {};
      const currentScene = (context as any).currentScene;

      if (!plotOutline || plotOutline.length === 0) {
        throw new Error('剧情大纲为空，无法进行节奏分析');
      }

      // 过滤场景范围
      const scenesToAnalyze = this.filterScenes(plotOutline, input.sceneRange);

      // 构建分析提示词
      const prompt = this.buildAnalysisPrompt(scenesToAnalyze, creativeIntent);

      // 调用 AI 进行分析
      const response = await callZhipuAI(
        [
          {
            role: 'system',
            content: `你是一位资深的剧本结构分析师，擅长分析剧本的节奏和张力变化。

节奏分析维度：
1. **节奏快慢**：场景推进速度（slow/moderate/fast）
2. **情绪强度**：场景的情绪张力（0-10 分）
3. **节奏变化**：是否有起伏，避免单调
4. **结构合理性**：高潮、低谷的分布是否合理

分析原则：
- 好的剧本应该有节奏变化，避免一直快或一直慢
- 高潮前应该有铺垫（节奏渐快）
- 高潮后应该有缓冲（节奏放缓）
- 开场和结尾的节奏要特别注意

请返回 JSON 格式：
{
  "overallPace": "slow/moderate/fast/varied",
  "paceScore": 75,
  "scenes": [
    {
      "sceneNumber": 1,
      "pace": "moderate",
      "intensity": 5,
      "issues": ["节奏偏慢，可以加快推进"]
    }
  ],
  "insights": ["整体节奏较为平稳，但缺乏高潮"],
  "suggestions": ["建议在第 5 场增加冲突，提升张力"]
}`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        {
          model: 'glm-4-plus',
          temperature: 0.3, // 分析类任务使用较低温度
          maxTokens: 3000,
        }
      );

      // 解析 AI 响应
      const aiContent =
        'isFallback' in response
          ? response.content
          : response.choices[0].message.content;
      const analysis = this.parseResponse(aiContent, scenesToAnalyze);

      // 生成可视化数据
      const visualization = this.generateVisualization(analysis.scenes);

      return {
        ...analysis,
        visualization,
      };
    } catch (error) {
      console.error('[RhythmAnalyzeSkill] 节奏分析失败:', error);

      // 返回降级结果
      return this.getFallbackAnalysis(context);
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
   * 构建分析提示词
   */
  private buildAnalysisPrompt(scenes: any[], creativeIntent: any): string {
    const sceneDescriptions = scenes
      .map(
        (scene, index) =>
          `场景 ${scene.sceneNumber}：${scene.summary || '无摘要'}
出场人物：${scene.characters?.join('、') || '未知'}
关键剧情点：${scene.plotPoints?.join('；') || '无'}`
      )
      .join('\n\n');

    const intentDesc = `
创作意图：
- 类型：${creativeIntent.genre || '未指定'}
- 基调：${creativeIntent.tone || '未指定'}
- 主题：${creativeIntent.themes?.join('、') || '未指定'}
`;

    return `${intentDesc}

剧情大纲：
${sceneDescriptions}

请分析以上场景的节奏变化，评估节奏是否合理，并提供优化建议。`;
  }

  /**
   * 解析 AI 响应
   */
  private parseResponse(content: string, scenes: any[]): Omit<RhythmAnalysis, 'visualization'> {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        // 补充 sceneId
        const scenesWithId = (parsed.scenes || []).map((scene: any, index: number) => ({
          ...scene,
          sceneId: scenes[index]?.sceneId || `scene-${index}`,
          duration: scenes[index]?.duration || 0,
        }));

        return {
          overallPace: parsed.overallPace || 'moderate',
          paceScore: parsed.paceScore || 60,
          scenes: scenesWithId,
          insights: parsed.insights || [],
          suggestions: parsed.suggestions || [],
        };
      }
    } catch (e) {
      console.error('[RhythmAnalyzeSkill] JSON 解析失败:', e);
    }

    // 解析失败，返回基础分析
    return {
      overallPace: 'moderate',
      paceScore: 60,
      scenes: scenes.map((scene) => ({
        sceneId: scene.sceneId,
        sceneNumber: scene.sceneNumber,
        pace: 'moderate' as const,
        duration: 0,
        intensity: 5,
        issues: [],
      })),
      insights: ['AI 分析失败，返回基础数据'],
      suggestions: [],
    };
  }

  /**
   * 生成可视化数据
   */
  private generateVisualization(scenes: RhythmAnalysis['scenes']): RhythmAnalysis['visualization'] {
    const labels = scenes.map((scene) => `场景 ${scene.sceneNumber}`);

    // 将 pace 转换为数值
    const paceData = scenes.map((scene) => {
      switch (scene.pace) {
        case 'slow':
          return 3;
        case 'moderate':
          return 6;
        case 'fast':
          return 9;
        default:
          return 6;
      }
    });

    const intensityData = scenes.map((scene) => scene.intensity);

    return {
      labels,
      paceData,
      intensityData,
    };
  }

  /**
   * 获取降级分析结果
   */
  private getFallbackAnalysis(context: Context): RhythmAnalysis {
    const plotOutline = (context as any).plotOutline || [];

    return {
      overallPace: 'moderate',
      paceScore: 60,
      scenes: plotOutline.map((scene: any) => ({
        sceneId: scene.sceneId,
        sceneNumber: scene.sceneNumber,
        pace: 'moderate' as const,
        duration: 0,
        intensity: 5,
        issues: [],
      })),
      insights: ['分析失败，返回默认数据'],
      suggestions: [],
      visualization: {
        labels: plotOutline.map((scene: any) => `场景 ${scene.sceneNumber}`),
        paceData: plotOutline.map(() => 6),
        intensityData: plotOutline.map(() => 5),
      },
    };
  }
}
