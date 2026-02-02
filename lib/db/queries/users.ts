import { getDb } from '../index'
import { users } from '../schema/users'
import { eq } from 'drizzle-orm'
import type { NewUser } from '../schema/users'

export async function createUser(data: NewUser) {
  const db = getDb()
  const [user] = await db.insert(users).values(data).returning()
  return user
}

export async function getUserById(id: string) {
  const db = getDb()
  const [user] = await db.select().from(users)
    .where(eq(users.id, id))
    .limit(1)
  return user
}

export async function getUserByEmail(email: string) {
  const db = getDb()
  const [user] = await db.select().from(users)
    .where(eq(users.email, email))
    .limit(1)
  return user
}

/**
 * 更新用户信息
 */
export async function updateUser(userId: string, data: Partial<Omit<NewUser, 'id' | 'createdAt'>>) {
  const db = getDb()
  const [user] = await db
    .update(users)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning()
  return user
}

/**
 * 更新用户密码
 */
export async function updateUserPassword(userId: string, passwordHash: string) {
  const db = getDb()
  const [user] = await db
    .update(users)
    .set({
      password: passwordHash,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning()
  return user
}

export async function updateUserQuota(userId: string, used: number) {
  const db = getDb()
  const [user] = await db
    .update(users)
    .set({
      aiQuota: {
        used,
        monthlyLimit: 1000000, // 默认值，实际应该从现有记录获取
        resetAt: new Date(),
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

  const db = getDb()
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
