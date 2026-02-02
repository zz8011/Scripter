import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// 输入验证schema
const executeSkillSchema = z.object({
  skillId: z.string(),
  params: z.record(z.unknown()).optional(),
  agentId: z.string().optional()
})

// GET /api/ai/skills
export const GET = withAuth(async (req: NextRequest) => {
  try {
    const skills = [
      {
        id: 'code',
        name: '代码生成',
        description: '根据描述生成代码',
        parameters: {
          language: { type: 'string', required: true },
          prompt: { type: 'string', required: true }
        }
      },
      {
        id: 'review',
        name: '代码审查',
        description: '审查代码并提供建议',
        parameters: {
          code: { type: 'string', required: true }
        }
      }
    ]

    return NextResponse.json({ skills })
  } catch (error) {
    logger.error('Failed to get skills:', error instanceof Error ? error : undefined)
    return NextResponse.json(
      { error: 'Failed to get skills' },
      { status: 500 }
    )
  }
})

// POST /api/ai/skills
export const POST = withAuth(async (req: NextRequest) => {
  try {
    const body = await req.json()
    
    // 输入验证
    const result = executeSkillSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.format() },
        { status: 400 }
      )
    }

    const { skillId, params } = result.data

    // TODO: 实现技能执行逻辑
    return NextResponse.json({ 
      success: true, 
      result: { skillId, executed: true }
    })
  } catch (error) {
    logger.error('Failed to execute skill:', error instanceof Error ? error : undefined)
    return NextResponse.json(
      { error: 'Failed to execute skill' },
      { status: 500 }
    )
  }
})

// DELETE /api/ai/skills
export const DELETE = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const taskId = searchParams.get('taskId')

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }

    // TODO: 实现任务取消逻辑
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Failed to cancel task:', error instanceof Error ? error : undefined)
    return NextResponse.json(
      { error: 'Failed to cancel task' },
      { status: 500 }
    )
  }
})
