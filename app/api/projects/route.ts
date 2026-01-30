import { NextRequest, NextResponse } from 'next/server'
import { getProjectsByUserId, createProject } from '@/lib/db/queries'
import { getSession, getDevSession } from '@/lib/session'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  scriptType: z.enum(['movie', 'series', 'short-drama']),
  orientation: z.enum(['landscape', 'portrait']).default('landscape'),
  targetEpisodes: z.number().min(1).default(1),
  genre: z.array(z.string()).default([]),
})

/**
 * Helper to get session with dev mode fallback
 */
async function getSessionWithDev() {
  const session = await getSession()
  if (session) return session

  // Development mode: use test session
  if (process.env.NODE_ENV === 'development') {
    return await getDevSession()
  }

  return null
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionWithDev()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projects = await getProjectsByUserId(session.user.id)

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Get projects error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionWithDev()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createProjectSchema.parse(body)

    const project = await createProject({
      ...validatedData,
      userId: session.user.id,
      currentStage: 'worldview',
    })

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create project error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
