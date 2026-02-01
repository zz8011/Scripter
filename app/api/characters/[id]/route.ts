import { NextRequest, NextResponse } from 'next/server'
import { updateCharacter, deleteCharacter } from '@/lib/db/queries/characters'
import { getProjectById } from '@/lib/db/queries/projects'
import { getSessionWithDev } from '@/lib/session'

/**
 * PUT /api/characters/[id]
 * Update a character
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionWithDev()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { projectId } = body

    // Verify project access
    const project = await getProjectById(projectId)
    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }

    const character = await updateCharacter(id, projectId, body)
    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }

    return NextResponse.json({ character })
  } catch (error) {
    console.error('Error updating character:', error)
    return NextResponse.json({ error: 'Failed to update character' }, { status: 500 })
  }
}

/**
 * DELETE /api/characters/[id]
 * Delete a character
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionWithDev()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
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

    await deleteCharacter(id, projectId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting character:', error)
    return NextResponse.json({ error: 'Failed to delete character' }, { status: 500 })
  }
}
