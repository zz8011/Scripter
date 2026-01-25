import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { projects } from './projects'

export const worldviewItems = pgTable('worldview_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  category: text('category', {
    enum: ['era', 'geography', 'social', 'mystery', 'culture', 'economy', 'custom']
  }).notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type WorldviewItem = typeof worldviewItems.$inferSelect
export type NewWorldviewItem = typeof worldviewItems.$inferInsert
