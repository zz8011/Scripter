/**
 * 认证模块 - 向后兼容层
 *
 * 此文件保留用于向后兼容，所有函数都重定向到新的安全实现
 * 新代码应直接使用 lib/auth/middleware.ts
 *
 * @deprecated 使用 lib/auth/middleware.ts 替代
 */

import {
  withAuth as secureWithAuth,
  withProjectAuth as secureWithProjectAuth,
  requireAuth as secureRequireAuth,
  optionalAuth as secureOptionalAuth,
  requireProjectAccess as secureRequireProjectAccess,
  requireValidUser as secureRequireValidUser,
  requireAdmin as secureRequireAdmin,
  AuthError as SecureAuthError,
  unauthorizedResponse as secureUnauthorizedResponse,
  forbiddenResponse as secureForbiddenResponse,
} from '@/lib/auth/middleware'
import { SessionData } from '@/lib/auth/session'
import { NextRequest, NextResponse } from 'next/server'

/**
 * 会话类型 - 用于 API 路由认证
 * @deprecated 使用 SessionData from lib/auth/session.ts
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
 * 将 SessionData 转换为旧的 Session 格式
 */
function convertToLegacySession(sessionData: SessionData): Session {
  return {
    id: sessionData.sessionId,
    userId: sessionData.user.id,
    email: sessionData.user.email,
    name: sessionData.user.name,
    accessToken: sessionData.accessToken,
    expiresAt: new Date(sessionData.expiresAt),
  }
}

/**
 * 认证错误类型
 * @deprecated 使用 AuthError from lib/auth/middleware.ts
 */
export class AuthError extends SecureAuthError {}

/**
 * 包装 API 路由处理函数，添加认证检查
 * @deprecated 使用 lib/auth/middleware.ts 中的 withAuth
 */
export function withAuth(
  handler: (req: NextRequest, session: Session) => Promise<NextResponse>
) {
  return secureWithAuth(async (req: NextRequest, sessionData: SessionData) => {
    const legacySession = convertToLegacySession(sessionData)
    return await handler(req, legacySession)
  })
}

/**
 * 检查并返回当前会话
 * @deprecated 使用 lib/auth/middleware.ts 中的 requireAuth
 */
export async function requireAuth(req?: NextRequest): Promise<Session> {
  const sessionData = await secureRequireAuth()
  return convertToLegacySession(sessionData)
}

/**
 * 可选认证 - 返回会话或 null
 * @deprecated 使用 lib/auth/middleware.ts 中的 optionalAuth
 */
export async function optionalAuth(req?: NextRequest): Promise<Session | null> {
  const sessionData = await secureOptionalAuth()
  return sessionData ? convertToLegacySession(sessionData) : null
}

/**
 * 检查项目访问权限
 * @deprecated 使用 lib/auth/middleware.ts 中的 requireProjectAccess
 */
export async function requireProjectAccess(
  req: NextRequest,
  projectId: string
): Promise<Session> {
  const sessionData = await secureRequireProjectAccess(projectId)
  return convertToLegacySession(sessionData)
}

/**
 * 检查用户是否存在且有效
 * @deprecated 使用 lib/auth/middleware.ts 中的 requireValidUser
 */
export async function requireValidUser(req?: NextRequest): Promise<Session> {
  const sessionData = await secureRequireValidUser()
  return convertToLegacySession(sessionData)
}

/**
 * 管理员权限检查
 * @deprecated 使用 lib/auth/middleware.ts 中的 requireAdmin
 */
export async function requireAdmin(req?: NextRequest): Promise<Session> {
  const sessionData = await secureRequireAdmin()
  return convertToLegacySession(sessionData)
}

/**
 * API 路由包装器 - 带项目权限检查
 * @deprecated 使用 lib/auth/middleware.ts 中的 withProjectAuth
 */
export function withProjectAuth(
  handler: (req: NextRequest, session: Session, projectId: string) => Promise<NextResponse>
) {
  return secureWithProjectAuth(async (req: NextRequest, sessionData: SessionData, projectId: string) => {
    const legacySession = convertToLegacySession(sessionData)
    return await handler(req, legacySession, projectId)
  })
}

/**
 * 生成 401 未授权响应
 * @deprecated 使用 lib/auth/middleware.ts 中的 unauthorizedResponse
 */
export const unauthorizedResponse = secureUnauthorizedResponse

/**
 * 生成 403 禁止访问响应
 * @deprecated 使用 lib/auth/middleware.ts 中的 forbiddenResponse
 */
export const forbiddenResponse = secureForbiddenResponse

