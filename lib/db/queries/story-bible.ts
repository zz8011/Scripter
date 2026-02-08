import { db } from '../index'
import { storyBibles } from '../schema/story-bible'
import { eq } from 'drizzle-orm'
import type { NewStoryBible, StoryBible } from '../schema/story-bible'

/**
 * Create a new Story Bible for a project
 */
export async function createStoryBible(data: NewStoryBible) {
  const [storyBible] = await db.insert(storyBibles).values(data).returning()
  return storyBible
}

/**
 * Get Story Bible by project ID
 */
export async function getStoryBibleByProjectId(projectId: string): Promise<StoryBible | undefined> {
  const [storyBible] = await db.select().from(storyBibles)
    .where(eq(storyBibles.projectId, projectId))
    .limit(1)
  return storyBible
}

/**
 * Get or create Story Bible for a project
 * If Story Bible doesn't exist, create one with default values
 */
export async function getOrCreateStoryBible(projectId: string): Promise<StoryBible> {
  let storyBible = await getStoryBibleByProjectId(projectId)

  if (!storyBible) {
    storyBible = await createStoryBible({ projectId })
  }

  return storyBible
}

/**
 * Update Story Bible (full update)
 */
export async function updateStoryBible(
  projectId: string,
  data: Partial<Omit<NewStoryBible, 'projectId'>>
) {
  const [storyBible] = await db
    .update(storyBibles)
    .set({
      ...data,
      lastUpdatedAt: new Date()
    })
    .where(eq(storyBibles.projectId, projectId))
    .returning()
  return storyBible
}

/**
 * Update World Rules (partial update)
 */
export async function updateWorldRules(
  projectId: string,
  worldRules: Partial<StoryBible['worldRules']>
) {
  const storyBible = await getOrCreateStoryBible(projectId)

  const updatedWorldRules = {
    ...storyBible.worldRules,
    ...worldRules
  }

  return updateStoryBible(projectId, { worldRules: updatedWorldRules })
}

/**
 * Update Character Profiles (replace all)
 */
export async function updateCharacterProfiles(
  projectId: string,
  characterProfiles: StoryBible['characterProfiles']
) {
  return updateStoryBible(projectId, { characterProfiles })
}

/**
 * Update single Character Profile
 */
export async function updateCharacterProfile(
  projectId: string,
  characterId: string,
  profileData: Partial<StoryBible['characterProfiles'][0]>
) {
  const storyBible = await getOrCreateStoryBible(projectId)

  const updatedProfiles = storyBible.characterProfiles.map(profile =>
    profile.id === characterId
      ? { ...profile, ...profileData }
      : profile
  )

  // If character doesn't exist, add it
  if (!updatedProfiles.find(p => p.id === characterId)) {
    updatedProfiles.push({
      id: characterId,
      name: profileData.name || '',
      role: profileData.role || 'supporting',
      personality: profileData.personality || '',
      speechStyle: profileData.speechStyle || '',
      relationships: profileData.relationships || [],
      arc: profileData.arc || ''
    })
  }

  return updateStoryBible(projectId, { characterProfiles: updatedProfiles })
}

/**
 * Remove Character Profile
 */
export async function removeCharacterProfile(projectId: string, characterId: string) {
  const storyBible = await getOrCreateStoryBible(projectId)

  const updatedProfiles = storyBible.characterProfiles.filter(
    profile => profile.id !== characterId
  )

  return updateStoryBible(projectId, { characterProfiles: updatedProfiles })
}

/**
 * Update Plot Outline (replace all)
 */
export async function updatePlotOutline(
  projectId: string,
  plotOutline: StoryBible['plotOutline']
) {
  return updateStoryBible(projectId, { plotOutline })
}

/**
 * Update single Scene in Plot Outline
 */
export async function updateSceneInPlotOutline(
  projectId: string,
  sceneId: string,
  sceneData: Partial<StoryBible['plotOutline'][0]>
) {
  const storyBible = await getOrCreateStoryBible(projectId)

  const updatedOutline = storyBible.plotOutline.map(scene =>
    scene.sceneId === sceneId
      ? { ...scene, ...sceneData }
      : scene
  )

  // If scene doesn't exist, add it
  if (!updatedOutline.find(s => s.sceneId === sceneId)) {
    updatedOutline.push({
      sceneId,
      sceneNumber: sceneData.sceneNumber || 0,
      summary: sceneData.summary || '',
      characters: sceneData.characters || [],
      plotPoints: sceneData.plotPoints || []
    })
  }

  // Sort by scene number
  updatedOutline.sort((a, b) => a.sceneNumber - b.sceneNumber)

  return updateStoryBible(projectId, { plotOutline: updatedOutline })
}

/**
 * Remove Scene from Plot Outline
 */
export async function removeSceneFromPlotOutline(projectId: string, sceneId: string) {
  const storyBible = await getOrCreateStoryBible(projectId)

  const updatedOutline = storyBible.plotOutline.filter(
    scene => scene.sceneId !== sceneId
  )

  return updateStoryBible(projectId, { plotOutline: updatedOutline })
}

/**
 * Update Creative Intent (partial update)
 */
export async function updateCreativeIntent(
  projectId: string,
  creativeIntent: Partial<StoryBible['creativeIntent']>
) {
  const storyBible = await getOrCreateStoryBible(projectId)

  const updatedIntent = {
    ...storyBible.creativeIntent,
    ...creativeIntent
  }

  return updateStoryBible(projectId, { creativeIntent: updatedIntent })
}

/**
 * Delete Story Bible
 */
export async function deleteStoryBible(projectId: string) {
  await db
    .delete(storyBibles)
    .where(eq(storyBibles.projectId, projectId))
}
