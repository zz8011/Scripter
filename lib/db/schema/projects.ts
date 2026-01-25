import { pgTable, uuid, text, integer, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { users } from './users'

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  genre: jsonb('genre').$type<string[]>().notNull().$default(() => []),
  scriptType: text('script_type', {
    enum: ['movie', 'series', 'short-drama']
  }).notNull(),
  orientation: text('orientation', {
    enum: ['landscape', 'portrait']
  }).notNull().default('landscape'),
  targetEpisodes: integer('target_episodes').notNull().default(1),
  currentStage: text('current_stage', {
    enum: ['worldview', 'character', 'script', 'optimize', 'production']
  }).notNull().default('worldview'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert
