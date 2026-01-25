import { db } from '../index'
import { users } from '../schema/users'
import { eq } from 'drizzle-orm'
import type { NewUser } from '../schema/users'

export async function createUser(data: NewUser) {
  const [user] = await db.insert(users).values(data).returning()
  return user
}

export async function getUserById(id: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
  })
  return user
}

export async function getUserByEmail(email: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  })
  return user
}

export async function updateUserQuota(userId: string, used: number) {
  const [user] = await db
    .update(users)
    .set({
      aiQuota: {
        used,
      },
    })
    .where(eq(users.id, userId))
    .returning()
  return user
}

/**
 * Check if user has enough AI quota
 */
export async function checkAIQuota(userId: string, tokensNeeded: number): Promise<boolean> {
  const user = await getUserById(userId)
  if (!user) {
    return false
  }

  const { aiQuota } = user
  const now = new Date()

  // Reset quota if needed
  if (aiQuota.resetAt < now) {
    await resetAIQuota(userId)
    return true
  }

  return (aiQuota.used + tokensNeeded) <= aiQuota.monthlyLimit
}

/**
 * Reset user's AI quota (called monthly)
 */
export async function resetAIQuota(userId: string) {
  const user = await getUserById(userId)
  if (!user) {
    throw new Error('User not found')
  }

  const newResetDate = new Date()
  newResetDate.setMonth(newResetDate.getMonth() + 1)

  const [updated] = await db
    .update(users)
    .set({
      aiQuota: {
        monthlyLimit: user.aiQuota.monthlyLimit,
        used: 0,
        resetAt: newResetDate,
      },
    })
    .where(eq(users.id, userId))
    .returning()

  return updated
}

/**
 * Deduct tokens from user's quota
 */
export async function deductAIQuota(userId: string, tokensUsed: number) {
  const user = await getUserById(userId)
  if (!user) {
    throw new Error('User not found')
  }

  const newUsed = user.aiQuota.used + tokensUsed
  return updateUserQuota(userId, newUsed)
}

/**
 * Get user's AI quota status
 */
export async function getAIQuotaStatus(userId: string) {
  const user = await getUserById(userId)
  if (!user) {
    throw new Error('User not found')
  }

  const { aiQuota } = user
  const remaining = aiQuota.monthlyLimit - aiQuota.used
  const percentageUsed = (aiQuota.used / aiQuota.monthlyLimit) * 100

  return {
    monthlyLimit: aiQuota.monthlyLimit,
    used: aiQuota.used,
    remaining: Math.max(0, remaining),
    percentageUsed: Math.min(100, percentageUsed),
    resetAt: aiQuota.resetAt,
    daysUntilReset: Math.ceil((aiQuota.resetAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  }
}
