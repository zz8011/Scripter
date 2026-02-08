import { NextRequest, NextResponse } from 'next/server'
import { createScene, getScenesByProjectId, getScenesByEpisode } from '@/lib/db/queries/scenes'
import { withAuth, requireProjectAccess } from '@/lib/auth/middleware'
import { createSceneSchema } from '@/lib/validation/schemas'
import { logger } from '@/lib/logger'
import { z } from 'zod'

/**
 * GET /api/scenes?projectId=xxx&episodeNumber=1
 * Get scenes for a project or episode
 */
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('projectId')
    const episodeNumber = searchParams.get('episodeNumber')

    if (!projectId) {
      return NextResponse.json(
        { error: 'BAD_REQUEST', message: '项目 ID 不能为空' },
        { status: 400 }
      )
    }

    // 验证项目访问权限
    await requireProjectAccess(projectId)

    let scenes
    if (episodeNumber) {
      scenes = await getScenesByEpisode(projectId, parseInt(episodeNumber))
    } else {
      scenes = await getScenesByProjectId(projectId)
    }

    return NextResponse.json({ scenes })
  } catch (error) {
    logger.error('Error fetching scenes:', error instanceof Error ? error : undefined)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '获取场景列表失败' },
      { status: 500 }
    )
  }
})

/**
 * POST /api/scenes
 * Create a new scene
 */
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()

    // 验证输入数据
    const validatedData = createSceneSchema.parse(body)

    // 验证项目访问权限
    await requireProjectAccess(validatedData.projectId)

    const scene = await createScene(validatedData)
    return NextResponse.json({ scene }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: '输入数据验证失败', details: error.errors },
        { status: 400 }
      )
    }

    logger.error('Error creating scene:', error instanceof Error ? error : undefined)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '创建场景失败' },
      { status: 500 }
    )
  }
})
