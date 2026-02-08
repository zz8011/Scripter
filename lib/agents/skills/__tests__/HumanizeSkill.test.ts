/**
 * HumanizeSkill 单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HumanizeSkill } from '../HumanizeSkill';
import type { Context } from '../../core/types';

// Mock callZhipuAI
vi.mock('@/lib/zhipu', () => ({
  callZhipuAI: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: JSON.stringify({
            humanized: '他叹气，转身离开。',
            aiFlavorBefore: {
              score: 75,
              indicators: [
                {
                  type: '过度修饰',
                  description: '使用了过多的副词',
                  examples: ['深深地', '缓缓地'],
                },
              ],
            },
            aiFlavorAfter: {
              score: 30,
              indicators: [],
            },
            changes: [
              {
                type: '删除冗余修饰',
                before: '他深深地叹了一口气',
                after: '他叹气',
                reason: '删除"深深地"，更简洁自然',
              },
            ],
            explanation: '主要去除了过度修饰，使文本更简洁自然',
          }),
        },
      },
    ],
  }),
}));

describe('HumanizeSkill', () => {
  let skill: HumanizeSkill;
  let mockContext: Context;

  beforeEach(() => {
    skill = new HumanizeSkill();

    mockContext = {
      taskId: 'task-1',
      projectId: 'project-1',
      userId: 'user-1',
      script: {
        content: '',
        metadata: {
          wordCount: 0,
          sceneCount: 1,
          characterCount: 1,
        },
      },
      projectSettings: {
        genre: ['历史剧'],
        scriptType: '电视剧',
        targetEpisodes: 30,
      },
      agentStates: new Map(),
      conversationHistory: [],
      creativeIntent: {
        genre: '历史剧',
        tone: '严肃',
        themes: ['忠诚', '成长'],
        targetAudience: '成年观众',
      },
      currentScene: {
        id: 'scene-1',
        title: '军营初见',
        content: '李明走进军营...',
      },
      characterProfile: {
        id: 'char-1',
        name: '李明',
        personality: '正直勇敢',
        speechStyle: '简洁有力',
      },
    } as any;
  });

  describe('基础功能', () => {
    it('应该正确定义技能元数据', () => {
      expect(skill.id).toBe('humanize');
      expect(skill.name).toBe('人性化润色');
      expect(skill.category).toBe('editing');
      expect(skill.metadata.version).toBe('1.0.0');
    });

    it('应该声明所需的上下文', () => {
      expect(skill.requiredContext).toBeDefined();
      expect(skill.requiredContext.length).toBeGreaterThan(0);
      expect(skill.requiredContext.some((req) => req.type === 'creativeIntent')).toBe(true);
    });

    it('应该有输入和输出 Schema', () => {
      expect(skill.inputSchema).toBeDefined();
      expect(skill.outputSchema).toBeDefined();
    });

    it('应该能够估算 token 消耗', () => {
      const tokens = skill.estimatedTokens({ text: '这是一段测试文本' });
      expect(tokens).toBeGreaterThan(0);
    });
  });

  describe('人性化润色执行', () => {
    it('应该能够润色文本', async () => {
      const result = await skill.execute(mockContext, {
        text: '他深深地叹了一口气，缓缓地转身离开。',
      });

      expect(result).toBeDefined();
      expect(result.original).toBeDefined();
      expect(result.humanized).toBeDefined();
      expect(result.aiFlavorBefore).toBeDefined();
      expect(result.aiFlavorAfter).toBeDefined();
      expect(result.changes).toBeDefined();
      expect(result.explanation).toBeDefined();
    });

    it('应该返回 AI 味检测结果', async () => {
      const result = await skill.execute(mockContext, {
        text: '他深深地叹了一口气，缓缓地转身离开。',
      });

      expect(result.aiFlavorBefore.score).toBeGreaterThanOrEqual(0);
      expect(result.aiFlavorBefore.score).toBeLessThanOrEqual(100);
      expect(result.aiFlavorAfter.score).toBeGreaterThanOrEqual(0);
      expect(result.aiFlavorAfter.score).toBeLessThanOrEqual(100);
      expect(result.aiFlavorBefore.indicators).toBeDefined();
      expect(Array.isArray(result.aiFlavorBefore.indicators)).toBe(true);
    });

    it('应该返回修改列表', async () => {
      const result = await skill.execute(mockContext, {
        text: '他深深地叹了一口气，缓缓地转身离开。',
      });

      expect(Array.isArray(result.changes)).toBe(true);
      result.changes.forEach((change) => {
        expect(change.type).toBeDefined();
        expect(change.before).toBeDefined();
        expect(change.after).toBeDefined();
        expect(change.reason).toBeDefined();
      });
    });
  });

  describe('文本类型支持', () => {
    it('应该支持对白类型', async () => {
      const result = await skill.execute(mockContext, {
        text: '李明：我要去参军。',
        textType: 'dialogue',
        characterName: '李明',
      });

      expect(result).toBeDefined();
      expect(result.humanized).toBeDefined();
    });

    it('应该支持动作描写', async () => {
      const result = await skill.execute(mockContext, {
        text: '他深深地叹了一口气。',
        textType: 'action',
      });

      expect(result).toBeDefined();
      expect(result.humanized).toBeDefined();
    });

    it('应该支持场景描写', async () => {
      const result = await skill.execute(mockContext, {
        text: '夕阳西下，余晖洒满大地。',
        textType: 'description',
      });

      expect(result).toBeDefined();
      expect(result.humanized).toBeDefined();
    });
  });

  describe('快速 AI 味检测', () => {
    it('应该能够快速检测过度修饰', () => {
      const detection = skill.quickDetectAIFlavor('他深深地叹了一口气，缓缓地转身离开。');

      expect(detection.score).toBeGreaterThan(0);
      expect(detection.indicators.length).toBeGreaterThan(0);
      expect(detection.indicators.some((ind) => ind.type === '过度修饰')).toBe(true);
    });

    it('应该能够快速检测套路化表达', () => {
      const detection = skill.quickDetectAIFlavor('他的眼神中流露出一丝悲伤。');

      expect(detection.score).toBeGreaterThan(0);
      expect(detection.indicators.some((ind) => ind.type === '套路化表达')).toBe(true);
    });

    it('应该能够快速检测情绪标签', () => {
      const detection = skill.quickDetectAIFlavor('他感到愤怒和悲伤。');

      expect(detection.score).toBeGreaterThan(0);
      expect(detection.indicators.some((ind) => ind.type === '情绪标签化')).toBe(true);
    });

    it('应该对自然文本返回低分', () => {
      const detection = skill.quickDetectAIFlavor('他叹气，转身离开。');

      expect(detection.score).toBeLessThan(50);
    });
  });

  describe('错误处理', () => {
    it('应该在输入为空时抛出错误', async () => {
      await expect(skill.execute(mockContext, { text: '' })).rejects.toThrow('输入文本为空');
    });

    it('应该在 AI 调用失败时返回降级结果', async () => {
      const { callZhipuAI } = await import('@/lib/zhipu');
      vi.mocked(callZhipuAI).mockRejectedValueOnce(new Error('API Error'));

      const result = await skill.execute(mockContext, {
        text: '他深深地叹了一口气。',
      });

      expect(result).toBeDefined();
      expect(result.original).toBe('他深深地叹了一口气。');
      expect(result.humanized).toBe('他深深地叹了一口气。');
    });
  });
});
