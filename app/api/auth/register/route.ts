/* ==================================================
   用户注册 API
   POST /api/auth/register
   ================================================== */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { getUserByEmail, createUser } from '@/lib/db/queries/users'
import { createSession } from '@/lib/session'
import { logger } from '@/lib/logger'

/**
 * 注册请求体验证
 */
const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z
    .string()
    .min(8, '密码至少需要8个字符')
    .max(100, '密码不能超过100个字符')
    .regex(/[A-Z]/, '密码需要包含至少一个大写字母')
    .regex(/[a-z]/, '密码需要包含至少一个小写字母')
    .regex(/[0-9]/, '密码需要包含至少一个数字'),
  name: z
    .string()
    .min(1, '昵称不能为空')
    .max(50, '昵称不能超过50个字符'),
})

/**
 * POST /api/auth/register
 * 用户注册
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
    const validationResult = registerSchema.safeParse(body)

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

    const { email, password, name } = validationResult.data
    const normalizedEmail = email.toLowerCase().trim()

    // 检查邮箱是否已存在
    const existingUser = await getUserByEmail(normalizedEmail)

    if (existingUser) {
      return NextResponse.json(
        { error: 'EMAIL_EXISTS', message: '该邮箱已被注册' },
        { status: 409 }
      )
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 12)

    // 创建用户
    const newUser = await createUser({
      email: normalizedEmail,
      name: name.trim(),
      password: passwordHash,
      plan: 'free',
      aiQuota: {
        monthlyLimit: 500,
        used: 0,
        resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    if (!newUser) {
      throw new Error('Failed to create user')
    }

    // 创建会话，自动登录
    await createSession({
      sessionId: crypto.randomUUID(),
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
      accessToken: crypto.randomUUID(),
    })

    const duration = Date.now() - startTime
    logger.info('User registered successfully', { email: newUser.email, userId: newUser.id })
    logger.apiResponse('POST', '/api/auth/register', 200, duration)

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        plan: newUser.plan,
      },
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Registration error:', error instanceof Error ? error : undefined)
    logger.apiResponse('POST', '/api/auth/register', 500, duration)

    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '服务器内部错误' },
      { status: 500 }
    )
  }
}
