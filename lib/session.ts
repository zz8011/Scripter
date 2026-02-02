import { cookies } from 'next/headers'
import { getUserById, getUserByEmail, createUser } from '@/lib/db/queries/users'
import type { CookieSession as Session } from '@/lib/types'
import { logger } from './logger'

const SESSION_COOKIE_NAME = 'scripter_session'

// 为了向后兼容，重新导出类型
export type { CookieSession as Session } from '@/lib/types'

export async function createSession(session: Session) {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function getSession(): Promise<Session | null>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getSession(_req?: Request): Promise<Session | null>
export async function getSession(_req?: Request): Promise<Session | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

  if (!sessionCookie) {
    return null
  }

  try {
    return JSON.parse(sessionCookie.value) as Session
  } catch {
    return null
  }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

/**
 * Auth helper for API routes
 * Returns session if valid, null otherwise
 */
export async function auth(): Promise<Session | null> {
  const session = await getSession()
  if (!session) {
    return null
  }

  // Verify user still exists
  const user = await getUserById(session.user.id)
  if (!user) {
    await deleteSession()
    return null
  }

  return session
}

/**
 * Development mode: Get or create a test session
 * This is ONLY used in development when authentication is not configured
 */
export async function getDevSession(): Promise<Session> {
  // Check if real session exists
  const existingSession = await getSession()
  if (existingSession) {
    return existingSession
  }

  // In development, try to find or create a test user
  // Extra check: ensure VERCEL_ENV is also 'development' to prevent accidental bypass in production
  if (process.env.NODE_ENV === 'development' && process.env.VERCEL_ENV === 'development') {
    // Try to get existing test user
    let user = await getUserByEmail('dev@scripter.art')

    // Create test user if doesn't exist
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

    return {
      sessionId: crypto.randomUUID(),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      accessToken: 'dev-token-' + user.id,
    }
  }

  // Not in development - no session
  throw new Error('No session available and not in development mode')
}

/**
 * Unified session helper for API routes
 * Tries to get real session first, falls back to dev session in development mode
 */
export async function getSessionWithDev(): Promise<Session | null> {
  const session = await auth()
  if (session) return session

  // Development mode: use test session
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
