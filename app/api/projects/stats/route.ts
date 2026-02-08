import { NextRequest, NextResponse } from 'next/server'
import { getUserStats, getRecentProjects } from '@/lib/db/queries/stats'
import { withAuth } from '@/lib/auth/middleware'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

/**
 * GET /api/projects/stats
 * Get user dashboard statistics
 */
export const GET = withAuth(async (_request: NextRequest, session) => {
  try {
    const userId = session.user.id

    // 并行获取统计数据和最近项目
    const [stats, recentProjects] = await Promise.all([
      getUserStats(userId),
      getRecentProjects(userId, 5)
    ])

    return NextResponse.json({
      stats,
      recentProjects
    })
  } catch (error) {
    logger.error('Get dashboard stats error:', error instanceof Error ? error : undefined)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '获取统计数据失败' },
      { status: 500 }
    )
  }
})
