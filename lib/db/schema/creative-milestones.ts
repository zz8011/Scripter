import { pgTable, uuid, text, timestamp, integer } from 'drizzle-orm/pg-core'
import { users } from './users'
import { projects } from './projects'

/**
 * Creative Milestones table - 创作里程碑表
 *
 * 记录用户的创作里程碑，包括首个场景、首集完成、整剧完成等
 * 用于追踪 AI 贡献度和成就系统
 */
export const creativeMilestones = pgTable('creative_milestones', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  type: text('type', {
    enum: ['first_scene', 'first_episode', 'completed']
  }).notNull(),
  achievedAt: timestamp('achieved_at').notNull().defaultNow(), // 达成时间
  aiContribution: integer('ai_contribution').notNull().default(0), // AI 贡献度 0-100（%）
})

export type CreativeMilestone = typeof creativeMilestones.$inferSelect
export type NewCreativeMilestone = typeof creativeMilestones.$inferInsert
