import { NextRequest, NextResponse } from 'next/server'
import { createWorldviewItem, getWorldviewItemsByProjectId, getWorldviewItemsByCategory, updateWorldviewItem, deleteWorldviewItem } from '@/db/queries/worldview'
import { getProjectById } from '@/db/queries/projects'
import { auth } from '@/lib/session'

/**
 * GET /api/worldview?projectId=xxx&category=era
 * Get worldview items for a project
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('projectId')
    const category = searchParams.get('category')

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Verify project access
    const project = await getProjectById(projectId)
    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }

    let items
    if (category) {
      items = await getWorldviewItemsByCategory(projectId, category as any)
    } else {
      items = await getWorldviewItemsByProjectId(projectId)
    }

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Error fetching worldview items:', error)
    return NextResponse.json({ error: 'Failed to fetch worldview items' }, { status: 500 })
  }
}

/**
 * POST /api/worldview
 * Create a new worldview item
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Verify project access
    const project = await getProjectById(body.projectId)
    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }

    const item = await createWorldviewItem(body)
    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    console.error('Error creating worldview item:', error)
    return NextResponse.json({ error: 'Failed to create worldview item' }, { status: 500 })
  }
}
