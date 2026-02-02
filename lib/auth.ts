import { NextRequest, NextResponse } from 'next/server'
import { getSession } from './session'
import { getUserById } from './db/queries/users'
import { getProjectById } from './db/queries/projects'
import { logger } from './logger'

/**
 * 会话类型 - 用于 API 路由认证
 */
export interface Session {
  id: string
  userId: string
  email: string
  name: string
  accessToken: string
  expiresAt: Date
}

/**
 * 认证错误类型
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
 * 包装 API 路由处理函数，添加认证检查
 * 用法: export const GET = withAuth(async (req, session) => { ... })
 */
export function withAuth(
  handler: (req: NextRequest, session: Session) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const session = await requireAuth(req)
      return await handler(req, session)
    } catch (error) {
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
  }
}

/**
 * 将 CookieSession 转换为 AuthSession
 * 注意: 这是为了兼容原有的不一致设计
 */
function convertToAuthSession(cookieSession: Awaited<ReturnType<typeof getSession>>): Session | null {
  if (!cookieSession) return null
  
  return {
    id: cookieSession.sessionId,
    userId: cookieSession.user.id,
    email: cookieSession.user.email,
    name: cookieSession.user.name,
    accessToken: cookieSession.accessToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  }
}

/**
 * 检查并返回当前会话
 * 如果没有会话则抛出 AuthError
 */
export async function requireAuth(req: NextRequest): Promise<Session> {
  const session = convertToAuthSession(await getSession(req))
  
  if (!session) {
    throw new AuthError('请先登录', 'UNAUTHORIZED', 401)
  }
  
  // 检查会话是否过期
  if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
    throw new AuthError('会话已过期，请重新登录', 'SESSION_EXPIRED', 401)
  }
  
  return session
}

/**
 * 可选认证 - 返回会话或 null
 * 用于公开但需要识别用户的端点
 */
export async function optionalAuth(req: NextRequest): Promise<Session | null> {
  try {
    return await requireAuth(req)
  } catch {
    return null
  }
}

/**
 * 检查项目访问权限
 * 验证用户是否是项目所有者或有权限访问
 */
export async function requireProjectAccess(
  req: NextRequest,
  projectId: string
): Promise<Session> {
  const session = await requireAuth(req)
  
  // 获取项目信息
  const project = await getProjectById(projectId)
  
  if (!project) {
    throw new AuthError('项目不存在', 'PROJECT_NOT_FOUND', 404)
  }
  
  // 检查是否是项目所有者
  if (project.userId !== session.userId) {
    throw new AuthError('无权访问此项目', 'FORBIDDEN', 403)
  }
  
  return session
}

/**
 * 检查用户是否存在且有效
 */
export async function requireValidUser(
  req: NextRequest
): Promise<Session> {
  const session = await requireAuth(req)
  
  // 验证用户是否仍然存在于数据库
  const user = await getUserById(session.userId)
  
  if (!user) {
    throw new AuthError('用户不存在或已被删除', 'USER_NOT_FOUND', 401)
  }
  
  return session
}

/**
 * 管理员权限检查
 * 检查用户是否具有管理员权限
 */
export async function requireAdmin(
  req: NextRequest
): Promise<Session> {
  const session = await requireAuth(req)
  
  // TODO: 实现管理员权限检查
  // 目前简单检查，后续可添加 roles 字段
  const user = await getUserById(session.userId)
  
  // 临时：检查是否是特定管理员邮箱
  const ADMIN_EMAILS = ['admin@scripter.art', 'dev@scripter.art']
  if (!user || !ADMIN_EMAILS.includes(user.email)) {
    throw new AuthError('需要管理员权限', 'ADMIN_REQUIRED', 403)
  }
  
  return session
}

/**
 * API 路由包装器 - 带项目权限检查
 * 用法: export const GET = withProjectAuth(async (req, session, projectId) => { ... })
 */
export function withProjectAuth(
  handler: (req: NextRequest, session: Session, projectId: string) => Promise<NextResponse>
) {
  return async (req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> => {
    try {
      const projectId = params.id
      if (!projectId) {
        return NextResponse.json(
          { error: 'BAD_REQUEST', message: '项目 ID 不能为空' },
          { status: 400 }
        )
      }
      
      const session = await requireProjectAccess(req, projectId)
      return await handler(req, session, projectId)
    } catch (error) {
      if (error instanceof AuthError) {
        return NextResponse.json(
          { error: error.code, message: error.message },
          { status: error.statusCode }
        )
      }
      logger.error('Project auth middleware error:', error instanceof Error ? error : undefined)
      return NextResponse.json(
        { error: 'INTERNAL_ERROR', message: '服务器内部错误' },
        { status: 500 }
      )
    }
  }
}

/**
 * 生成 401 未授权响应
 */
export function unauthorizedResponse(message: string = '请先登录'): NextResponse {
  return NextResponse.json(
    { error: 'UNAUTHORIZED', message },
    { status: 401 }
  )
}

/**
 * 生成 403 禁止访问响应
 */
export function forbiddenResponse(message: string = '无权访问'): NextResponse {
  return NextResponse.json(
    { error: 'FORBIDDEN', message },
    { status: 403 }
  )
}
