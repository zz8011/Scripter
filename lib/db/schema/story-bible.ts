import { pgTable, uuid, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { projects } from './projects'

export const storyBibles = pgTable('story_bibles', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().unique().references(() => projects.id, { onDelete: 'cascade' }),

  // 世界规则（从 worldviewItems 聚合）
  worldRules: jsonb('world_rules').$type<{
    era: string           // 时代背景摘要
    geography: string     // 地理环境摘要
    socialRules: string   // 社会规则摘要
    constraints: string[] // 世界观约束条件
  }>().notNull().$default(() => ({
    era: '',
    geography: '',
    socialRules: '',
    constraints: []
  })),

  // 人物档案（从 characters 聚合）
  characterProfiles: jsonb('character_profiles').$type<Array<{
    id: string
    name: string
    role: 'protagonist' | 'antagonist' | 'supporting'
    personality: string      // 性格摘要
    speechStyle: string      // 说话风格
    relationships: Array<{
      targetId: string
      relation: string
    }>
    arc: string              // 人物弧光
  }>>().notNull().$default(() => []),

  // 剧情大纲（从 scenes 聚合）
  plotOutline: jsonb('plot_outline').$type<Array<{
    sceneId: string
    sceneNumber: number
    summary: string          // 场景摘要（AI 生成或手动）
    characters: string[]     // 出场人物 ID
    plotPoints: string[]     // 关键剧情点
  }>>().notNull().$default(() => []),

  // 创作意图
  creativeIntent: jsonb('creative_intent').$type<{
    genre: string
    tone: string
    themes: string[]
    targetAudience: string
  }>().notNull().$default(() => ({
    genre: '',
    tone: '',
    themes: [],
    targetAudience: ''
  })),

  // 自动更新时间戳
  lastUpdatedAt: timestamp('last_updated_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type StoryBible = typeof storyBibles.$inferSelect
export type NewStoryBible = typeof storyBibles.$inferInsert
