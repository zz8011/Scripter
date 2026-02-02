/* ==================================================
   获取当前用户信息 API
   GET /api/auth/me
   ================================================== */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/auth/me
 * 获取当前登录用户信息
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await requireAuth(_request);

    if (!session) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: '未登录' },
        { status: 401 }
      );
    }

    // 返回用户信息
    return NextResponse.json({
      user: {
        id: session.userId,
        email: session.email,
        name: session.name,
      },
    });
  } catch (error) {
    console.error('Get user info error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '获取用户信息失败' },
      { status: 500 }
    );
  }
}
