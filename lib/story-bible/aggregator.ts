/**
 * Story Bible 自动聚合器
 *
 * 当用户编辑人物/世界观/场景时，自动更新 Story Bible
 */

import {
  getOrCreateStoryBible,
  updateCharacterProfile,
  removeCharacterProfile,
  updateWorldRules,
  updateSceneInPlotOutline,
  removeSceneFromPlotOutline,
  updateCreativeIntent,
} from '@/lib/db/queries/story-bible'
import {
  getCharacterById,
  getCharactersByProjectId,
} from '@/lib/db/queries/characters'
import {
  getWorldviewItemsByProjectId,
  getWorldviewItemsGrouped,
} from '@/lib/db/queries/worldview'
import {
  getSceneById,
} from '@/lib/db/queries/scenes'
import {
  getProjectById,
} from '@/lib/db/queries/projects'
import { callZhipuAI } from '@/lib/zhipu'
import type { Character } from '@/lib/db/schema/characters'
import type { WorldviewItem } from '@/lib/db/schema/worldview'
import type { Scene } from '@/lib/db/schema/scenes'
import type { Project } from '@/lib/db/schema/projects'
import type { StoryBible } from '@/lib/db/schema/story-bible'

/**
 * 聚合人物档案
 * 当用户创建/更新人物时调用
 */
export async function aggregateCharacterProfile(
  projectId: string,
  characterId: string
): Promise<void> {
  try {
    const character = await getCharacterById(characterId)
    if (!character || character.projectId !== projectId) {
      throw new Error('Character not found or access denied')
    }

    // 确定人物角色
    const role = determineCharacterRole(character)

    // 提取人物档案
    const profile: StoryBible['characterProfiles'][0] = {
      id: character.id,
      name: character.name,
      role,
      personality: extractPersonality(character),
      speechStyle: character.speechStyle,
      relationships: character.relationships.map(r => ({
        targetId: r.targetCharacterId,
        relation: r.type
      })),
      arc: character.growthArc
    }

    // 更新 Story Bible
    await updateCharacterProfile(projectId, characterId, profile)
  } catch (error) {
    console.error('Error aggregating character profile:', error)
    // 不抛出错误，避免阻塞主流程
  }
}

/**
 * 删除人物档案
 * 当用户删除人物时调用
 */
export async function removeCharacterFromStoryBible(
  projectId: string,
  characterId: string
): Promise<void> {
  try {
    await removeCharacterProfile(projectId, characterId)
  } catch (error) {
    console.error('Error removing character from Story Bible:', error)
  }
}

/**
 * 聚合世界观规则
 * 当用户创建/更新/删除世界观条目时调用
 */
export async function aggregateWorldRules(projectId: string): Promise<void> {
  try {
    const worldviewItems = await getWorldviewItemsGrouped(projectId)

    // 按维度聚合
    const worldRules: StoryBible['worldRules'] = {
      era: summarizeWorldviewCategory(worldviewItems.era),
      geography: summarizeWorldviewCategory(worldviewItems.geography),
      socialRules: summarizeWorldviewCategory(worldviewItems.social),
      constraints: extractWorldviewConstraints(worldviewItems)
    }

    // 更新 Story Bible
    await updateWorldRules(projectId, worldRules)
  } catch (error) {
    console.error('Error aggregating world rules:', error)
  }
}

/**
 * 聚合剧情大纲（含 AI 生成摘要）
 * 当用户创建/更新场景时调用
 */
export async function aggregatePlotOutline(
  projectId: string,
  sceneId: string
): Promise<void> {
  try {
    const scene = await getSceneById(sceneId)
    if (!scene || scene.projectId !== projectId) {
      throw new Error('Scene not found or access denied')
    }

    // 提取场景文本内容
    const sceneText = extractSceneText(scene)

    // 调用 AI 生成场景摘要（100 字以内）
    const summary = await generateSceneSummary(sceneText, scene)

    // 提取出场人物（从场景内容中识别）
    const characters = await extractSceneCharacters(projectId, sceneText)

    // 提取关键剧情点
    const plotPoints = extractPlotPoints(sceneText)

    // 更新 Story Bible
    await updateSceneInPlotOutline(projectId, sceneId, {
      sceneId: scene.id,
      sceneNumber: scene.sceneNumber,
      summary,
      characters,
      plotPoints
    })
  } catch (error) {
    console.error('Error aggregating plot outline:', error)
  }
}

/**
 * 删除场景大纲
 * 当用户删除场景时调用
 */
export async function removeSceneFromStoryBible(
  projectId: string,
  sceneId: string
): Promise<void> {
  try {
    await removeSceneFromPlotOutline(projectId, sceneId)
  } catch (error) {
    console.error('Error removing scene from Story Bible:', error)
  }
}

/**
 * 聚合创作意图
 * 当用户更新项目设置时调用
 */
export async function aggregateCreativeIntent(projectId: string): Promise<void> {
  try {
    const project = await getProjectById(projectId)
    if (!project) {
      throw new Error('Project not found')
    }

    const creativeIntent: StoryBible['creativeIntent'] = {
      genre: project.genre.join(', '),
      tone: inferToneFromGenre(project.genre),
      themes: inferThemesFromGenre(project.genre),
      targetAudience: inferTargetAudience(project)
    }

    await updateCreativeIntent(projectId, creativeIntent)
  } catch (error) {
    console.error('Error aggregating creative intent:', error)
  }
}

// ============================================
// 辅助函数
// ============================================

/**
 * 确定人物角色（主角/反派/配角）
 */
function determineCharacterRole(character: Character): 'protagonist' | 'antagonist' | 'supporting' {
  // 简单规则：根据人物弧光和性格判断
  const arc = character.growthArc.toLowerCase()
  const personality = character.personality.join(' ').toLowerCase()

  if (arc.includes('主角') || arc.includes('英雄') || arc.includes('成长')) {
    return 'protagonist'
  }

  if (personality.includes('反派') || personality.includes('邪恶') || personality.includes('敌对')) {
    return 'antagonist'
  }

  return 'supporting'
}

/**
 * 提取人物性格摘要
 */
function extractPersonality(character: Character): string {
  return character.personality.join('、')
}

/**
 * 按维度汇总世界观条目
 */
function summarizeWorldviewCategory(items: WorldviewItem[]): string {
  if (items.length === 0) return ''

  // 合并所有条目的标题和内容
  return items
    .map(item => `${item.title}: ${item.content}`)
    .join('；')
    .slice(0, 500) // 限制长度
}

/**
 * 提取世界观约束条件
 */
function extractWorldviewConstraints(grouped: Record<string, WorldviewItem[]>): string[] {
  const constraints: string[] = []

  // 从各维度提取约束
  for (const category of Object.keys(grouped)) {
    const items = (grouped as any)[category] as WorldviewItem[]
    for (const item of items) {
      // 识别约束性语句（包含"不能"、"禁止"、"必须"等）
      if (
        item.content.includes('不能') ||
        item.content.includes('禁止') ||
        item.content.includes('必须') ||
        item.content.includes('限制')
      ) {
        constraints.push(`${item.title}: ${item.content}`)
      }
    }
  }

  return constraints.slice(0, 10) // 最多 10 条约束
}

/**
 * 提取场景文本内容（从 TipTap JSON 格式）
 */
function extractSceneText(scene: Scene): string {
  try {
    const content = scene.content as any
    if (!content || !content.content) return ''

    // 递归提取所有文本节点
    const extractText = (node: any): string => {
      if (node.type === 'text') {
        return node.text || ''
      }
      if (node.content && Array.isArray(node.content)) {
        return node.content.map(extractText).join('')
      }
      return ''
    }

    return extractText(content)
  } catch (error) {
    console.error('Error extracting scene text:', error)
    return ''
  }
}

/**
 * 使用 AI 生成场景摘要（100 字以内）
 */
async function generateSceneSummary(sceneText: string, scene: Scene): Promise<string> {
  try {
    // 如果场景内容为空，返回默认摘要
    if (!sceneText || sceneText.trim().length === 0) {
      return `第 ${scene.sceneNumber} 场：${scene.location}，${scene.timeOfDay}，${scene.intExt}`
    }

    // 限制输入长度（避免 token 超限）
    const truncatedText = sceneText.slice(0, 2000)

    const response = await callZhipuAI(
      [
        {
          role: 'system',
          content: '你是一个专业的剧本分析助手。请用 100 字以内概括场景的核心内容，包括：主要人物、关键事件、情感基调。'
        },
        {
          role: 'user',
          content: `场景信息：\n地点：${scene.location}\n时间：${scene.timeOfDay}\n内外景：${scene.intExt}\n\n场景内容：\n${truncatedText}\n\n请生成场景摘要（100 字以内）：`
        }
      ],
      {
        model: 'glm-4-flash',
        temperature: 0.3,
        maxTokens: 200,
        enableFallback: true
      }
    )

    if ('isFallback' in response) {
      // AI 服务失败，返回简单摘要
      return `第 ${scene.sceneNumber} 场：${scene.location}，${scene.timeOfDay}`
    }

    const summary = response.choices[0]?.message?.content?.trim() || ''
    return summary.slice(0, 200) // 确保不超过 200 字
  } catch (error) {
    console.error('Error generating scene summary:', error)
    // 降级：返回基本信息
    return `第 ${scene.sceneNumber} 场：${scene.location}，${scene.timeOfDay}，${scene.intExt}`
  }
}

/**
 * 提取场景中的出场人物
 */
async function extractSceneCharacters(projectId: string, sceneText: string): Promise<string[]> {
  try {
    // 获取项目所有人物
    const allCharacters = await getCharactersByProjectId(projectId)

    // 在场景文本中查找人物名字
    const foundCharacters: string[] = []
    for (const character of allCharacters) {
      if (sceneText.includes(character.name)) {
        foundCharacters.push(character.id)
      }
    }

    return foundCharacters
  } catch (error) {
    console.error('Error extracting scene characters:', error)
    return []
  }
}

/**
 * 提取关键剧情点（简单规则）
 */
function extractPlotPoints(sceneText: string): string[] {
  const plotPoints: string[] = []

  // 识别关键动作词
  const actionKeywords = ['决定', '发现', '遇到', '冲突', '揭示', '转折', '离开', '到达', '失败', '成功']

  // 按句子分割
  const sentences = sceneText.split(/[。！？\n]/).filter(s => s.trim().length > 0)

  for (const sentence of sentences) {
    for (const keyword of actionKeywords) {
      if (sentence.includes(keyword)) {
        plotPoints.push(sentence.trim().slice(0, 50)) // 最多 50 字
        break
      }
    }

    if (plotPoints.length >= 5) break // 最多 5 个剧情点
  }

  return plotPoints
}

/**
 * 根据类型推断基调
 */
function inferToneFromGenre(genres: string[]): string {
  const genreStr = genres.join(',').toLowerCase()

  if (genreStr.includes('喜剧') || genreStr.includes('轻松')) return '轻松幽默'
  if (genreStr.includes('悬疑') || genreStr.includes('惊悚')) return '紧张悬疑'
  if (genreStr.includes('爱情') || genreStr.includes('浪漫')) return '温馨浪漫'
  if (genreStr.includes('历史') || genreStr.includes('史诗')) return '严肃史诗'
  if (genreStr.includes('科幻') || genreStr.includes('奇幻')) return '奇幻冒险'
  if (genreStr.includes('动作') || genreStr.includes('战争')) return '紧张刺激'

  return '多元混合'
}

/**
 * 根据类型推断主题
 */
function inferThemesFromGenre(genres: string[]): string[] {
  const themes: string[] = []
  const genreStr = genres.join(',').toLowerCase()

  if (genreStr.includes('爱情')) themes.push('爱情')
  if (genreStr.includes('家庭')) themes.push('家庭')
  if (genreStr.includes('成长')) themes.push('成长')
  if (genreStr.includes('复仇')) themes.push('复仇')
  if (genreStr.includes('正义')) themes.push('正义')
  if (genreStr.includes('友情')) themes.push('友情')
  if (genreStr.includes('历史')) themes.push('历史')
  if (genreStr.includes('科幻')) themes.push('科技')

  return themes.length > 0 ? themes : ['待定']
}

/**
 * 推断目标受众
 */
function inferTargetAudience(project: Project): string {
  const genreStr = project.genre.join(',').toLowerCase()

  if (genreStr.includes('青春') || genreStr.includes('校园')) return '18-25岁年轻观众'
  if (genreStr.includes('家庭') || genreStr.includes('温情')) return '25-45岁家庭观众'
  if (genreStr.includes('历史') || genreStr.includes('史诗')) return '30-50岁成熟观众'
  if (genreStr.includes('动作') || genreStr.includes('科幻')) return '18-35岁男性观众'
  if (genreStr.includes('爱情') || genreStr.includes('都市')) return '20-40岁都市观众'

  return '全年龄段观众'
}
