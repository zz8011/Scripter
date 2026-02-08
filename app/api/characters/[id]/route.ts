import { NextRequest, NextResponse } from 'next/server'
import { updateCharacter, deleteCharacter } from '@/lib/db/queries/characters'
import { withAuth, requireProjectAccess } from '@/lib/auth/middleware'
import { updateCharacterSchema } from '@/lib/validation/schemas'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { aggregateCharacterProfile, removeCharacterFromStoryBible } from '@/lib/story-bible'

/**
 * PUT /api/characters/[id]
 * Update a character
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await withAuth(async () => {
      return { success: true } as any
    })(request)

    const params = await Promise.resolve(context.params)
    const { id } = params
    const body = await request.json()

    // 验证输入数据
    const validatedData = updateCharacterSchema.parse(body)

    // projectId 必须在 body 中提供
    if (!body.projectId) {
      return NextResponse.json(
        { error: 'BAD_REQUEST', message: '项目 ID 不能为空' },
        { status: 400 }
      )
    }

    // 验证项目访问权限
    await requireProjectAccess(body.projectId)

    const character = await updateCharacter(id, body.projectId, validatedData as any)
    if (!character) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: '角色不存在' },
        { status: 404 }
      )
    }

    // 异步聚合到 Story Bible（不阻塞响应）
    aggregateCharacterProfile(body.projectId, id).catch(err => {
      logger.error('Failed to aggregate character profile:', err)
    })

    return NextResponse.json({ character })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: '输入数据验证失败', details: error.errors },
        { status: 400 }
      )
    }

    logger.error('Error updating character:', error instanceof Error ? error : undefined)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '更新角色失败' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/characters/[id]
 * Delete a character
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

    await deleteCharacter(id, projectId)

    // 异步从 Story Bible 中删除（不阻塞响应）
    removeCharacterFromStoryBible(projectId, id).catch(err => {
      logger.error('Failed to remove character from Story Bible:', err)
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error deleting character:', error instanceof Error ? error : undefined)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '删除角色失败' },
      { status: 500 }
    )
  }
}
