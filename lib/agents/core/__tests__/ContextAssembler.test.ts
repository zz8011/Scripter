/**
 * ContextAssembler 单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContextAssembler } from '../ContextAssembler';
import type { ContextRequirement } from '../types';

// Mock 数据库查询
vi.mock('../../../db/queries/story-bible', () => ({
  getOrCreateStoryBible: vi.fn().mockResolvedValue({
    id: 'bible-1',
    projectId: 'project-1',
    worldRules: {
      era: '唐朝贞观年间',
      geography: '长安城及周边',
      socialRules: '严格的等级制度',
      constraints: ['不能使用现代科技', '需符合历史背景'],
    },
    characterProfiles: [
      {
        id: 'char-1',
        name: '李明',
        role: 'protagonist',
        personality: '正直勇敢',
        speechStyle: '简洁有力',
        relationships: [{ targetId: 'char-2', relation: '好友' }],
        arc: '从普通士兵成长为将军',
      },
    ],
    plotOutline: [
      {
        sceneId: 'scene-1',
        sceneNumber: 1,
        summary: '李明初入军营',
        characters: ['char-1'],
        plotPoints: ['李明报名参军', '遇到教官'],
      },
    ],
    creativeIntent: {
      genre: '历史剧',
      tone: '严肃',
      themes: ['忠诚', '成长'],
      targetAudience: '成年观众',
    },
    lastUpdatedAt: new Date(),
    createdAt: new Date(),
  }),
}));

vi.mock('../../../db/queries/scenes', () => ({
  getSceneById: vi.fn().mockResolvedValue({
    id: 'scene-1',
    projectId: 'project-1',
    episodeNumber: 1,
    sceneNumber: 1,
    title: '军营初见',
    content: '李明走进军营，四处张望...',
    duration: 120,
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  getScenesByProjectId: vi.fn().mockResolvedValue([
    {
      id: 'scene-1',
      projectId: 'project-1',
      episodeNumber: 1,
      sceneNumber: 1,
      title: '军营初见',
      content: '李明走进军营，四处张望...',
      duration: 120,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'scene-2',
      projectId: 'project-1',
      episodeNumber: 1,
      sceneNumber: 2,
      title: '训练场',
      content: '教官严厉地训练新兵...',
      duration: 180,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
}));

vi.mock('../../../db/queries/characters', () => ({
  getCharacterById: vi.fn().mockResolvedValue({
    id: 'char-1',
    projectId: 'project-1',
    name: '李明',
    role: 'protagonist',
    age: 25,
    gender: 'male',
    appearance: '身材魁梧，目光坚定',
    personality: '正直勇敢，有责任感',
    background: '出身农家，自幼习武',
    relationships: [{ targetCharacterId: 'char-2', type: 'friend', description: '战友' }],
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  getCharactersByProjectId: vi.fn().mockResolvedValue([
    {
      id: 'char-1',
      projectId: 'project-1',
      name: '李明',
      role: 'protagonist',
      age: 25,
      gender: 'male',
      appearance: '身材魁梧，目光坚定',
      personality: '正直勇敢，有责任感',
      background: '出身农家，自幼习武',
      relationships: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'char-2',
      projectId: 'project-1',
      name: '王刚',
      role: 'supporting',
      age: 28,
      gender: 'male',
      appearance: '精瘦干练',
      personality: '机智幽默',
      background: '城里长大',
      relationships: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
}));

vi.mock('../../../db/queries/worldview', () => ({
  getWorldviewItemsByProjectId: vi.fn().mockResolvedValue([
    {
      id: 'world-1',
      projectId: 'project-1',
      category: 'era',
      title: '时代背景',
      content: '唐朝贞观年间，国力强盛',
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
}));

describe('ContextAssembler', () => {
  let assembler: ContextAssembler;

  beforeEach(() => {
    assembler = new ContextAssembler({
      projectId: 'project-1',
      userId: 'user-1',
      maxTokens: 8000,
      cacheTTL: 5 * 60 * 1000,
    });
  });

  describe('基础功能', () => {
    it('应该能够创建 ContextAssembler 实例', () => {
      expect(assembler).toBeDefined();
    });

    it('应该能够组装空上下文', async () => {
      const result = await assembler.assemble([], {});

      expect(result.context).toEqual({});
      expect(result.tokenCount).toBe(0);
      expect(result.sources).toEqual([]);
      expect(result.cached).toEqual([]);
    });
  });

  describe('单个上下文类型', () => {
    it('应该能够获取当前场景', async () => {
      const requirements: ContextRequirement[] = [{ type: 'currentScene' }];
      const input = { sceneId: 'scene-1' };

      const result = await assembler.assemble(requirements, input);

      expect(result.context.currentScene).toBeDefined();
      expect(result.context.currentScene.id).toBe('scene-1');
      expect(result.sources).toContain('currentScene');
      expect(result.tokenCount).toBeGreaterThan(0);
    });

    it('应该能够获取选中文本', async () => {
      const requirements: ContextRequirement[] = [{ type: 'selectedText' }];
      const input = { selectedText: '这是选中的文本' };

      const result = await assembler.assemble(requirements, input);

      expect(result.context.selectedText).toBe('这是选中的文本');
      expect(result.sources).toContain('selectedText');
    });

    it('应该能够获取人物档案', async () => {
      const requirements: ContextRequirement[] = [
        { type: 'characterProfile', characterId: 'char-1' },
      ];
      const input = {};

      const result = await assembler.assemble(requirements, input);

      expect(result.context.characterProfile).toBeDefined();
      expect(result.context.characterProfile.id).toBe('char-1');
      expect(result.sources).toContain('characterProfile');
    });

    it('应该能够获取所有人物', async () => {
      const requirements: ContextRequirement[] = [{ type: 'allCharacters' }];
      const input = {};

      const result = await assembler.assemble(requirements, input);

      expect(result.context.allCharacters).toBeDefined();
      expect(Array.isArray(result.context.allCharacters)).toBe(true);
      expect(result.context.allCharacters.length).toBe(2);
      expect(result.sources).toContain('allCharacters');
    });

    it('应该能够获取世界观规则', async () => {
      const requirements: ContextRequirement[] = [{ type: 'worldRules' }];
      const input = {};

      const result = await assembler.assemble(requirements, input);

      expect(result.context.worldRules).toBeDefined();
      expect(result.context.worldRules.era).toBe('唐朝贞观年间');
      expect(result.sources).toContain('worldRules');
    });

    it('应该能够获取剧情大纲', async () => {
      const requirements: ContextRequirement[] = [{ type: 'plotOutline' }];
      const input = {};

      const result = await assembler.assemble(requirements, input);

      expect(result.context.plotOutline).toBeDefined();
      expect(Array.isArray(result.context.plotOutline)).toBe(true);
      expect(result.sources).toContain('plotOutline');
    });

    it('应该能够获取相邻场景', async () => {
      const requirements: ContextRequirement[] = [
        { type: 'adjacentScenes', range: 1 },
      ];
      const input = { sceneId: 'scene-1' };

      const result = await assembler.assemble(requirements, input);

      expect(result.context.adjacentScenes).toBeDefined();
      expect(Array.isArray(result.context.adjacentScenes)).toBe(true);
      expect(result.sources).toContain('adjacentScenes');
    });

    it('应该能够获取创作意图', async () => {
      const requirements: ContextRequirement[] = [{ type: 'creativeIntent' }];
      const input = {};

      const result = await assembler.assemble(requirements, input);

      expect(result.context.creativeIntent).toBeDefined();
      expect(result.context.creativeIntent.genre).toBe('历史剧');
      expect(result.sources).toContain('creativeIntent');
    });

    it('应该能够获取对话历史', async () => {
      const requirements: ContextRequirement[] = [
        { type: 'conversationHistory', limit: 5 },
      ];
      const input = {
        conversationHistory: [
          { role: 'user', content: '帮我润色对白' },
          { role: 'assistant', content: '好的，请提供需要润色的对白' },
        ],
      };

      const result = await assembler.assemble(requirements, input);

      expect(result.context.conversationHistory).toBeDefined();
      expect(Array.isArray(result.context.conversationHistory)).toBe(true);
      expect(result.context.conversationHistory.length).toBe(2);
      expect(result.sources).toContain('conversationHistory');
    });
  });

  describe('多个上下文组合', () => {
    it('应该能够组装多个上下文', async () => {
      const requirements: ContextRequirement[] = [
        { type: 'currentScene' },
        { type: 'characterProfile', characterId: 'char-1' },
        { type: 'worldRules' },
      ];
      const input = { sceneId: 'scene-1' };

      const result = await assembler.assemble(requirements, input);

      expect(result.context.currentScene).toBeDefined();
      expect(result.context.characterProfile).toBeDefined();
      expect(result.context.worldRules).toBeDefined();
      expect(result.sources.length).toBe(3);
    });

    it('应该按优先级排序上下文', async () => {
      const requirements: ContextRequirement[] = [
        { type: 'allCharacters' }, // 优先级低
        { type: 'currentScene' }, // 优先级高
        { type: 'worldRules' }, // 优先级中
      ];
      const input = { sceneId: 'scene-1' };

      const result = await assembler.assemble(requirements, input);

      // currentScene 应该最先被获取
      expect(result.sources[0]).toBe('currentScene');
    });
  });

  describe('缓存机制', () => {
    it('应该能够缓存数据', async () => {
      const requirements: ContextRequirement[] = [{ type: 'worldRules' }];
      const input = {};

      // 第一次调用
      const result1 = await assembler.assemble(requirements, input);
      expect(result1.cached.length).toBe(0);

      // 第二次调用（应该使用缓存）
      const result2 = await assembler.assemble(requirements, input);
      expect(result2.cached.length).toBe(1);
      expect(result2.cached).toContain('worldRules');
    });

    it('应该能够获取缓存统计', async () => {
      const requirements: ContextRequirement[] = [{ type: 'worldRules' }];
      const input = {};

      // 第一次调用（缓存未命中）
      await assembler.assemble(requirements, input);

      // 第二次调用（缓存命中）
      await assembler.assemble(requirements, input);

      const stats = assembler.getCacheStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(0.5);
      expect(stats.size).toBeGreaterThan(0);
    });

    it('应该能够清除缓存', async () => {
      const requirements: ContextRequirement[] = [{ type: 'worldRules' }];
      const input = {};

      // 第一次调用
      await assembler.assemble(requirements, input);

      // 清除缓存
      assembler.clearCache();

      // 第二次调用（缓存应该未命中）
      const result = await assembler.assemble(requirements, input);
      expect(result.cached.length).toBe(0);

      const stats = assembler.getCacheStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(1);
    });
  });

  describe('Token 控制', () => {
    it('应该能够估算 token 数量', async () => {
      const requirements: ContextRequirement[] = [
        { type: 'currentScene' },
        { type: 'worldRules' },
      ];
      const input = { sceneId: 'scene-1' };

      const result = await assembler.assemble(requirements, input);

      expect(result.tokenCount).toBeGreaterThan(0);
    });

    it('应该在超出 token 限制时截断数据', async () => {
      // 创建一个 token 限制很小的 assembler
      const smallAssembler = new ContextAssembler({
        projectId: 'project-1',
        userId: 'user-1',
        maxTokens: 100, // 很小的限制
      });

      const requirements: ContextRequirement[] = [
        { type: 'currentScene' },
        { type: 'allCharacters' },
        { type: 'worldRules' },
      ];
      const input = { sceneId: 'scene-1' };

      const result = await smallAssembler.assemble(requirements, input);

      // 应该只获取了部分上下文
      expect(result.tokenCount).toBeLessThanOrEqual(100);
      // 由于 currentScene 是必要上下文，可能会被截断但仍然包含
      // 所以我们只检查 token 限制，不检查 sources 数量
      expect(result.sources.length).toBeGreaterThan(0);
    });
  });

  describe('错误处理', () => {
    it('应该在数据不存在时返回 null', async () => {
      const requirements: ContextRequirement[] = [{ type: 'currentScene' }];
      const input = { sceneId: 'non-existent' };

      // Mock 返回 null
      vi.mocked(await import('../../../db/queries/scenes')).getSceneById = vi
        .fn()
        .mockResolvedValue(null);

      const result = await assembler.assemble(requirements, input);

      expect(result.context.currentScene).toBeUndefined();
    });

    it('应该在查询失败时继续处理其他上下文', async () => {
      const requirements: ContextRequirement[] = [
        { type: 'currentScene' },
        { type: 'worldRules' },
      ];
      const input = { sceneId: 'scene-1' };

      // Mock 第一个查询失败
      vi.mocked(await import('../../../db/queries/scenes')).getSceneById = vi
        .fn()
        .mockRejectedValue(new Error('Database error'));

      const result = await assembler.assemble(requirements, input);

      // worldRules 应该仍然被获取
      expect(result.context.worldRules).toBeDefined();
      expect(result.sources).toContain('currentScene (error)');
      expect(result.sources).toContain('worldRules');
    });
  });

  describe('边界情况', () => {
    it('应该处理空的选中文本', async () => {
      const requirements: ContextRequirement[] = [{ type: 'selectedText' }];
      const input = { selectedText: '' };

      const result = await assembler.assemble(requirements, input);

      expect(result.context.selectedText).toBeUndefined();
    });

    it('应该处理空的对话历史', async () => {
      const requirements: ContextRequirement[] = [
        { type: 'conversationHistory' },
      ];
      const input = { conversationHistory: [] };

      const result = await assembler.assemble(requirements, input);

      expect(result.context.conversationHistory).toBeUndefined();
    });

    it('应该限制对话历史数量', async () => {
      const requirements: ContextRequirement[] = [
        { type: 'conversationHistory', limit: 2 },
      ];
      const input = {
        conversationHistory: [
          { role: 'user', content: '消息1' },
          { role: 'assistant', content: '消息2' },
          { role: 'user', content: '消息3' },
          { role: 'assistant', content: '消息4' },
        ],
      };

      const result = await assembler.assemble(requirements, input);

      expect(result.context.conversationHistory.length).toBe(2);
      // 应该保留最后 2 条
      expect(result.context.conversationHistory[0].content).toBe('消息3');
      expect(result.context.conversationHistory[1].content).toBe('消息4');
    });
  });
});
