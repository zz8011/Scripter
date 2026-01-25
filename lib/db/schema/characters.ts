import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { projects } from './projects'

export const characters = pgTable('characters', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  poem: text('poem'),
  basicInfo: jsonb('basic_info').notNull().$type<{
    age: number
    gender: string
    occupation: string
    appearance: string
  }>(),
  personality: jsonb('personality').$type<string[]>().notNull().$default(() => []),
  speechStyle: text('speech_style').notNull(),
  behaviorPattern: text('behavior_pattern').notNull(),
  growthArc: text('growth_arc').notNull(),
  relationships: jsonb('relationships').$type<Array<{
    targetCharacterId: string
    type: string
    description: string
  }>>().notNull().$default(() => []),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type Character = typeof characters.$inferSelect
export type NewCharacter = typeof characters.$inferInsert
