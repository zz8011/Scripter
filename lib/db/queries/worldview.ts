import { db } from '../index'
import { worldviewItems } from '../schema/worldview'
import { eq, and, desc, asc } from 'drizzle-orm'
import type { NewWorldviewItem } from '../schema/worldview'

/**
 * Create a new worldview item
 */
export async function createWorldviewItem(data: NewWorldviewItem) {
  const [item] = await db.insert(worldviewItems).values(data).returning()
  return item
}

/**
 * Get worldview item by ID
 */
export async function getWorldviewItemById(id: string) {
  const item = await db.query.worldviewItems.findFirst({
    where: eq(worldviewItems.id, id),
  })
  return item
}

/**
 * Get worldview items by project ID
 */
export async function getWorldviewItemsByProjectId(projectId: string) {
  const items = await db.query.worldviewItems.findMany({
    where: eq(worldviewItems.projectId, projectId),
    orderBy: [asc(worldviewItems.order)],
  })
  return items
}

/**
 * Get worldview items by category
 */
export async function getWorldviewItemsByCategory(
  projectId: string,
  category: 'era' | 'geography' | 'social' | 'mystery' | 'culture' | 'economy' | 'custom'
) {
  const items = await db.query.worldviewItems.findMany({
    where: and(eq(worldviewItems.projectId, projectId), eq(worldviewItems.category, category)),
    orderBy: [asc(worldviewItems.order)],
  })
  return items
}

/**
 * Update worldview item
 */
export async function updateWorldviewItem(id: string, projectId: string, data: Partial<NewWorldviewItem>) {
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
  const allItems = await getWorldviewItemsByProjectId(projectId)

  const grouped = {
    era: [] as typeof allItems,
    geography: [] as typeof allItems,
    social: [] as typeof allItems,
    mystery: [] as typeof allItems,
    culture: [] as typeof allItems,
    economy: [] as typeof allItems,
    custom: [] as typeof allItems,
  }

  for (const item of allItems) {
    grouped[item.category].push(item)
  }

  return grouped
}
