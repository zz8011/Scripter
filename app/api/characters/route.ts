import { NextRequest, NextResponse } from 'next/server'
import { createCharacter, getCharactersByProjectId } from '@/lib/db/queries/characters'
import { withAuth, requireProjectAccess } from '@/lib/auth/middleware'
import { createCharacterSchema } from '@/lib/validation/schemas'
import { logger } from '@/lib/logger'
import { z } from 'zod'

/**
 * GET /api/characters?projectId=xxx
 * Get all characters for a project
 */
export const GET = withAuth(async (request: NextRequest) => {
  try {
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

    const characters = await getCharactersByProjectId(projectId)
    return NextResponse.json({ characters })
  } catch (error) {
    logger.error('Error fetching characters:', error instanceof Error ? error : undefined)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '获取角色列表失败' },
      { status: 500 }
    )
  }
})

/**
 * POST /api/characters
 * Create a new character
 */
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()

    // 验证输入数据
    const validatedData = createCharacterSchema.parse(body)

    // 验证项目访问权限
    await requireProjectAccess(validatedData.projectId)

    const character = await createCharacter(validatedData)
    return NextResponse.json({ character }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: '输入数据验证失败', details: error.errors },
        { status: 400 }
      )
    }

    logger.error('Error creating character:', error instanceof Error ? error : undefined)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '创建角色失败' },
      { status: 500 }
    )
  }
})

