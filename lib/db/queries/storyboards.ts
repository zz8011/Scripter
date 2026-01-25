import { db } from '../index'
import { storyboards } from '../schema/storyboards'
import { eq, and, asc, desc } from 'drizzle-orm'
import type { NewStoryboard } from '../schema/storyboards'

/**
 * Create a new storyboard
 */
export async function createStoryboard(data: NewStoryboard) {
  const [storyboard] = await db.insert(storyboards).values(data).returning()
  return storyboard
}

/**
 * Get storyboard by ID
 */
export async function getStoryboardById(id: string) {
  const storyboard = await db.query.storyboards.findFirst({
    where: eq(storyboards.id, id),
  })
  return storyboard
}

/**
 * Get storyboards by project ID
 */
export async function getStoryboardsByProjectId(projectId: string) {
  const projectStoryboards = await db.query.storyboards.findMany({
    where: eq(storyboards.projectId, projectId),
    orderBy: [asc(storyboards.order)],
  })
  return projectStoryboards
}

/**
 * Get storyboards by scene ID
 */
export async function getStoryboardsBySceneId(sceneId: string) {
  const sceneStoryboards = await db.query.storyboards.findMany({
    where: eq(storyboards.sceneId, sceneId),
    orderBy: [asc(storyboards.order)],
  })
  return sceneStoryboards
}

/**
 * Update storyboard
 */
export async function updateStoryboard(id: string, data: Partial<NewStoryboard>) {
  const [storyboard] = await db
    .update(storyboards)
    .set(data)
    .where(eq(storyboards.id, id))
    .returning()
  return storyboard
}

/**
 * Delete storyboard
 */
export async function deleteStoryboard(id: string, projectId: string) {
  await db
    .delete(storyboards)
    .where(and(eq(storyboards.id, id), eq(storyboards.projectId, projectId)))
}

/**
 * Reorder storyboards for a scene
 */
export async function reorderStoryboards(sceneId: string, storyboardIds: string[]) {
  const updatePromises = storyboardIds.map((id, index) =>
    updateStoryboard(id, { order: index })
  )
  await Promise.all(updatePromises)
}

/**
 * Get total duration for a scene
 */
export async function getSceneStoryboardDuration(sceneId: string) {
  const sceneStoryboards = await getStoryboardsBySceneId(sceneId)
  return sceneStoryboards.reduce((total, sb) => total + sb.duration, 0)
}
