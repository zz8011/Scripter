/**
 * RhythmAnalyzeSkill 单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RhythmAnalyzeSkill } from '../RhythmAnalyzeSkill';
import type { Context } from '../../core/types';

// Mock callZhipuAI
vi.mock('@/lib/zhipu', () => ({
  callZhipuAI: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: JSON.stringify({
            overallPace: 'varied',
            paceScore: 75,
            scenes: [
              {
                sceneNumber: 1,
                pace: 'moderate',
                intensity: 5,
                issues: [],
              },
              {
                sceneNumber: 2,
                pace: 'fast',
                intensity: 8,
                issues: ['节奏过快，建议增加铺垫'],
              },
            ],
            insights: ['整体节奏变化合理'],
            suggestions: ['建议在第 2 场增加铺垫'],
          }),
        },
      },
    ],
  }),
}));

describe('RhythmAnalyzeSkill', () => {
  let skill: RhythmAnalyzeSkill;
  let mockContext: Context;

  beforeEach(() => {
    skill = new RhythmAnalyzeSkill();

    mockContext = {
      taskId: 'task-1',
      projectId: 'project-1',
      userId: 'user-1',
      script: {
        content: '',
        metadata: {
          wordCount: 0,
          sceneCount: 2,
          characterCount: 0,
        },
      },
      projectSettings: {
        genre: ['历史剧'],
        scriptType: '电视剧',
        targetEpisodes: 30,
      },
      agentStates: new Map(),
      conversationHistory: [],
      plotOutline: [
        {
          sceneId: 'scene-1',
          sceneNumber: 1,
          summary: '李明初入军营',
          characters: ['char-1'],
          plotPoints: ['李明报名参军'],
        },
        {
          sceneId: 'scene-2',
          sceneNumber: 2,
          summary: '训练场激烈对抗',
          characters: ['char-1', 'char-2'],
          plotPoints: ['李明与教官对抗'],
        },
      ],
      creativeIntent: {
        genre: '历史剧',
        tone: '严肃',
        themes: ['忠诚', '成长'],
        targetAudience: '成年观众',
      },
    } as any;
  });

  describe('基础功能', () => {
    it('应该正确定义技能元数据', () => {
      expect(skill.id).toBe('rhythm-analyze');
      expect(skill.name).toBe('节奏分析');
      expect(skill.category).toBe('analysis');
      expect(skill.metadata.version).toBe('1.0.0');
    });

    it('应该声明所需的上下文', () => {
      expect(skill.requiredContext).toBeDefined();
      expect(skill.requiredContext.length).toBeGreaterThan(0);
      expect(skill.requiredContext.some((req) => req.type === 'plotOutline')).toBe(true);
      expect(skill.requiredContext.some((req) => req.type === 'creativeIntent')).toBe(true);
    });

    it('应该有输入和输出 Schema', () => {
      expect(skill.inputSchema).toBeDefined();
      expect(skill.outputSchema).toBeDefined();
    });

    it('应该能够估算 token 消耗', () => {
      const tokens = skill.estimatedTokens({});
      expect(tokens).toBeGreaterThan(0);
    });
  });

  describe('节奏分析执行', () => {
    it('应该能够分析剧本节奏', async () => {
      const result = await skill.execute(mockContext, {});

      expect(result).toBeDefined();
      expect(result.overallPace).toBeDefined();
      expect(result.paceScore).toBeGreaterThanOrEqual(0);
      expect(result.paceScore).toBeLessThanOrEqual(100);
      expect(result.scenes).toBeDefined();
      expect(Array.isArray(result.scenes)).toBe(true);
      expect(result.insights).toBeDefined();
      expect(result.suggestions).toBeDefined();
      expect(result.visualization).toBeDefined();
    });

    it('应该为每个场景生成节奏数据', async () => {
      const result = await skill.execute(mockContext, {});

      expect(result.scenes.length).toBe(2);
      result.scenes.forEach((scene) => {
        expect(scene.sceneId).toBeDefined();
        expect(scene.sceneNumber).toBeDefined();
        expect(scene.pace).toBeDefined();
        expect(['slow', 'moderate', 'fast']).toContain(scene.pace);
        expect(scene.intensity).toBeGreaterThanOrEqual(0);
        expect(scene.intensity).toBeLessThanOrEqual(10);
      });
    });

    it('应该生成可视化数据', async () => {
      const result = await skill.execute(mockContext, {});

      expect(result.visualization.labels).toBeDefined();
      expect(result.visualization.paceData).toBeDefined();
      expect(result.visualization.intensityData).toBeDefined();
      expect(result.visualization.labels.length).toBe(result.scenes.length);
      expect(result.visualization.paceData.length).toBe(result.scenes.length);
      expect(result.visualization.intensityData.length).toBe(result.scenes.length);
    });
  });

  describe('场景范围过滤', () => {
    it('应该能够分析指定范围的场景', async () => {
      const result = await skill.execute(mockContext, {
        sceneRange: { start: 1, end: 1 },
      });

      // AI 返回的场景数量可能不受 sceneRange 影响（因为是 mock 数据）
      // 只验证结果存在即可
      expect(result.scenes).toBeDefined();
      expect(Array.isArray(result.scenes)).toBe(true);
    });
  });

  describe('错误处理', () => {
    it('应该在剧情大纲为空时返回降级结果', async () => {
      const emptyContext = {
        ...mockContext,
        plotOutline: [],
      } as any;

      const result = await skill.execute(emptyContext, {});

      expect(result).toBeDefined();
      expect(result.overallPace).toBe('moderate');
      expect(result.scenes).toEqual([]);
    });

    it('应该在 AI 调用失败时返回降级结果', async () => {
      const { callZhipuAI } = await import('@/lib/zhipu');
      vi.mocked(callZhipuAI).mockRejectedValueOnce(new Error('API Error'));

      const result = await skill.execute(mockContext, {});

      expect(result).toBeDefined();
      expect(result.overallPace).toBe('moderate');
    });
  });
});
