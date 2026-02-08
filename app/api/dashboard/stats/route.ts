/* ==================================================
   Dashboard 统计 API 路由
   Dashboard Stats API Route
   ================================================== */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionWithDev } from '@/lib/session';
import { getUserStats, getRecentProjects } from '@/lib/db/queries/stats';
import { ApiErrors, handleApiError } from '@/lib/errors/api-error';

/* ==================================================
   GET /api/dashboard/stats
   获取用户的 Dashboard 统计数据
   ================================================== */

export async function GET(request: NextRequest) {
  try {
    // 认证检查
    const session = await getSessionWithDev();
    if (!session?.user) {
      throw ApiErrors.unauthorized('请先登录');
    }

    const userId = session.user.id;

    // 获取统计数据
    const stats = await getUserStats(userId);

    // 获取最近编辑的项目
    const recentProjects = await getRecentProjects(userId, 5);

    // 返回结果
    return NextResponse.json({
      success: true,
      data: {
        stats: {
          projectCount: stats.projectCount,
          totalWords: stats.totalWords,
          todayWords: stats.todayWords,
          sceneCount: stats.sceneCount,
          characterCount: stats.characterCount,
        },
        recentProjects: recentProjects.map((project) => ({
          id: project.id,
          name: project.name,
          genre: project.genre,
          scriptType: project.scriptType,
          orientation: project.orientation,
          targetEpisodes: project.targetEpisodes,
          currentStage: project.currentStage,
          wordCount: project.wordCount,
          sceneCount: project.sceneCount,
          characterCount: project.characterCount,
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/* ==================================================
   配置
   ================================================== */

export const runtime = 'nodejs';
