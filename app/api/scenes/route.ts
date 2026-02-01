import { NextRequest, NextResponse } from 'next/server'
import { createScene, getScenesByProjectId, getScenesByEpisode } from '@/lib/db/queries/scenes'
import { getProjectById } from '@/lib/db/queries/projects'
import { getSessionWithDev } from '@/lib/session'

/**
 * GET /api/scenes?projectId=xxx&episodeNumber=1
 * Get scenes for a project or episode
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionWithDev()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('projectId')
    const episodeNumber = searchParams.get('episodeNumber')

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Verify project access
    const project = await getProjectById(projectId)
    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }

    let scenes
    if (episodeNumber) {
      scenes = await getScenesByEpisode(projectId, parseInt(episodeNumber))
    } else {
      scenes = await getScenesByProjectId(projectId)
    }

    return NextResponse.json({ scenes })
  } catch (error) {
    console.error('Error fetching scenes:', error)
    return NextResponse.json({ error: 'Failed to fetch scenes' }, { status: 500 })
  }
}

/**
 * POST /api/scenes
 * Create a new scene
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

    const scene = await createScene(body)
    return NextResponse.json({ scene }, { status: 201 })
  } catch (error) {
    console.error('Error creating scene:', error)
    return NextResponse.json({ error: 'Failed to create scene' }, { status: 500 })
  }
}

