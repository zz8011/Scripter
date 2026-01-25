import { pgTable, uuid, text, integer, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { projects } from './projects'

export const scenes = pgTable('scenes', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  episodeNumber: integer('episode_number').notNull().default(1),
  sceneNumber: integer('scene_number').notNull(),
  location: text('location').notNull(),
  timeOfDay: text('time_of_day').notNull(),
  intExt: text('int_ext').notNull(),
  content: jsonb('content').$type<any>().notNull(), // TipTap JSON 格式
  duration: integer('duration').notNull().default(0),
  status: text('status', {
    enum: ['draft', 'completed']
  }).notNull().default('draft'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type Scene = typeof scenes.$inferSelect
export type NewScene = typeof scenes.$inferInsert
