import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatar: text('avatar'),
  password: text('password'), // 密码哈希，允许 null 用于 OAuth 用户
  plan: text('plan', {
    enum: ['free', 'creator', 'pro', 'studio']
  }).notNull().default('free'),
  aiQuota: jsonb('ai_quota').$type<{
    monthlyLimit: number
    used: number
    resetAt: Date
  }>().notNull().$default(() => ({
    monthlyLimit: 500,
    used: 0,
    resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  })),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
