import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { users } from './users'

/**
 * Juling Personality interface
 */
export interface JulingPersonality {
  elements: string[] // 五行属性：金木水火土
  style: string // 说话风格描述
}

/**
 * Juling Configs table - 剧灵配置表
 *
 * 存储用户的自定义剧灵配置，包括八字性格系统
 */
export const julingConfigs = pgTable('juling_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull().default('剧灵'), // 自定义剧灵名称
  birthDate: timestamp('birth_date').notNull().defaultNow(), // 注册时间/生日，用于计算八字
  personality: jsonb('personality').$type<JulingPersonality>().notNull().$default(() => ({
    elements: [],
    style: '温暖、鼓励、专业的创作伙伴',
  })),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export type JulingConfig = typeof julingConfigs.$inferSelect
export type NewJulingConfig = typeof julingConfigs.$inferInsert
