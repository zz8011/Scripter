/**
 * AI 配额管理服务
 *
 * 管理用户的 AI 使用配额
 */

import { checkAIQuota, deductAIQuota, getAIQuotaStatus } from '@/lib/db/queries/users'

export interface QuotaCheckResult {
  allowed: boolean
  hasQuota: boolean
  reason?: string
  remaining?: number
  resetAt?: Date
}

/**
 * 检查用户是否有足够的 AI 配额
 */
export async function checkUserQuota(userId: string, tokensNeeded: number): Promise<QuotaCheckResult> {
  try {
    const hasQuota = await checkAIQuota(userId, tokensNeeded)

    if (!hasQuota) {
      const status = await getAIQuotaStatus(userId)
      return {
        allowed: false,
        hasQuota: false,
        reason: 'AI_QUOTA_EXCEEDED',
        remaining: status.remaining,
        resetAt: status.resetAt,
      }
    }

    return { allowed: true, hasQuota: true }
  } catch (error) {
    console.error('Error checking user quota:', error)
    return {
      allowed: false,
      hasQuota: false,
      reason: 'QUOTA_CHECK_ERROR',
    }
  }
}

/**
 * 扣除用户 AI 配额
 * 注意：这不是 React Hook，只是普通的异步函数
 */
export async function deductQuota(userId: string, tokensUsed: number): Promise<void> {
  try {
    await deductAIQuota(userId, tokensUsed)
  } catch (error) {
    console.error('Error deducting quota:', error)
    throw error
  }
}

/**
 * 扣除用户 AI 配额（兼容旧名称）
 * @deprecated 请使用 deductQuota 替代
 */
export async function useQuota(userId: string, tokensUsed: number): Promise<void> {
  return deductQuota(userId, tokensUsed)
}

/**
 * 获取用户配额状态
 */
export async function getUserQuotaStatus(userId: string) {
  try {
    return await getAIQuotaStatus(userId)
  } catch (error) {
    console.error('Error getting quota status:', error)
    throw error
  }
}

/**
 * 计划级别的配额限制
 */
export const PLAN_LIMITS: Record<string, number> = {
  free: 500000,      // 免费版：50万 tokens/月
  creator: 2000000,  // 创作者版：200万 tokens/月
  pro: 5000000,      // 专业版：500万 tokens/月
  studio: 20000000,  // 工作室版：2000万 tokens/月
}

/**
 * 根据计划获取月度配额限制
 */
export function getPlanLimit(plan: string): number {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free
}
