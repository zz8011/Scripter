import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { logger } from '@/lib/logger'

/**
 * GET /api/health
 * 健康检查端点
 */
export const runtime = 'nodejs' // 强制使用 Node.js 运行时
export const dynamic = 'force-dynamic' // 强制动态渲染

export async function GET() {
  const startTime = Date.now()

  try {
    // 检查数据库连接
    const result = await db.execute(sql`SELECT 1 as test`)
    logger.debug('[Health] Database query result', { result })

    const duration = Date.now() - startTime

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        result: JSON.stringify(result),
        duration: `${duration}ms`,
      },
      version: '0.1.0',
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('[Health] Database error', error instanceof Error ? error : undefined)

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'disconnected',
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      duration: `${duration}ms`,
    }, { status: 503 })
  }
}
