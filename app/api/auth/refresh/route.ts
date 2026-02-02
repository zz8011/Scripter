/* ==================================================
   Token 刷新 API
   POST /api/auth/refresh
   ================================================== */

import { NextRequest, NextResponse } from 'next/server';
import { getSession, createSession } from '@/lib/session';

/**
 * POST /api/auth/refresh
 * 刷新访问令牌
 */
export async function POST(_request: NextRequest) {
  try {
    // 获取当前会话
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: '未登录或会话已过期' },
        { status: 401 }
      );
    }

    // TODO: 调用 Casdoor 或其他身份提供商的刷新令牌 API
    // const newToken = await refreshAccessToken(session.refreshToken);

    // 这里我们简单地更新会话的过期时间
    // 实际实现应该使用 refresh token 获取新的 access token
    const updatedSession = {
      ...session,
      // 如果 Casdoor 返回了新 token，应该更新
      // accessToken: newToken.accessToken,
    };

    // 重新创建会话（延长过期时间）
    await createSession(updatedSession);

    return NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '刷新令牌失败' },
      { status: 500 }
    );
  }
}
