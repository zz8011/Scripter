import { NextRequest, NextResponse } from 'next/server'
import { createWorldviewItem, getWorldviewItemsByProjectId, getWorldviewItemsByCategory } from '@/lib/db/queries/worldview'
import { withAuth, requireProjectAccess } from '@/lib/auth/middleware'
import { createWorldviewSchema } from '@/lib/validation/schemas'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { aggregateWorldRules } from '@/lib/story-bible'

/**
 * GET /api/worldview?projectId=xxx&category=era
 * Get worldview items for a project
 */
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('projectId')
    const category = searchParams.get('category')

    if (!projectId) {
      return NextResponse.json(
        { error: 'BAD_REQUEST', message: '项目 ID 不能为空' },
        { status: 400 }
      )
    }

    // 验证项目访问权限
    await requireProjectAccess(projectId)

    let items
    if (category) {
      items = await getWorldviewItemsByCategory(projectId, category as any)
    } else {
      items = await getWorldviewItemsByProjectId(projectId)
    }

    return NextResponse.json({ items })
  } catch (error) {
    logger.error('Error fetching worldview items:', error instanceof Error ? error : undefined)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '获取世界观列表失败' },
      { status: 500 }
    )
  }
})

/**
 * POST /api/worldview
 * Create a new worldview item
 */
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()

    // 验证输入数据
    const validatedData = createWorldviewSchema.parse(body)

    // 验证项目访问权限
    await requireProjectAccess(validatedData.projectId)

    const item = await createWorldviewItem(validatedData)

    // 异步聚合到 Story Bible（不阻塞响应）
    aggregateWorldRules(validatedData.projectId).catch(err => {
      logger.error('Failed to aggregate world rules:', err)
    })

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: '输入数据验证失败', details: error.errors },
        { status: 400 }
      )
    }

    logger.error('Error creating worldview item:', error instanceof Error ? error : undefined)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '创建世界观失败' },
      { status: 500 }
    )
  }
})

