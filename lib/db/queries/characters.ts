import { db } from '../index'
import { characters } from '../schema/characters'
import { eq, and, desc, asc } from 'drizzle-orm'
import type { NewCharacter } from '../schema/characters'

/**
 * Create a new character
 */
export async function createCharacter(data: NewCharacter) {
  const [character] = await db.insert(characters).values(data).returning()
  return character
}

/**
 * Get character by ID
 */
export async function getCharacterById(id: string) {
  const character = await db.query.characters.findFirst({
    where: eq(characters.id, id),
  })
  return character
}

/**
 * Get characters by project ID
 */
export async function getCharactersByProjectId(projectId: string) {
  const projectCharacters = await db.query.characters.findMany({
    where: eq(characters.projectId, projectId),
    orderBy: [desc(characters.createdAt)],
  })
  return projectCharacters
}

/**
 * Update character
 */
export async function updateCharacter(id: string, projectId: string, data: Partial<NewCharacter>) {
  const [character] = await db
    .update(characters)
    .set(data)
    .where(and(eq(characters.id, id), eq(characters.projectId, projectId)))
    .returning()
  return character
}

/**
 * Delete character
 */
export async function deleteCharacter(id: string, projectId: string) {
  await db
    .delete(characters)
    .where(and(eq(characters.id, id), eq(characters.projectId, projectId)))
}

/**
 * Add relationship to character
 */
export async function addRelationship(
  characterId: string,
  projectId: string,
  relationship: { targetCharacterId: string; type: string; description: string }
) {
  const character = await getCharacterById(characterId)
  if (!character || character.projectId !== projectId) {
    throw new Error('Character not found or access denied')
  }

  const updatedRelationships = [...character.relationships, relationship]
  return updateCharacter(characterId, projectId, { relationships: updatedRelationships as any })
}

/**
 * Remove relationship from character
 */
export async function removeRelationship(characterId: string, projectId: string, targetCharacterId: string) {
  const character = await getCharacterById(characterId)
  if (!character || character.projectId !== projectId) {
    throw new Error('Character not found or access denied')
  }

  const updatedRelationships = character.relationships.filter(
    r => r.targetCharacterId !== targetCharacterId
  )
  return updateCharacter(characterId, projectId, { relationships: updatedRelationships as any })
}

/**
 * Update relationship
 */
export async function updateRelationship(
  characterId: string,
  projectId: string,
  targetCharacterId: string,
  updates: { type?: string; description?: string }
) {
  const character = await getCharacterById(characterId)
  if (!character || character.projectId !== projectId) {
    throw new Error('Character not found or access denied')
  }

  const updatedRelationships = character.relationships.map(r =>
    r.targetCharacterId === targetCharacterId
      ? { ...r, ...updates }
      : r
  )

  return updateCharacter(characterId, projectId, { relationships: updatedRelationships as any })
}

/**
 * Search characters by name
 */
export async function searchCharactersByName(projectId: string, searchTerm: string) {
  const allCharacters = await getCharactersByProjectId(projectId)
  return allCharacters.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  )
}
