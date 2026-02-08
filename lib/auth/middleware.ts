/**
 * 统一的 API 认证中间件
 *
 * 功能:
 * - 统一的认证检查
 * - 项目权限验证
 * - 错误处理
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentSession, SessionData } from './session'
import { getProjectById } from '@/lib/db/queries/projects'
import { getUserById } from '@/lib/db/queries/users'
import { logger } from '@/lib/logger'

/**
 * 认证错误类
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public code: string = 'UNAUTHORIZED',
    public statusCode: number = 401
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

/**
 * API 路由处理函数类型
 */
type AuthenticatedHandler = (
  req: NextRequest,
  session: SessionData
) => Promise<NextResponse> | NextResponse

/**
 * 统一认证中间件
 * 用法: export const GET = withAuth(async (req, session) => { ... })
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const session = await requireAuth()
      return await handler(req, session)
    } catch (error) {
      return handleAuthError(error)
    }
  }
}

/**
 * 带项目权限检查的认证中间件
 * 用法: export const GET = withProjectAuth(async (req, session, projectId) => { ... })
 */
export function withProjectAuth(
  handler: (req: NextRequest, session: SessionData, projectId: string) => Promise<NextResponse>
) {
  return async (
    req: NextRequest,
    context: { params: Promise<{ id: string }> | { id: string } }
  ): Promise<NextResponse> => {
    try {
      // 处理 params 可能是 Promise 的情况（Next.js 15+）
      const params = await Promise.resolve(context.params)
      const projectId = params.id

      if (!projectId) {
        return NextResponse.json(
          { error: 'BAD_REQUEST', message: '项目 ID 不能为空' },
          { status: 400 }
        )
      }

      const session = await requireProjectAccess(projectId)
      return await handler(req, session, projectId)
    } catch (error) {
      return handleAuthError(error)
    }
  }
}

/**
 * 要求认证
 * 如果没有会话则抛出 AuthError
 */
export async function requireAuth(): Promise<SessionData> {
  const session = await getCurrentSession()

  if (!session) {
    throw new AuthError('请先登录', 'UNAUTHORIZED', 401)
  }

  // 检查会话是否过期
  if (session.expiresAt && Date.now() > session.expiresAt) {
    throw new AuthError('会话已过期，请重新登录', 'SESSION_EXPIRED', 401)
  }

  return session
}

/**
 * 可选认证
 * 返回会话或 null，不抛出错误
 */
export async function optionalAuth(): Promise<SessionData | null> {
  try {
    return await requireAuth()
  } catch {
    return null
  }
}

/**
 * 要求项目访问权限
 * 验证用户是否是项目所有者
 */
export async function requireProjectAccess(projectId: string): Promise<SessionData> {
  const session = await requireAuth()

  // 获取项目信息
  const project = await getProjectById(projectId)

  if (!project) {
    throw new AuthError('项目不存在', 'PROJECT_NOT_FOUND', 404)
  }

  // 检查是否是项目所有者
  if (project.userId !== session.user.id) {
    throw new AuthError('无权访问此项目', 'FORBIDDEN', 403)
  }

  return session
}

/**
 * 要求有效用户
 * 验证用户是否仍然存在于数据库
 */
export async function requireValidUser(): Promise<SessionData> {
  const session = await requireAuth()

  // 验证用户是否仍然存在
  const user = await getUserById(session.user.id)

  if (!user) {
    throw new AuthError('用户不存在或已被删除', 'USER_NOT_FOUND', 401)
  }

  return session
}

/**
 * 要求管理员权限
 */
export async function requireAdmin(): Promise<SessionData> {
  const session = await requireAuth()

  // 获取用户信息
  const user = await getUserById(session.user.id)

  // 检查是否是管理员
  const ADMIN_EMAILS = ['admin@scripter.art', 'dev@scripter.art']
  if (!user || !ADMIN_EMAILS.includes(user.email)) {
    throw new AuthError('需要管理员权限', 'ADMIN_REQUIRED', 403)
  }

  return session
}

/**
 * 处理认证错误
 */
function handleAuthError(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json(
      { error: error.code, message: error.message },
      { status: error.statusCode }
    )
  }

  logger.error('Auth middleware error:', error instanceof Error ? error : undefined)
  return NextResponse.json(
    { error: 'INTERNAL_ERROR', message: '服务器内部错误' },
    { status: 500 }
  )
}

/**
 * 生成 401 未授权响应
 */
export function unauthorizedResponse(message: string = '请先登录'): NextResponse {
  return NextResponse.json({ error: 'UNAUTHORIZED', message }, { status: 401 })
}

/**
 * 生成 403 禁止访问响应
 */
export function forbiddenResponse(message: string = '无权访问'): NextResponse {
  return NextResponse.json({ error: 'FORBIDDEN', message }, { status: 403 })
}
