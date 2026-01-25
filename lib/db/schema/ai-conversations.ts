import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { users } from './users'
import { projects } from './projects'

/**
 * Conversation Message interface
 */
export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    skill?: string // 如果使用了 Skill
    intention?: string // 识别到的意图
    tokensUsed?: number // 消耗的 tokens
  }
}

/**
 * AI Conversations table - AI 对话历史表
 *
 * 存储用户与 AI 的对话历史，用于追踪 AI 使用情况和 token 消耗
 */
export const aiConversations = pgTable('ai_conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }), // 可选，关联项目
  agent: text('agent').notNull(), // 使用的 Agent：intention-router / format-fixer / 等
  messages: jsonb('messages').$type<ConversationMessage[]>().notNull().default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export type AIConversation = typeof aiConversations.$inferSelect
export type NewAIConversation = typeof aiConversations.$inferInsert
