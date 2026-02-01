import { NextResponse } from 'next/server'
import { getUserByEmail, createUser } from '@/lib/db/queries/users'
import { createSession } from '@/lib/session'

/**
 * POST /api/auth/dev-login
 * 开发模式快速登录 - 仅用于开发测试
 */
export async function POST() {
  // 仅在开发模式下可用
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Dev login is only available in development mode' },
      { status: 403 }
    )
  }

  try {
    // 查找或创建开发测试用户
    let user = await getUserByEmail('dev@scripter.art')

    if (!user) {
      user = await createUser({
        email: 'dev@scripter.art',
        name: '开发测试用户',
        plan: 'creator',
        aiQuota: {
          monthlyLimit: 2000000, // 200万 tokens
          used: 0,
          resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })
    }

    // 创建会话
    await createSession({
      sessionId: 'dev-session-' + user.id,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      accessToken: 'dev-token-' + user.id,
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Dev login error:', error)
    return NextResponse.json(
      { error: 'Failed to create dev session' },
      { status: 500 }
    )
  }
}
