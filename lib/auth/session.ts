/**
 * 安全会话管理 - 使用 iron-session 进行 Cookie 签名和加密
 *
 * 功能:
 * - Cookie 签名和加密，防止伪造
 * - 设置 Secure 和 HttpOnly 标志
 * - 统一的会话接口
 */

import { getIronSession, IronSession, SessionOptions } from 'iron-session'
import { cookies } from 'next/headers'
import { getUserById, getUserByEmail, createUser } from '@/lib/db/queries/users'
import { logger } from '@/lib/logger'

/**
 * 会话数据结构
 */
export interface SessionData {
  sessionId: string
  user: {
    id: string
    email: string
    name: string
  }
  accessToken: string
  createdAt: number
  expiresAt: number
}

/**
 * iron-session 配置
 */
const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long_for_iron_session',
  cookieName: 'scripter_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  },
}

/**
 * 获取 iron-session 实例
 */
async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}

/**
 * 创建新会话
 */
export async function createSession(data: Omit<SessionData, 'createdAt' | 'expiresAt'>): Promise<void> {
  const session = await getSession()
  const now = Date.now()

  session.sessionId = data.sessionId
  session.user = data.user
  session.accessToken = data.accessToken
  session.createdAt = now
  session.expiresAt = now + 7 * 24 * 60 * 60 * 1000 // 7 days

  await session.save()
}

/**
 * 获取当前会话
 */
export async function getCurrentSession(): Promise<SessionData | null> {
  try {
    const session = await getSession()

    // 检查会话是否存在
    if (!session.sessionId || !session.user) {
      return null
    }

    // 检查会话是否过期
    if (session.expiresAt && Date.now() > session.expiresAt) {
      await destroySession()
      return null
    }

    // 验证用户是否仍然存在
    const user = await getUserById(session.user.id)
    if (!user) {
      await destroySession()
      return null
    }

    return {
      sessionId: session.sessionId,
      user: session.user,
      accessToken: session.accessToken,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    }
  } catch (error) {
    logger.error('Error getting session:', error instanceof Error ? error : undefined)
    return null
  }
}

/**
 * 销毁会话
 */
export async function destroySession(): Promise<void> {
  const session = await getSession()
  session.destroy()
}

/**
 * 刷新会话过期时间
 */
export async function refreshSession(): Promise<void> {
  const session = await getSession()

  if (session.sessionId && session.user) {
    const now = Date.now()
    session.expiresAt = now + 7 * 24 * 60 * 60 * 1000 // 延长 7 天
    await session.save()
  }
}

/**
 * 开发模式：获取或创建测试会话
 * 仅在开发环境且未配置认证时使用
 */
export async function getDevSession(): Promise<SessionData> {
  // 检查是否已有真实会话
  const existingSession = await getCurrentSession()
  if (existingSession) {
    return existingSession
  }

  // 仅在开发环境允许
  if (process.env.NODE_ENV !== 'development' || process.env.VERCEL_ENV === 'production') {
    throw new Error('Dev session only available in development mode')
  }

  // 获取或创建测试用户
  let user = await getUserByEmail('dev@scripter.art')

  if (!user) {
    user = await createUser({
      email: 'dev@scripter.art',
      name: '开发测试用户',
      plan: 'creator',
      aiQuota: {
        monthlyLimit: 2000000,
        used: 0,
        resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })
  }

  const now = Date.now()
  return {
    sessionId: crypto.randomUUID(),
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    accessToken: 'dev-token-' + user.id,
    createdAt: now,
    expiresAt: now + 7 * 24 * 60 * 60 * 1000,
  }
}

/**
 * 统一会话获取函数
 * 优先获取真实会话，开发模式下回退到测试会话
 */
export async function getSessionWithDev(): Promise<SessionData | null> {
  const session = await getCurrentSession()
  if (session) return session

  // 开发模式：使用测试会话
  if (process.env.NODE_ENV === 'development') {
    try {
      return await getDevSession()
    } catch (error) {
      logger.error('Failed to get dev session:', error instanceof Error ? error : undefined)
      return null
    }
  }

  return null
}

/**
 * 向后兼容：导出旧的函数名
 * @deprecated 使用 getCurrentSession 替代
 */
export { getCurrentSession as getSession }

/**
 * 向后兼容：导出旧的函数名
 * @deprecated 使用 destroySession 替代
 */
export { destroySession as deleteSession }
