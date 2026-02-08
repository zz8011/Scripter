import { NextRequest, NextResponse } from 'next/server'
import { updateScene, deleteScene, getSceneById } from '@/lib/db/queries/scenes'
import { withAuth, requireProjectAccess } from '@/lib/auth/middleware'
import { updateSceneSchema } from '@/lib/validation/schemas'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { aggregatePlotOutline, removeSceneFromStoryBible } from '@/lib/story-bible'

/**
 * PATCH /api/scenes/[id]
 * Partially update a scene (for auto-save)
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await withAuth(async () => {
      return { success: true } as any
    })(request)

    const params = await Promise.resolve(context.params)
    const { id } = params
    const body = await request.json()
    const { content } = body

    // 验证 content
    if (!content) {
      return NextResponse.json(
        { error: 'BAD_REQUEST', message: '内容不能为空' },
        { status: 400 }
      )
    }

    // 获取场景以验证项目访问权限
    const existingScene = await getSceneById(id)
    if (!existingScene) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: '场景不存在' },
        { status: 404 }
      )
    }

    // 验证项目访问权限
    await requireProjectAccess(existingScene.projectId)

    // 仅更新 content 字段
    const scene = await updateScene(id, existingScene.projectId, { content })
    if (!scene) {
      return NextResponse.json(
        { error: 'INTERNAL_ERROR', message: '更新场景失败' },
        { status: 500 }
      )
    }

    // 异步聚合到 Story Bible（不阻塞响应）
    aggregatePlotOutline(existingScene.projectId, id).catch(err => {
      logger.error('Failed to aggregate plot outline:', err)
    })

    return NextResponse.json({
      success: true,
      scene,
      savedAt: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Error updating scene content:', error instanceof Error ? error : undefined)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '更新场景失败' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/scenes/[id]
 * Update a scene
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await withAuth(async () => {
      return { success: true } as any
    })(request)

    const params = await Promise.resolve(context.params)
    const { id } = params
    const body = await request.json()

    // 验证输入数据
    const validatedData = updateSceneSchema.parse(body)

    // projectId 必须在 body 中提供
    if (!body.projectId) {
      return NextResponse.json(
        { error: 'BAD_REQUEST', message: '项目 ID 不能为空' },
        { status: 400 }
      )
    }

    // 验证项目访问权限
    await requireProjectAccess(body.projectId)

    const scene = await updateScene(id, body.projectId, validatedData as any)
    if (!scene) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: '场景不存在' },
        { status: 404 }
      )
    }

    // 异步聚合到 Story Bible（不阻塞响应）
    aggregatePlotOutline(body.projectId, id).catch(err => {
      logger.error('Failed to aggregate plot outline:', err)
    })

    return NextResponse.json({ scene })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: '输入数据验证失败', details: error.errors },
        { status: 400 }
      )
    }

    logger.error('Error updating scene:', error instanceof Error ? error : undefined)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '更新场景失败' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/scenes/[id]
 * Delete a scene
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await withAuth(async () => {
      return { success: true } as any
    })(request)

    const params = await Promise.resolve(context.params)
    const { id } = params
    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { error: 'BAD_REQUEST', message: '项目 ID 不能为空' },
        { status: 400 }
      )
    }

    // 验证项目访问权限
    await requireProjectAccess(projectId)

    await deleteScene(id, projectId)

    // 异步从 Story Bible 中删除（不阻塞响应）
    removeSceneFromStoryBible(projectId, id).catch(err => {
      logger.error('Failed to remove scene from Story Bible:', err)
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error deleting scene:', error instanceof Error ? error : undefined)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '删除场景失败' },
      { status: 500 }
    )
  }
}
