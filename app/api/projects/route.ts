import { NextRequest, NextResponse } from 'next/server'
import { getProjectsByUserId, createProject } from '@/lib/db/queries'
import { withAuth } from '@/lib/auth'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const createProjectSchema = z.object({
  name: z.string().min(1).max(200, '项目名称不能超过 200 字符'),
  scriptType: z.enum(['movie', 'series', 'short-drama']),
  orientation: z.enum(['landscape', 'portrait']).default('landscape'),
  targetEpisodes: z.number().min(1).default(1),
  genre: z.array(z.string()).default([]),
})

/**
 * 获取用户项目列表
 * GET /api/projects
 */
export const GET = withAuth(async (_request: NextRequest, session) => {
  try {
    const projects = await getProjectsByUserId(session.userId)
    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Get projects error:', error)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '获取项目列表失败' },
      { status: 500 }
    )
  }
})

/**
 * 创建新项目
 * POST /api/projects
 */
export const POST = withAuth(async (request: NextRequest, session) => {
  try {
    const body = await request.json()
    const validatedData = createProjectSchema.parse(body)

    const project = await createProject({
      ...validatedData,
      userId: session.userId,
      currentStage: 'worldview',
    })

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: '输入数据验证失败', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create project error:', error)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '创建项目失败' },
      { status: 500 }
    )
  }
})


