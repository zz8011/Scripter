import { db } from '../index'
import { julingConfigs } from '../schema/juling-configs'
import { eq } from 'drizzle-orm'
import type { NewJulingConfig } from '../schema/juling-configs'

/**
 * Create or get Juling config for user
 */
export async function getOrCreateJulingConfig(userId: string) {
  const [existing] = await db.select().from(julingConfigs)
    .where(eq(julingConfigs.userId, userId))
    .limit(1)

  if (existing) {
    return existing
  }

  const [config] = await db.insert(julingConfigs).values({ userId }).returning()
  return config
}

/**
 * Get Juling config by user ID
 */
export async function getJulingConfigByUserId(userId: string) {
  const [config] = await db.select().from(julingConfigs)
    .where(eq(julingConfigs.userId, userId))
    .limit(1)
  return config
}

/**
 * Update Juling config
 */
export async function updateJulingConfig(userId: string, data: Partial<NewJulingConfig>) {
  const [config] = await db
    .update(julingConfigs)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(julingConfigs.userId, userId))
    .returning()
  return config
}

/**
 * Update Juling personality
 */
export async function updateJulingPersonality(
  userId: string,
  personality: { elements?: string[]; style?: string }
) {
  const config = await getJulingConfigByUserId(userId)
  if (!config) {
    throw new Error('Juling config not found')
  }

  const updatedPersonality = {
    elements: personality.elements || config.personality.elements,
    style: personality.style || config.personality.style,
  }

  return updateJulingConfig(userId, { personality: updatedPersonality as any })
}

/**
 * Reset Juling config to default
 */
export async function resetJulingConfig(userId: string) {
  return updateJulingConfig(userId, {
    name: '剧灵',
    personality: {
      elements: [],
      style: '温暖、鼓励、专业的创作伙伴',
    } as any,
  })
}
