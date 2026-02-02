import { getDb } from '../index'
import { passwordResets } from '../schema/password-resets'
import { eq, and, gt, lt, isNull } from 'drizzle-orm'
import type { NewPasswordReset } from '../schema/password-resets'

/**
 * 创建密码重置令牌
 */
export async function createPasswordReset(data: NewPasswordReset) {
  const db = getDb()
  const [reset] = await db.insert(passwordResets).values(data).returning()
  return reset
}

/**
 * 根据令牌获取密码重置记录
 */
export async function getPasswordResetByToken(token: string) {
  const db = getDb()
  const [reset] = await db
    .select()
    .from(passwordResets)
    .where(eq(passwordResets.token, token))
    .limit(1)
  return reset
}

/**
 * 获取用户有效的密码重置令牌
 */
export async function getValidPasswordReset(token: string) {
  const db = getDb()
  const now = new Date()
  const [reset] = await db
    .select()
    .from(passwordResets)
    .where(
      and(
        eq(passwordResets.token, token),
        gt(passwordResets.expiresAt, now),
        isNull(passwordResets.usedAt)
      )
    )
    .limit(1)
  return reset
}

/**
 * 标记密码重置令牌为已使用
 */
export async function markPasswordResetAsUsed(token: string) {
  const db = getDb()
  const [reset] = await db
    .update(passwordResets)
    .set({ usedAt: new Date() })
    .where(eq(passwordResets.token, token))
    .returning()
  return reset
}

/**
 * 删除过期的密码重置令牌
 */
export async function deleteExpiredPasswordResets() {
  const db = getDb()
  const now = new Date()
  await db.delete(passwordResets).where(lt(passwordResets.expiresAt, now))
}
