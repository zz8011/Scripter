/* ==================================================
   忘记密码 API (简化版 - 开发测试)
   POST /api/auth/forgot-password
   ================================================== */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getUserByEmail } from '@/lib/db/queries/users'
import { createPasswordReset } from '@/lib/db/queries/password-resets'
import { logger } from '@/lib/logger'

/**
 * 忘记密码请求体验证
 */
const forgotPasswordSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
})

/**
 * 生成随机令牌
 */
function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * POST /api/auth/forgot-password
 * 请求密码重置（开发测试版 - 令牌打印到控制台）
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
    const validationResult = forgotPasswordSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: '请输入有效的邮箱地址' },
        { status: 400 }
      )
    }

    const { email } = validationResult.data
    const normalizedEmail = email.toLowerCase().trim()

    // 查找用户
    const user = await getUserByEmail(normalizedEmail)

    // 即使用户不存在，也返回成功（防止邮箱枚举攻击）
    if (!user) {
      logger.warn('Password reset requested for non-existent email', { email })
      return NextResponse.json({
        success: true,
        message: '如果该邮箱已注册，我们将发送密码重置链接',
      })
    }

    // 生成重置令牌
    const token = generateToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1小时后过期

    // 保存令牌到数据库
    await createPasswordReset({
      userId: user.id,
      token,
      expiresAt,
    })

    // 开发测试版：打印到控制台
    logger.info('========================================')
    logger.info('密码重置令牌生成 (开发测试版)')
    logger.info(`邮箱: ${user.email}`)
    logger.info(`令牌: ${token}`)
    logger.info(`重置链接: http://localhost:3000/reset-password?token=${token}`)
    logger.info('========================================')

    // 同时输出到控制台（确保能看到）
    // eslint-disable-next-line no-console
    console.log('')
    // eslint-disable-next-line no-console
    console.log('========================================')
    // eslint-disable-next-line no-console
    console.log('🔑 密码重置令牌 (开发测试版)')
    // eslint-disable-next-line no-console
    console.log(`📧 邮箱: ${user.email}`)
    // eslint-disable-next-line no-console
    console.log(`🔐 令牌: ${token}`)
    // eslint-disable-next-line no-console
    console.log(`🔗 重置链接: http://localhost:3000/reset-password?token=${token}`)
    // eslint-disable-next-line no-console
    console.log('⏰ 有效期: 1小时')
    // eslint-disable-next-line no-console
    console.log('========================================')
    // eslint-disable-next-line no-console
    console.log('')

    const duration = Date.now() - startTime
    logger.apiResponse('POST', '/api/auth/forgot-password', 200, duration)

    return NextResponse.json({
      success: true,
      message: '如果该邮箱已注册，我们将发送密码重置链接',
      // 开发测试版额外返回令牌
      dev: {
        token,
        resetUrl: `http://localhost:3000/reset-password?token=${token}`,
      },
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Forgot password error:', error instanceof Error ? error : undefined)
    logger.apiResponse('POST', '/api/auth/forgot-password', 500, duration)

    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '服务器内部错误' },
      { status: 500 }
    )
  }
}
