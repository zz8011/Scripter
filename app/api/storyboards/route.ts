import { NextRequest, NextResponse } from 'next/server'
import { createStoryboard, getStoryboardsByProjectId, getStoryboardsBySceneId, updateStoryboard, deleteStoryboard } from '@/lib/db/queries/storyboards'
import { getProjectById } from '@/lib/db/queries/projects'
import { getSessionWithDev } from '@/lib/session'

/**
 * GET /api/storyboards?projectId=xxx&sceneId=xxx
 * Get storyboards for a project or scene
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionWithDev()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('projectId')
    const sceneId = searchParams.get('sceneId')

    if (!projectId && !sceneId) {
      return NextResponse.json({ error: 'Project ID or Scene ID is required' }, { status: 400 })
    }

    let storyboards
    if (sceneId) {
      storyboards = await getStoryboardsBySceneId(sceneId)
    } else if (projectId) {
      // Verify project access
      const project = await getProjectById(projectId)
      if (!project || project.userId !== session.user.id) {
        return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
      }
      storyboards = await getStoryboardsByProjectId(projectId)
    }

    return NextResponse.json({ storyboards })
  } catch (error) {
    console.error('Error fetching storyboards:', error)
    return NextResponse.json({ error: 'Failed to fetch storyboards' }, { status: 500 })
  }
}

/**
 * POST /api/storyboards
 * Create a new storyboard
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionWithDev()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Verify project access
    const project = await getProjectById(body.projectId)
    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }

    const storyboard = await createStoryboard(body)
    return NextResponse.json({ storyboard }, { status: 201 })
  } catch (error) {
    console.error('Error creating storyboard:', error)
    return NextResponse.json({ error: 'Failed to create storyboard' }, { status: 500 })
  }
}
