import { NextRequest, NextResponse } from 'next/server'
import { getSessionWithDev } from '@/lib/session'
import {  updateJulingConfig, getOrCreateJulingConfig } from '@/lib/db/queries/juling-configs'
import { logger } from '@/lib/logger'

/**
 * GET /api/juling/config
 * 获取当前用户剧灵配置
 */
export async function GET() {
  try {
    // 1. 认证检查
    const session = await getSessionWithDev()
    if (!session) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: '请先登录' },
        { status: 401 }
      )
    }

    // 2. 获取或创建剧灵配置
    const config = await getOrCreateJulingConfig(session.user.id)

    logger.info('Fetched Juling config for user ' + session.user.id)

    // 3. 返回配置
    return NextResponse.json({
      success: true,
      data: {
        id: config.id,
        name: config.name,
        birthDate: config.birthDate?.toISOString() || null,
        personality: config.personality,
        createdAt: config.createdAt.toISOString(),
        updatedAt: config.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    logger.error('Error fetching Juling config:', error as Error)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '获取剧灵配置时发生错误' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/juling/config
 * 更新剧灵配置
 */
export async function PUT(request: NextRequest) {
  try {
    // 1. 认证检查
    const session = await getSessionWithDev()
    if (!session) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: '请先登录' },
        { status: 401 }
      )
    }

    // 2. 解析请求体
    const body = await request.json()
    const { name, birthDate, personality } = body as {
      name?: string
      birthDate?: string
      personality?: {
        elements?: string[]
        style?: string
      }
    }

    // 3. 构建更新数据
    const updateData: Parameters<typeof updateJulingConfig>[1] = {}

    if (name !== undefined) {
      if (typeof name !== 'string' || name.length < 1 || name.length > 20) {
        return NextResponse.json(
          { error: 'INVALID_INPUT', message: '剧灵名称长度必须在 1-20 个字符之间' },
          { status: 400 }
        )
      }
      updateData.name = name
    }

    if (birthDate !== undefined) {
      const date = new Date(birthDate)
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { error: 'INVALID_INPUT', message: '无效的日期格式' },
          { status: 400 }
        )
      }
      updateData.birthDate = date
    }

    if (personality !== undefined) {
      updateData.personality = personality as any
    }

    // 4. 检查是否有数据要更新
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'INVALID_INPUT', message: '没有提供要更新的数据' },
        { status: 400 }
      )
    }

    // 5. 更新配置
    const config = await updateJulingConfig(session.user.id, updateData)

    if (!config) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: '剧灵配置不存在' },
        { status: 404 }
      )
    }

    logger.info('Updated Juling config for user ' + session.user.id, {
      updatedFields: Object.keys(updateData),
    })

    // 6. 返回更新后的配置
    return NextResponse.json({
      success: true,
      data: {
        id: config.id,
        name: config.name,
        birthDate: config.birthDate?.toISOString() || null,
        personality: config.personality,
        createdAt: config.createdAt.toISOString(),
        updatedAt: config.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    logger.error('Error updating Juling config:', error as Error)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '更新剧灵配置时发生错误' },
      { status: 500 }
    )
  }
}

