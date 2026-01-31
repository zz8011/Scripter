import { NextRequest, NextResponse } from 'next/server'
import { createCharacter, getCharactersByProjectId, updateCharacter, deleteCharacter } from '@/lib/db/queries/characters'
import { getProjectById } from '@/lib/db/queries/projects'
import { getSessionWithDev } from '@/lib/session'

/**
 * GET /api/characters?projectId=xxx
 * Get all characters for a project
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionWithDev()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Verify project access
    const project = await getProjectById(projectId)
    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }

    const characters = await getCharactersByProjectId(projectId)
    return NextResponse.json({ characters })
  } catch (error) {
    console.error('Error fetching characters:', error)
    return NextResponse.json({ error: 'Failed to fetch characters' }, { status: 500 })
  }
}

/**
 * POST /api/characters
 * Create a new character
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

    const character = await createCharacter(body)
    return NextResponse.json({ character }, { status: 201 })
  } catch (error) {
    console.error('Error creating character:', error)
    return NextResponse.json({ error: 'Failed to create character' }, { status: 500 })
  }
}
