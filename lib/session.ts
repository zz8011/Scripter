import { cookies } from 'next/headers'
import { getUserById } from '@/lib/db/queries/users'

const SESSION_COOKIE_NAME = 'scripter_session'

export interface Session {
  user: {
    id: string
    email: string
    name: string
  }
  accessToken: string
}

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

export async function getSession(): Promise<Session | null> {
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
