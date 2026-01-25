import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { projects } from './projects'
import { scenes } from './scenes'

/**
 * Storyboards table - 分镜表
 *
 * 存储场景的分镜设计，包括镜头类型、角度、运镜方式等
 */
export const storyboards = pgTable('storyboards', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  sceneId: uuid('scene_id').notNull().references(() => scenes.id, { onDelete: 'cascade' }),
  shotNumber: integer('shot_number').notNull(),
  shotType: text('shot_type').notNull(), // 镜头类型：远景/中景/特写/等
  angle: text('angle').notNull(), // 拍摄角度：平视/仰视/俯视/等
  movement: text('movement').notNull(), // 运镜方式：推/拉/摇/移/跟/升降
  description: text('description').notNull(), // 画面描述
  audio: text('audio').notNull(), // 声音/对白描述
  duration: integer('duration').notNull().default(0), // 时长（秒）
  referenceImage: text('reference_image'), // 参考图 URL
  order: integer('order').notNull().default(0), // 排序序号
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type Storyboard = typeof storyboards.$inferSelect
export type NewStoryboard = typeof storyboards.$inferInsert
