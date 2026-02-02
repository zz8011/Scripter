import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { users } from './users'
import { projects } from './projects'

/**
 * 用户行为动作类型
 */
export type UserBehaviorAction = 'edit' | 'save' | 'ai_chat' | 'export' | 'create' | 'delete' | 'view'

/**
 * User Behavior table - 用户行为记录表
 *
 * 记录用户的各种行为，用于分析和改进用户体验
 */
export const userBehaviors = pgTable('user_behaviors', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  action: text('action', {
    enum: ['edit', 'save', 'ai_chat', 'export', 'create', 'delete', 'view']
  }).notNull(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type UserBehavior = typeof userBehaviors.$inferSelect
export type NewUserBehavior = typeof userBehaviors.$inferInsert
