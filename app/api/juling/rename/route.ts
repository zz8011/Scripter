import { NextRequest, NextResponse } from 'next/server'
import { getSessionWithDev } from '@/lib/session'
import { checkUserQuota } from '@/lib/quota'
import { updateJulingConfig, getJulingConfigByUserId } from '@/lib/db/queries/juling-configs'
import { logger } from '@/lib/logger'

/**
 * POST /api/juling/rename
 * 重命名剧灵
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 认证检查
    const session = await getSessionWithDev()
    if (!session) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: '请先登录' },
        { status: 401 }
      )
    }

    // 2. 配额检查 (重命名消耗 10 tokens)
    const quotaCheck = await checkUserQuota(session.user.id, 10)
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        {
          error: 'QUOTA_EXCEEDED',
          message: 'AI 配额已用完',
          details: {
            remaining: quotaCheck.remaining,
            resetAt: quotaCheck.resetAt,
          },
        },
        { status: 403 }
      )
    }

    // 3. 解析请求体
    const body = await request.json()
    const { name } = body as { name?: string }

    // 4. 验证名称
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'INVALID_INPUT', message: '缺少 name 参数' },
        { status: 400 }
      )
    }

    if (name.length < 1 || name.length > 20) {
      return NextResponse.json(
        { error: 'INVALID_INPUT', message: '剧灵名称长度必须在 1-20 个字符之间' },
        { status: 400 }
      )
    }

    // 5. 检查配置是否存在
    const existingConfig = await getJulingConfigByUserId(session.user.id)
    if (!existingConfig) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: '剧灵配置不存在' },
        { status: 404 }
      )
    }

    // 6. 更新名称
    const config = await updateJulingConfig(session.user.id, { name })

    logger.info('Renamed Juling for user ' + session.user.id, {
      oldName: existingConfig.name,
      newName: name,
    })

    // 7. 返回结果
    return NextResponse.json({
      success: true,
      data: {
        id: config.id,
        name: config.name,
        previousName: existingConfig.name,
        birthDate: config.birthDate?.toISOString() || null,
        personality: config.personality,
        updatedAt: config.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    logger.error('Error renaming Juling:', error as Error)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '重命名剧灵时发生错误' },
      { status: 500 }
    )
  }
}
