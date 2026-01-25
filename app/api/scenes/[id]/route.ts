import { NextRequest, NextResponse } from 'next/server'
import { updateScene, deleteScene } from '@/db/queries/scenes'
import { getProjectById } from '@/db/queries/projects'
import { auth } from '@/lib/session'

/**
 * PUT /api/scenes/[id]
 * Update a scene
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId } = body

    // Verify project access
    const project = await getProjectById(projectId)
    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }

    const scene = await updateScene(params.id, projectId, body)
    if (!scene) {
      return NextResponse.json({ error: 'Scene not found' }, { status: 404 })
    }

    return NextResponse.json({ scene })
  } catch (error) {
    console.error('Error updating scene:', error)
    return NextResponse.json({ error: 'Failed to update scene' }, { status: 500 })
  }
}

/**
 * DELETE /api/scenes/[id]
 * Delete a scene
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
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

    await deleteScene(params.id, projectId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting scene:', error)
    return NextResponse.json({ error: 'Failed to delete scene' }, { status: 500 })
  }
}
