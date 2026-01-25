import { NextRequest, NextResponse } from 'next/server'
import { createAIConversation, getAIConversationsByUserId, getAIConversationsByProjectId, addMessageToConversation } from '@/db/queries/ai-conversations'
import { getProjectById } from '@/db/queries/projects'
import { auth } from '@/lib/session'

/**
 * GET /api/ai-conversations?projectId=xxx
 * Get AI conversations for user or project
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('projectId')

    let conversations
    if (projectId) {
      // Verify project access
      const project = await getProjectById(projectId)
      if (!project || project.userId !== session.user.id) {
        return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
      }
      conversations = await getAIConversationsByProjectId(projectId)
    } else {
      conversations = await getAIConversationsByUserId(session.user.id)
    }

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error('Error fetching AI conversations:', error)
    return NextResponse.json({ error: 'Failed to fetch AI conversations' }, { status: 500 })
  }
}

/**
 * POST /api/ai-conversations
 * Create a new AI conversation
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Verify project access if provided
    if (body.projectId) {
      const project = await getProjectById(body.projectId)
      if (!project || project.userId !== session.user.id) {
        return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
      }
    }

    const conversation = await createAIConversation({
      ...body,
      userId: session.user.id,
    })
    return NextResponse.json({ conversation }, { status: 201 })
  } catch (error) {
    console.error('Error creating AI conversation:', error)
    return NextResponse.json({ error: 'Failed to create AI conversation' }, { status: 500 })
  }
}
