import { NextRequest, NextResponse } from 'next/server'
import { getProjectById, updateProject, deleteProject } from '@/lib/db/queries'
import { withProjectAuth } from '@/lib/auth/middleware'
import { updateProjectSchema } from '@/lib/validation/schemas'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { aggregateCreativeIntent } from '@/lib/story-bible'

export const dynamic = 'force-dynamic'

/**
 * GET /api/projects/[id]
 * Get a single project
 */
export const GET = withProjectAuth(async (_request, _session, projectId) => {
  try {
    const project = await getProjectById(projectId)

    if (!project) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: '项目不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({ project })
  } catch (error) {
    logger.error('Get project error:', error instanceof Error ? error : undefined)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '获取项目失败' },
      { status: 500 }
    )
  }
})

/**
 * PATCH /api/projects/[id]
 * Update a project
 */
export const PATCH = withProjectAuth(async (request, _session, projectId) => {
  try {
    const body = await request.json()
    const validatedData = updateProjectSchema.parse(body)

    const updated = await updateProject(projectId, validatedData)

    // 异步聚合到 Story Bible（不阻塞响应）
    aggregateCreativeIntent(projectId).catch(err => {
      logger.error('Failed to aggregate creative intent:', err)
    })

    return NextResponse.json({ project: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: '输入数据验证失败', details: error.errors },
        { status: 400 }
      )
    }

    logger.error('Update project error:', error instanceof Error ? error : undefined)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '更新项目失败' },
      { status: 500 }
    )
  }
})

/**
 * DELETE /api/projects/[id]
 * Delete a project
 */
export const DELETE = withProjectAuth(async (_request, session, projectId) => {
  try {
    await deleteProject(projectId, session.user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Delete project error:', error instanceof Error ? error : undefined)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '删除项目失败' },
      { status: 500 }
    )
  }
})
