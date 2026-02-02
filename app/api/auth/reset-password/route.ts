/* ==================================================
   重置密码 API
   POST /api/auth/reset-password
   ================================================== */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { getValidPasswordReset, markPasswordResetAsUsed } from '@/lib/db/queries/password-resets'
import { updateUserPassword } from '@/lib/db/queries/users'
import { logger } from '@/lib/logger'

/**
 * 重置密码请求体验证
 */
const resetPasswordSchema = z.object({
  token: z.string().min(1, '令牌不能为空'),
  password: z
    .string()
    .min(8, '密码至少需要8个字符')
    .max(100, '密码不能超过100个字符')
    .regex(/[A-Z]/, '密码需要包含至少一个大写字母')
    .regex(/[a-z]/, '密码需要包含至少一个小写字母')
    .regex(/[0-9]/, '密码需要包含至少一个数字'),
})

/**
 * POST /api/auth/reset-password
 * 使用令牌重置密码
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
    const validationResult = resetPasswordSchema.safeParse(body)

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

    const { token, password } = validationResult.data

    // 验证令牌是否有效
    const resetRecord = await getValidPasswordReset(token)

    if (!resetRecord) {
      return NextResponse.json(
        { error: 'INVALID_TOKEN', message: '令牌无效或已过期' },
        { status: 400 }
      )
    }

    // 加密新密码
    const passwordHash = await bcrypt.hash(password, 12)

    // 更新用户密码
    const updatedUser = await updateUserPassword(resetRecord.userId, passwordHash)

    if (!updatedUser) {
      throw new Error('Failed to update user password')
    }

    // 标记令牌为已使用
    await markPasswordResetAsUsed(token)

    const duration = Date.now() - startTime
    logger.info('Password reset successfully', { userId: resetRecord.userId })
    logger.apiResponse('POST', '/api/auth/reset-password', 200, duration)

    return NextResponse.json({
      success: true,
      message: '密码重置成功，请使用新密码登录',
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Reset password error:', error instanceof Error ? error : undefined)
    logger.apiResponse('POST', '/api/auth/reset-password', 500, duration)

    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '服务器内部错误' },
      { status: 500 }
    )
  }
}
