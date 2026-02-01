import { getDb } from '../index'
import { worldviewItems } from '../schema/worldview'
import { eq, and, desc, asc } from 'drizzle-orm'
import type { NewWorldviewItem, WorldviewItem } from '../schema/worldview'

/**
 * Create a new worldview item
 */
export async function createWorldviewItem(data: NewWorldviewItem) {
  const db = getDb()
  const [item] = await db.insert(worldviewItems).values(data).returning()
  return item
}

/**
 * Get worldview item by ID
 */
export async function getWorldviewItemById(id: string) {
  const db = getDb()
  const [item] = await db.select().from(worldviewItems)
    .where(eq(worldviewItems.id, id))
    .limit(1)
  return item
}

/**
 * Get worldview items by project ID
 */
export async function getWorldviewItemsByProjectId(projectId: string) {
  const db = getDb()
  const items = await db.select().from(worldviewItems)
    .where(eq(worldviewItems.projectId, projectId))
    .orderBy(asc(worldviewItems.order))
  return items
}

/**
 * Get worldview items by category
 */
export async function getWorldviewItemsByCategory(
  projectId: string,
  category: 'era' | 'geography' | 'social' | 'mystery' | 'culture' | 'economy' | 'custom'
) {
  const db = getDb()
  const items = await db.select().from(worldviewItems)
    .where(and(eq(worldviewItems.projectId, projectId), eq(worldviewItems.category, category)))
    .orderBy(asc(worldviewItems.order))
  return items
}

/**
 * Update worldview item
 */
export async function updateWorldviewItem(id: string, projectId: string, data: Partial<NewWorldviewItem>) {
  const db = getDb()
  const [item] = await db
    .update(worldviewItems)
    .set(data)
    .where(and(eq(worldviewItems.id, id), eq(worldviewItems.projectId, projectId)))
    .returning()
  return item
}

/**
 * Delete worldview item
 */
export async function deleteWorldviewItem(id: string, projectId: string) {
  const db = getDb()
  await db
    .delete(worldviewItems)
    .where(and(eq(worldviewItems.id, id), eq(worldviewItems.projectId, projectId)))
}

/**
 * Reorder worldview items
 */
export async function reorderWorldviewItems(projectId: string, itemIds: string[]) {
  const updatePromises = itemIds.map((id, index) =>
    updateWorldviewItem(id, projectId, { order: index })
  )
  await Promise.all(updatePromises)
}

/**
 * Get worldview items grouped by category
 */
export async function getWorldviewItemsGrouped(projectId: string) {
  const allItems: WorldviewItem[] = await getWorldviewItemsByProjectId(projectId)

  const grouped = {
    era: [] as WorldviewItem[],
    geography: [] as WorldviewItem[],
    social: [] as WorldviewItem[],
    mystery: [] as WorldviewItem[],
    culture: [] as WorldviewItem[],
    economy: [] as WorldviewItem[],
    custom: [] as WorldviewItem[],
  }

  for (const item of allItems) {
    (grouped as any)[item.category].push(item)
  }

  return grouped
}
