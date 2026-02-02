import { pgTable, uuid, integer, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

/**
 * User Bazi table - 用户八字配置表
 *
 * 存储用户的八字信息，用于个性化 AI 助手（剧灵）的性格生成
 */
export const userBazi = pgTable('user_bazi', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  birthYear: integer('birth_year').notNull(),
  birthMonth: integer('birth_month').notNull(),
  birthDay: integer('birth_day').notNull(),
  birthHour: integer('birth_hour').notNull(),
  bazi: text('bazi').notNull(), // 八字字符串，如 "甲子年乙丑月丙寅日丁卯时"
  wuxing: text('wuxing').notNull(), // 五行: 金木水火土
  shiho: text('shiho'), // 诗号
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export type UserBazi = typeof userBazi.$inferSelect
export type NewUserBazi = typeof userBazi.$inferInsert
