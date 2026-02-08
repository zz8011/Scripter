/**
 * ContextAssembler - 智能上下文组装器
 *
 * 根据 Skill 的 requiredContext 声明，从 Story Bible 和数据库中
 * 组装精确的上下文，避免传递不必要的数据。
 *
 * 核心功能：
 * - 支持 9 种上下文类型
 * - 智能缓存（避免重复查询）
 * - Token 预估和控制
 * - 优先级排序和降级策略
 */

import type { ContextRequirement } from './types';
import { getOrCreateStoryBible } from '../../db/queries/story-bible';
import { getSceneById, getScenesByProjectId } from '../../db/queries/scenes';
import { getCharacterById, getCharactersByProjectId } from '../../db/queries/characters';
import { getWorldviewItemsByProjectId } from '../../db/queries/worldview';

/**
 * 组装后的上下文
 */
export interface AssembledContext {
  context: Record<string, any>;
  tokenCount: number;
  sources: string[];      // 数据来源列表
  cached: string[];       // 使用缓存的数据源
}

/**
 * 缓存统计
 */
export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

/**
 * 缓存项
 */
interface CacheEntry {
  data: any;
  timestamp: number;
  size: number;  // 估算的 token 数量
}

/**
 * 上下文组装选项
 */
export interface ContextAssemblerOptions {
  projectId: string;
  userId: string;
  maxTokens?: number;      // 最大 token 限制（默认 8000）
  cacheTTL?: number;       // 缓存过期时间（毫秒，默认 5 分钟）
}

/**
 * 输入参数（来自前端）
 */
export interface AssemblerInput {
  sceneId?: string;        // 当前场景 ID
  selectedText?: string;   // 选中的文本
  characterId?: string;    // 指定的人物 ID
  conversationHistory?: Array<{ role: string; content: string }>; // 对话历史
}

/**
 * ContextAssembler 类
 */
export class ContextAssembler {
  private projectId: string;
  private userId: string;
  private maxTokens: number;
  private cacheTTL: number;

  // 缓存存储
  private cache: Map<string, CacheEntry> = new Map();

  // 统计信息
  private stats = {
    hits: 0,
    misses: 0,
  };

  constructor(options: ContextAssemblerOptions) {
    this.projectId = options.projectId;
    this.userId = options.userId;
    this.maxTokens = options.maxTokens || 8000;
    this.cacheTTL = options.cacheTTL || 5 * 60 * 1000; // 5 分钟
  }

  /**
   * 组装上下文
   */
  async assemble(
    requirements: ContextRequirement[],
    input: AssemblerInput
  ): Promise<AssembledContext> {
    const context: Record<string, any> = {};
    const sources: string[] = [];
    const cached: string[] = [];
    let totalTokens = 0;

    // 按优先级排序（重要的上下文优先）
    const sortedRequirements = this.sortByPriority(requirements);

    // 逐个获取上下文
    for (const requirement of sortedRequirements) {
      try {
        const result = await this.fetchContext(requirement, input);

        if (result) {
          const { key, data, source, fromCache } = result;

          // 估算 token 数量
          const tokens = this.estimateTokens(data);

          // 检查是否超出限制
          if (totalTokens + tokens > this.maxTokens) {
            // 降级策略：截断或跳过
            if (this.isEssential(requirement)) {
              // 必要的上下文：截断
              context[key] = this.truncate(data, this.maxTokens - totalTokens);
              totalTokens = this.maxTokens;
              sources.push(`${source} (truncated)`);
            } else {
              // 非必要的上下文：跳过
              sources.push(`${source} (skipped - token limit)`);
            }
            break;
          }

          context[key] = data;
          totalTokens += tokens;
          sources.push(source);

          if (fromCache) {
            cached.push(source);
          }
        }
      } catch (error) {
        // 错误处理：记录日志但不抛出异常
        console.error(`Failed to fetch context for ${requirement.type}:`, error);
        sources.push(`${requirement.type} (error)`);
      }
    }

    return {
      context,
      tokenCount: totalTokens,
      sources,
      cached,
    };
  }

  /**
   * 获取单个上下文
   */
  private async fetchContext(
    requirement: ContextRequirement,
    input: AssemblerInput
  ): Promise<{ key: string; data: any; source: string; fromCache: boolean } | null> {
    switch (requirement.type) {
      case 'currentScene':
        return this.fetchCurrentScene(input.sceneId);

      case 'selectedText':
        return this.fetchSelectedText(input.selectedText);

      case 'characterProfile':
        return this.fetchCharacterProfile(requirement.characterId || input.characterId);

      case 'allCharacters':
        return this.fetchAllCharacters();

      case 'worldRules':
        return this.fetchWorldRules();

      case 'plotOutline':
        return this.fetchPlotOutline();

      case 'adjacentScenes':
        return this.fetchAdjacentScenes(input.sceneId, requirement.range);

      case 'creativeIntent':
        return this.fetchCreativeIntent();

      case 'conversationHistory':
        return this.fetchConversationHistory(input.conversationHistory, requirement.limit);

      default:
        return null;
    }
  }

  /**
   * 获取当前场景
   */
  private async fetchCurrentScene(sceneId?: string): Promise<{ key: string; data: any; source: string; fromCache: boolean } | null> {
    if (!sceneId) return null;

    const cacheKey = `scene:${sceneId}`;
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return { key: 'currentScene', data: cached, source: 'currentScene', fromCache: true };
    }

    const scene = await getSceneById(sceneId);

    if (!scene) return null;

    this.setCache(cacheKey, scene);

    return {
      key: 'currentScene',
      data: scene,
      source: 'currentScene',
      fromCache: false,
    };
  }

  /**
   * 获取选中文本
   */
  private async fetchSelectedText(selectedText?: string): Promise<{ key: string; data: any; source: string; fromCache: boolean } | null> {
    if (!selectedText) return null;

    return {
      key: 'selectedText',
      data: selectedText,
      source: 'selectedText',
      fromCache: false,
    };
  }

  /**
   * 获取人物档案
   */
  private async fetchCharacterProfile(characterId?: string): Promise<{ key: string; data: any; source: string; fromCache: boolean } | null> {
    if (!characterId) return null;

    const cacheKey = `character:${characterId}`;
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return { key: 'characterProfile', data: cached, source: 'characterProfile', fromCache: true };
    }

    const character = await getCharacterById(characterId);

    if (!character) return null;

    this.setCache(cacheKey, character);

    return {
      key: 'characterProfile',
      data: character,
      source: 'characterProfile',
      fromCache: false,
    };
  }

  /**
   * 获取所有人物
   */
  private async fetchAllCharacters(): Promise<{ key: string; data: any; source: string; fromCache: boolean }> {
    const cacheKey = `characters:${this.projectId}`;
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return { key: 'allCharacters', data: cached, source: 'allCharacters', fromCache: true };
    }

    const characters = await getCharactersByProjectId(this.projectId);

    this.setCache(cacheKey, characters);

    return {
      key: 'allCharacters',
      data: characters,
      source: 'allCharacters',
      fromCache: false,
    };
  }

  /**
   * 获取世界观规则
   */
  private async fetchWorldRules(): Promise<{ key: string; data: any; source: string; fromCache: boolean }> {
    const cacheKey = `worldRules:${this.projectId}`;
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return { key: 'worldRules', data: cached, source: 'worldRules', fromCache: true };
    }

    const storyBible = await getOrCreateStoryBible(this.projectId);
    const worldRules = storyBible.worldRules;

    this.setCache(cacheKey, worldRules);

    return {
      key: 'worldRules',
      data: worldRules,
      source: 'worldRules',
      fromCache: false,
    };
  }

  /**
   * 获取剧情大纲
   */
  private async fetchPlotOutline(): Promise<{ key: string; data: any; source: string; fromCache: boolean }> {
    const cacheKey = `plotOutline:${this.projectId}`;
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return { key: 'plotOutline', data: cached, source: 'plotOutline', fromCache: true };
    }

    const storyBible = await getOrCreateStoryBible(this.projectId);
    const plotOutline = storyBible.plotOutline;

    this.setCache(cacheKey, plotOutline);

    return {
      key: 'plotOutline',
      data: plotOutline,
      source: 'plotOutline',
      fromCache: false,
    };
  }

  /**
   * 获取相邻场景
   */
  private async fetchAdjacentScenes(sceneId?: string, range: number = 1): Promise<{ key: string; data: any; source: string; fromCache: boolean } | null> {
    if (!sceneId) return null;

    const cacheKey = `adjacentScenes:${sceneId}:${range}`;
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return { key: 'adjacentScenes', data: cached, source: 'adjacentScenes', fromCache: true };
    }

    const currentScene = await getSceneById(sceneId);
    if (!currentScene) return null;

    const allScenes = await getScenesByProjectId(this.projectId);

    // 找到当前场景的索引
    const currentIndex = allScenes.findIndex(s => s.id === sceneId);
    if (currentIndex === -1) return null;

    // 获取前后 N 个场景
    const start = Math.max(0, currentIndex - range);
    const end = Math.min(allScenes.length, currentIndex + range + 1);
    const adjacentScenes = allScenes.slice(start, end);

    this.setCache(cacheKey, adjacentScenes);

    return {
      key: 'adjacentScenes',
      data: adjacentScenes,
      source: 'adjacentScenes',
      fromCache: false,
    };
  }

  /**
   * 获取创作意图
   */
  private async fetchCreativeIntent(): Promise<{ key: string; data: any; source: string; fromCache: boolean }> {
    const cacheKey = `creativeIntent:${this.projectId}`;
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return { key: 'creativeIntent', data: cached, source: 'creativeIntent', fromCache: true };
    }

    const storyBible = await getOrCreateStoryBible(this.projectId);
    const creativeIntent = storyBible.creativeIntent;

    this.setCache(cacheKey, creativeIntent);

    return {
      key: 'creativeIntent',
      data: creativeIntent,
      source: 'creativeIntent',
      fromCache: false,
    };
  }

  /**
   * 获取对话历史
   */
  private async fetchConversationHistory(
    history?: Array<{ role: string; content: string }>,
    limit: number = 10
  ): Promise<{ key: string; data: any; source: string; fromCache: boolean } | null> {
    if (!history || history.length === 0) return null;

    // 限制对话历史数量
    const limitedHistory = history.slice(-limit);

    return {
      key: 'conversationHistory',
      data: limitedHistory,
      source: 'conversationHistory',
      fromCache: false,
    };
  }

  /**
   * 按优先级排序上下文需求
   *
   * 优先级（从高到低）：
   * 1. currentScene - 当前场景（最重要）
   * 2. selectedText - 选中文本
   * 3. characterProfile - 人物档案
   * 4. worldRules - 世界观规则
   * 5. adjacentScenes - 相邻场景
   * 6. creativeIntent - 创作意图
   * 7. plotOutline - 剧情大纲
   * 8. allCharacters - 所有人物
   * 9. conversationHistory - 对话历史
   */
  private sortByPriority(requirements: ContextRequirement[]): ContextRequirement[] {
    const priorityMap: Record<string, number> = {
      currentScene: 1,
      selectedText: 2,
      characterProfile: 3,
      worldRules: 4,
      adjacentScenes: 5,
      creativeIntent: 6,
      plotOutline: 7,
      allCharacters: 8,
      conversationHistory: 9,
    };

    return [...requirements].sort((a, b) => {
      return priorityMap[a.type] - priorityMap[b.type];
    });
  }

  /**
   * 判断是否为必要上下文
   */
  private isEssential(requirement: ContextRequirement): boolean {
    const essentialTypes = ['currentScene', 'selectedText', 'characterProfile'];
    return essentialTypes.includes(requirement.type);
  }

  /**
   * 估算 token 数量
   * 简单估算：中文 1 字 ≈ 2 tokens，英文 1 词 ≈ 1.3 tokens
   */
  private estimateTokens(data: any): number {
    const str = JSON.stringify(data);

    // 统计中文字符数
    const chineseChars = (str.match(/[\u4e00-\u9fa5]/g) || []).length;

    // 统计英文单词数（粗略估算）
    const englishWords = str.replace(/[\u4e00-\u9fa5]/g, '').split(/\s+/).length;

    return Math.ceil(chineseChars * 2 + englishWords * 1.3);
  }

  /**
   * 截断数据以适应 token 限制
   */
  private truncate(data: any, maxTokens: number): any {
    if (typeof data === 'string') {
      // 字符串：按字符截断
      const charsToKeep = Math.floor(maxTokens / 2);
      return data.slice(0, charsToKeep) + '... (truncated)';
    }

    if (Array.isArray(data)) {
      // 数组：保留前几项
      const itemsToKeep = Math.max(1, Math.floor(data.length * maxTokens / this.estimateTokens(data)));
      return data.slice(0, itemsToKeep);
    }

    if (typeof data === 'object' && data !== null) {
      // 对象：保留主要字段
      const truncated: any = {};
      let tokens = 0;

      for (const [key, value] of Object.entries(data)) {
        const valueTokens = this.estimateTokens(value);
        if (tokens + valueTokens <= maxTokens) {
          truncated[key] = value;
          tokens += valueTokens;
        } else {
          break;
        }
      }

      return truncated;
    }

    return data;
  }

  /**
   * 从缓存获取数据
   */
  private getFromCache(key: string): any | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // 检查是否过期
    if (Date.now() - entry.timestamp > this.cacheTTL) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.data;
  }

  /**
   * 设置缓存
   */
  private setCache(key: string, data: any): void {
    const size = this.estimateTokens(data);

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      size,
    });
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? this.stats.hits / total : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      hitRate,
    };
  }
}
