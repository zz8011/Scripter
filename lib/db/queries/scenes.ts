import { db } from '../index'
import { scenes } from '../schema/scenes'
import { eq, and, desc, asc } from 'drizzle-orm'
import type { NewScene } from '../schema/scenes'

/**
 * Create a new scene
 */
export async function createScene(data: NewScene) {
  const [scene] = await db.insert(scenes).values(data).returning()
  return scene
}

/**
 * Get scene by ID
 */
export async function getSceneById(id: string) {
  const scene = await db.query.scenes.findFirst({
    where: eq(scenes.id, id),
  })
  return scene
}

/**
 * Get scenes by project ID
 */
export async function getScenesByProjectId(projectId: string) {
  const projectScenes = await db.query.scenes.findMany({
    where: eq(scenes.projectId, projectId),
    orderBy: [asc(scenes.episodeNumber), asc(scenes.sceneNumber)],
  })
  return projectScenes
}

/**
 * Get scenes by episode number
 */
export async function getScenesByEpisode(projectId: string, episodeNumber: number) {
  const episodeScenes = await db.query.scenes.findMany({
    where: and(eq(scenes.projectId, projectId), eq(scenes.episodeNumber, episodeNumber)),
    orderBy: [asc(scenes.sceneNumber)],
  })
  return episodeScenes
}

/**
 * Update scene
 */
export async function updateScene(id: string, projectId: string, data: Partial<NewScene>) {
  const [scene] = await db
    .update(scenes)
    .set(data)
    .where(and(eq(scenes.id, id), eq(scenes.projectId, projectId)))
    .returning()
  return scene
}

/**
 * Delete scene
 */
export async function deleteScene(id: string, projectId: string) {
  await db
    .delete(scenes)
    .where(and(eq(scenes.id, id), eq(scenes.projectId, projectId)))
}

/**
 * Get next scene number for episode
 */
export async function getNextSceneNumber(projectId: string, episodeNumber: number) {
  const episodeScenes = await getScenesByEpisode(projectId, episodeNumber)
  if (episodeScenes.length === 0) {
    return 1
  }
  return Math.max(...episodeScenes.map(s => s.sceneNumber)) + 1
}

/**
 * Reorder scenes in episode
 */
export async function reorderScenes(projectId: string, episodeNumber: number, sceneIds: string[]) {
  const updatePromises = sceneIds.map((id, index) =>
    updateScene(id, projectId, { sceneNumber: index + 1 })
  )
  await Promise.all(updatePromises)
}

/**
 * Get total duration for episode
 */
export async function getEpisodeDuration(projectId: string, episodeNumber: number) {
  const episodeScenes = await getScenesByEpisode(projectId, episodeNumber)
  return episodeScenes.reduce((total, scene) => total + scene.duration, 0)
}

/**
 * Get total duration for project
 */
export async function getProjectDuration(projectId: string) {
  const projectScenes = await getScenesByProjectId(projectId)
  return projectScenes.reduce((total, scene) => total + scene.duration, 0)
}

/**
 * Get scene count for episode
 */
export async function getEpisodeSceneCount(projectId: string, episodeNumber: number) {
  const episodeScenes = await getScenesByEpisode(projectId, episodeNumber)
  return episodeScenes.length
}

/**
 * Get episode count for project
 */
export async function getProjectEpisodeCount(projectId: string) {
  const projectScenes = await getScenesByProjectId(projectId)
  const episodes = new Set(projectScenes.map(s => s.episodeNumber))
  return episodes.size
}

/**
 * Update scene status
 */
export async function updateSceneStatus(id: string, projectId: string, status: 'draft' | 'completed') {
  return updateScene(id, projectId, { status })
}
