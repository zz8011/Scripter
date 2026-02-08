/**
 * 会话管理 - 向后兼容层
 *
 * 此文件保留用于向后兼容，所有函数都重定向到新的安全实现
 * 新代码应直接使用 lib/auth/session.ts
 *
 * @deprecated 使用 lib/auth/session.ts 替代
 */

import {
  createSession as createSecureSession,
  getCurrentSession,
  destroySession as destroySecureSession,
  getSessionWithDev as getSecureSessionWithDev,
  getDevSession as getSecureDevSession,
  SessionData,
} from '@/lib/auth/session'
import type { CookieSession } from '@/lib/types'

const SESSION_COOKIE_NAME = 'scripter_session'

// 为了向后兼容，重新导出类型
export type { CookieSession as Session } from '@/lib/types'

/**
 * 将 SessionData 转换为 CookieSession
 */
function convertToCookieSession(sessionData: SessionData | null): CookieSession | null {
  if (!sessionData) return null

  return {
    sessionId: sessionData.sessionId,
    user: sessionData.user,
    accessToken: sessionData.accessToken,
  }
}

/**
 * 将 CookieSession 转换为 SessionData
 */
function convertToSessionData(cookieSession: CookieSession): Omit<SessionData, 'createdAt' | 'expiresAt'> {
  return {
    sessionId: cookieSession.sessionId,
    user: cookieSession.user,
    accessToken: cookieSession.accessToken,
  }
}

/**
 * @deprecated 使用 lib/auth/session.ts 中的 createSession
 */
export async function createSession(session: CookieSession) {
  await createSecureSession(convertToSessionData(session))
}

/**
 * @deprecated 使用 lib/auth/session.ts 中的 getCurrentSession
 */
export async function getSession(): Promise<CookieSession | null>
export async function getSession(_req?: Request): Promise<CookieSession | null>
export async function getSession(_req?: Request): Promise<CookieSession | null> {
  const sessionData = await getCurrentSession()
  return convertToCookieSession(sessionData)
}

/**
 * @deprecated 使用 lib/auth/session.ts 中的 destroySession
 */
export async function deleteSession() {
  await destroySecureSession()
}

/**
 * @deprecated 使用 lib/auth/session.ts 中的 getCurrentSession
 */
export async function auth(): Promise<CookieSession | null> {
  const sessionData = await getCurrentSession()
  return convertToCookieSession(sessionData)
}

/**
 * @deprecated 使用 lib/auth/session.ts 中的 getDevSession
 */
export async function getDevSession(): Promise<CookieSession> {
  const sessionData = await getSecureDevSession()
  return convertToCookieSession(sessionData)!
}

/**
 * @deprecated 使用 lib/auth/middleware.ts 中的 withAuth
 */
export async function getSessionWithDev(): Promise<CookieSession | null> {
  const sessionData = await getSecureSessionWithDev()
  return convertToCookieSession(sessionData)
}

// 导出常量以保持兼容性
export { SESSION_COOKIE_NAME }

