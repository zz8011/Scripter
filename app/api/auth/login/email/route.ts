/* ==================================================
   邮箱密码登录 API
   POST /api/auth/login/email
   ================================================== */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { getUserByEmail } from '@/lib/db/queries/users'
import { createSession } from '@/lib/session'
import { logger } from '@/lib/logger'

/**
 * 登录请求体验证
 */
const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
})

/**
 * POST /api/auth/login/email
 * 使用邮箱和密码登录
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // 解析请求体
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'INVALID_JSON', message: '请求体格式错误' },
        { status: 400 }
      )
    }

    // 验证请求数据
    const validationResult = loginSchema.safeParse(body)

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      }))

      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: '数据验证失败', errors },
        { status: 400 }
      )
    }

    const { email, password } = validationResult.data

    // 查找用户
    const user = await getUserByEmail(email.toLowerCase().trim())

    if (!user) {
      logger.warn('Login attempt with non-existent email', { email })
      return NextResponse.json(
        { error: 'INVALID_CREDENTIALS', message: '邮箱或密码错误' },
        { status: 401 }
      )
    }

    // 检查是否有密码（OAuth 用户可能没有密码）
    if (!user.password) {
      logger.warn('Login attempt for OAuth user without password', { email })
      return NextResponse.json(
        { error: 'NO_PASSWORD', message: '此账户使用第三方登录，请使用 OAuth 登录' },
        { status: 401 }
      )
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      logger.warn('Login attempt with invalid password', { email })
      return NextResponse.json(
        { error: 'INVALID_CREDENTIALS', message: '邮箱或密码错误' },
        { status: 401 }
      )
    }

    // 创建会话
    await createSession({
      sessionId: crypto.randomUUID(),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      accessToken: crypto.randomUUID(),
    })

    const duration = Date.now() - startTime
    logger.info('User logged in successfully', { email: user.email, userId: user.id })
    logger.apiResponse('POST', '/api/auth/login/email', 200, duration)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        plan: user.plan,
      },
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Login error:', error instanceof Error ? error : undefined)
    logger.apiResponse('POST', '/api/auth/login/email', 500, duration)

    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '服务器内部错误' },
      { status: 500 }
    )
  }
}
