import { NextRequest, NextResponse } from 'next/server'
import { getMilestonesByUserId, getMilestonesByProjectId, recordMilestone, getUserAIContributionStats } from '@/db/queries/creative-milestones'
import { getProjectById } from '@/db/queries/projects'
import { auth } from '@/lib/session'

/**
 * GET /api/milestones?projectId=xxx&stats=true
 * Get milestones or user stats
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('projectId')
    const stats = searchParams.get('stats') === 'true'

    if (stats) {
      const stats = await getUserAIContributionStats(session.user.id)
      return NextResponse.json({ stats })
    }

    let milestones
    if (projectId) {
      // Verify project access
      const project = await getProjectById(projectId)
      if (!project || project.userId !== session.user.id) {
        return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
      }
      milestones = await getMilestonesByProjectId(projectId)
    } else {
      milestones = await getMilestonesByUserId(session.user.id)
    }

    return NextResponse.json({ milestones })
  } catch (error) {
    console.error('Error fetching milestones:', error)
    return NextResponse.json({ error: 'Failed to fetch milestones' }, { status: 500 })
  }
}

/**
 * POST /api/milestones
 * Record a milestone
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, type, aiContribution } = body

    // Verify project access
    const project = await getProjectById(projectId)
    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }

    const milestone = await recordMilestone(session.user.id, projectId, type, aiContribution)
    return NextResponse.json({ milestone }, { status: 201 })
  } catch (error) {
    console.error('Error recording milestone:', error)
    return NextResponse.json({ error: 'Failed to record milestone' }, { status: 500 })
  }
}
