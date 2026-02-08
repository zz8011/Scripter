/**
 * ConsistencyCheckSkill 单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConsistencyCheckSkill } from '../ConsistencyCheckSkill';
import type { Context } from '../../core/types';

// Mock callZhipuAI
vi.mock('@/lib/zhipu', () => ({
  callZhipuAI: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: JSON.stringify({
            overallScore: 85,
            issues: [
              {
                type: 'character',
                severity: 'medium',
                sceneNumber: 2,
                description: '人物性格前后不一致',
                details: '李明在第 1 场表现勇敢，但在第 2 场却表现胆怯',
                suggestion: '建议在第 2 场增加铺垫，解释李明为何胆怯',
              },
            ],
            summary: '整体一致性良好，发现 1 个需要注意的问题',
            recommendations: ['建议统一人物性格描写'],
            breakdown: {
              character: 80,
              plot: 90,
              world: 85,
              timeline: 95,
              logic: 88,
            },
          }),
        },
      },
    ],
  }),
}));

describe('ConsistencyCheckSkill', () => {
  let skill: ConsistencyCheckSkill;
  let mockContext: Context;

  beforeEach(() => {
    skill = new ConsistencyCheckSkill();

    mockContext = {
      taskId: 'task-1',
      projectId: 'project-1',
      userId: 'user-1',
      script: {
        content: '',
        metadata: {
          wordCount: 0,
          sceneCount: 2,
          characterCount: 2,
        },
      },
      projectSettings: {
        genre: ['历史剧'],
        scriptType: '电视剧',
        targetEpisodes: 30,
      },
      agentStates: new Map(),
      conversationHistory: [],
      allCharacters: [
        {
          id: 'char-1',
          name: '李明',
          role: 'protagonist',
          personality: '正直勇敢',
        },
        {
          id: 'char-2',
          name: '王刚',
          role: 'supporting',
          personality: '机智幽默',
        },
      ],
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
      worldRules: {
        era: '唐朝贞观年间',
        geography: '长安城及周边',
        socialRules: '严格的等级制度',
        constraints: ['不能使用现代科技', '需符合历史背景'],
      },
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
      expect(skill.id).toBe('consistency-check');
      expect(skill.name).toBe('一致性检查');
      expect(skill.category).toBe('analysis');
      expect(skill.metadata.version).toBe('1.0.0');
    });

    it('应该声明所需的上下文', () => {
      expect(skill.requiredContext).toBeDefined();
      expect(skill.requiredContext.length).toBeGreaterThan(0);
      expect(skill.requiredContext.some((req) => req.type === 'allCharacters')).toBe(true);
      expect(skill.requiredContext.some((req) => req.type === 'plotOutline')).toBe(true);
      expect(skill.requiredContext.some((req) => req.type === 'worldRules')).toBe(true);
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

  describe('一致性检查执行', () => {
    it('应该能够检查剧本一致性', async () => {
      const result = await skill.execute(mockContext, {});

      expect(result).toBeDefined();
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
      expect(result.issueCount).toBeDefined();
      expect(result.issues).toBeDefined();
      expect(Array.isArray(result.issues)).toBe(true);
      expect(result.summary).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(result.breakdown).toBeDefined();
    });

    it('应该返回各维度的得分', async () => {
      const result = await skill.execute(mockContext, {});

      expect(result.breakdown.character).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.character).toBeLessThanOrEqual(100);
      expect(result.breakdown.plot).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.plot).toBeLessThanOrEqual(100);
      expect(result.breakdown.world).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.world).toBeLessThanOrEqual(100);
      expect(result.breakdown.timeline).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.timeline).toBeLessThanOrEqual(100);
      expect(result.breakdown.logic).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.logic).toBeLessThanOrEqual(100);
    });

    it('应该返回一致性问题列表', async () => {
      const result = await skill.execute(mockContext, {});

      expect(result.issueCount).toBe(result.issues.length);
      result.issues.forEach((issue) => {
        expect(issue.type).toBeDefined();
        expect(['character', 'plot', 'world', 'timeline', 'logic']).toContain(issue.type);
        expect(issue.severity).toBeDefined();
        expect(['low', 'medium', 'high']).toContain(issue.severity);
        expect(issue.description).toBeDefined();
        expect(issue.details).toBeDefined();
        expect(issue.suggestion).toBeDefined();
      });
    });
  });

  describe('检查类型过滤', () => {
    it('应该能够只检查指定类型', async () => {
      const result = await skill.execute(mockContext, {
        checkTypes: ['character', 'plot'],
      });

      expect(result).toBeDefined();
      expect(result.issues).toBeDefined();
    });
  });

  describe('场景范围过滤', () => {
    it('应该能够检查指定范围的场景', async () => {
      const result = await skill.execute(mockContext, {
        sceneRange: { start: 1, end: 1 },
      });

      expect(result).toBeDefined();
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
      expect(result.overallScore).toBe(80);
      expect(result.issueCount).toBe(0);
    });

    it('应该在 AI 调用失败时返回降级结果', async () => {
      const { callZhipuAI } = await import('@/lib/zhipu');
      vi.mocked(callZhipuAI).mockRejectedValueOnce(new Error('API Error'));

      const result = await skill.execute(mockContext, {});

      expect(result).toBeDefined();
      expect(result.overallScore).toBe(80);
    });
  });
});
