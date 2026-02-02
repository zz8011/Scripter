/* ==================================================
   获取当前用户信息 API
   GET /api/auth/me
   ================================================== */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionWithDev } from '@/lib/session';
import { getUserById } from '@/lib/db/queries/users';
import { logger } from '@/lib/logger';

/**
 * GET /api/auth/me
 * 获取当前登录用户信息（包含完整资料）
 */
export async function GET(_request: NextRequest) {
  const startTime = Date.now();

  try {
    // 获取当前会话
    const session = await getSessionWithDev();

    if (!session) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: '未登录' },
        { status: 401 }
      );
    }

    // 从数据库获取完整的用户信息
    const user = await getUserById(session.user.id);

    if (!user) {
      logger.warn('User not found in database', { userId: session.user.id });
      return NextResponse.json(
        { error: 'USER_NOT_FOUND', message: '用户不存在' },
        { status: 404 }
      );
    }

    const duration = Date.now() - startTime;
    logger.apiResponse('GET', '/api/auth/me', 200, duration);

    // 返回完整的用户信息
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        plan: user.plan,
        aiQuota: user.aiQuota,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Get user info error:', error instanceof Error ? error : undefined);
    logger.apiResponse('GET', '/api/auth/me', 500, duration);

    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '获取用户信息失败' },
      { status: 500 }
    );
  }
}
