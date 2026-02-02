/* ==================================================
   用户资料更新 API
   PATCH /api/auth/profile
   ================================================== */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSessionWithDev } from '@/lib/session'
import { updateUser, getUserById } from '@/lib/db/queries/users'
import { logger } from '@/lib/logger'

/**
 * 更新资料请求体验证
 */
const updateProfileSchema = z.object({
  name: z.string().min(1, '昵称不能为空').max(50, '昵称不能超过50个字符').optional(),
  avatar: z.string().url('头像URL格式不正确').optional(),
})

/**
 * PATCH /api/auth/profile
 * 更新当前登录用户的资料
 */
export async function PATCH(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // 获取当前会话
    const session = await getSessionWithDev()
    
    if (!session) {
      logger.warn('Unauthorized profile update attempt')
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: '请先登录' },
        { status: 401 }
      )
    }

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
    const validationResult = updateProfileSchema.safeParse(body)
    
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

    const { name, avatar } = validationResult.data

    // 如果没有要更新的字段
    if (name === undefined && avatar === undefined) {
      return NextResponse.json(
        { error: 'NO_CHANGES', message: '没有提供要更新的字段' },
        { status: 400 }
      )
    }

    // 更新用户资料
    const updateData: { name?: string; avatar?: string } = {}
    if (name !== undefined) updateData.name = name
    if (avatar !== undefined) updateData.avatar = avatar

    const updatedUser = await updateUser(session.user.id, updateData)

    if (!updatedUser) {
      logger.error('Failed to update user profile', undefined, { userId: session.user.id })
      return NextResponse.json(
        { error: 'UPDATE_FAILED', message: '更新用户资料失败' },
        { status: 500 }
      )
    }

    // 获取完整的用户信息（包含 aiQuota）
    const fullUser = await getUserById(session.user.id)

    const duration = Date.now() - startTime
    logger.apiResponse('PATCH', '/api/auth/profile', 200, duration)

    return NextResponse.json({
      success: true,
      user: {
        id: fullUser!.id,
        email: fullUser!.email,
        name: fullUser!.name,
        avatar: fullUser!.avatar,
        plan: fullUser!.plan,
        aiQuota: fullUser!.aiQuota,
        createdAt: fullUser!.createdAt,
        updatedAt: fullUser!.updatedAt,
      },
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Profile update error:', error instanceof Error ? error : undefined)
    logger.apiResponse('PATCH', '/api/auth/profile', 500, duration)
    
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '服务器内部错误' },
      { status: 500 }
    )
  }
}
