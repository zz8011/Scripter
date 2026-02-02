import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import {
  withAuth,
  requireAuth,
  optionalAuth,
  requireProjectAccess,
  AuthError,
  unauthorizedResponse,
  forbiddenResponse,
} from '@/lib/auth'
import * as sessionModule from '@/lib/session'
import * as userQueries from '@/lib/db/queries/users'
import * as projectQueries from '@/lib/db/queries/projects'

// Mock 依赖
vi.mock('@/lib/session')
vi.mock('@/lib/db/queries/users')
vi.mock('@/lib/db/queries/projects')

describe('auth', () => {
  const mockSession = {
    id: 'session-1',
    userId: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    accessToken: 'token-123',
    expiresAt: new Date(Date.now() + 3600000), // 1 hour later
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('requireAuth', () => {
    it('应该在有有效会话时返回会话', async () => {
      vi.mocked(sessionModule.getSession).mockResolvedValueOnce(mockSession)

      const req = new NextRequest('http://localhost/api/test')
      const session = await requireAuth(req)

      expect(session).toEqual(mockSession)
    })

    it('应该在无会话时抛出 AuthError', async () => {
      vi.mocked(sessionModule.getSession).mockResolvedValueOnce(null)

      const req = new NextRequest('http://localhost/api/test')
      
      await expect(requireAuth(req)).rejects.toThrow(AuthError)
      await expect(requireAuth(req)).rejects.toThrow('请先登录')
    })

    it('应该在会话过期时抛出 AuthError', async () => {
      const expiredSession = {
        ...mockSession,
        expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
      }
      vi.mocked(sessionModule.getSession).mockResolvedValueOnce(expiredSession)

      const req = new NextRequest('http://localhost/api/test')
      
      await expect(requireAuth(req)).rejects.toThrow('会话已过期')
    })
  })

  describe('optionalAuth', () => {
    it('应该在有有效会话时返回会话', async () => {
      vi.mocked(sessionModule.getSession).mockResolvedValueOnce(mockSession)

      const req = new NextRequest('http://localhost/api/test')
      const session = await optionalAuth(req)

      expect(session).toEqual(mockSession)
    })

    it('应该在无会话时返回 null', async () => {
      vi.mocked(sessionModule.getSession).mockResolvedValueOnce(null)

      const req = new NextRequest('http://localhost/api/test')
      const session = await optionalAuth(req)

      expect(session).toBeNull()
    })
  })

  describe('withAuth', () => {
    it('应该允许已认证用户访问', async () => {
      vi.mocked(sessionModule.getSession).mockResolvedValueOnce(mockSession)

      const handler = vi.fn().mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }))
      )

      const wrappedHandler = withAuth(handler)
      const req = new NextRequest('http://localhost/api/test')
      const response = await wrappedHandler(req)

      expect(handler).toHaveBeenCalledWith(req, mockSession)
      expect(response.status).toBe(200)
    })

    it('应该拒绝未认证用户', async () => {
      vi.mocked(sessionModule.getSession).mockResolvedValueOnce(null)

      const handler = vi.fn()
      const wrappedHandler = withAuth(handler)
      
      const req = new NextRequest('http://localhost/api/test')
      const response = await wrappedHandler(req)

      expect(handler).not.toHaveBeenCalled()
      expect(response.status).toBe(401)
      
      const body = await response.json()
      expect(body.error).toBe('UNAUTHORIZED')
    })

    it('应该处理 handler 中的错误', async () => {
      vi.mocked(sessionModule.getSession).mockResolvedValueOnce(mockSession)

      const handler = vi.fn().mockRejectedValueOnce(new Error('Handler error'))
      const wrappedHandler = withAuth(handler)
      
      const req = new NextRequest('http://localhost/api/test')
      const response = await wrappedHandler(req)

      expect(response.status).toBe(500)
      
      const body = await response.json()
      expect(body.error).toBe('INTERNAL_ERROR')
    })
  })

  describe('requireProjectAccess', () => {
    it('应该允许项目所有者访问', async () => {
      vi.mocked(sessionModule.getSession).mockResolvedValueOnce(mockSession)
      vi.mocked(projectQueries.getProjectById).mockResolvedValueOnce({
        id: 'project-1',
        userId: 'user-1',
        name: 'Test Project',
      } as any)

      const req = new NextRequest('http://localhost/api/projects/project-1')
      const session = await requireProjectAccess(req, 'project-1')

      expect(session.userId).toBe('user-1')
    })

    it('应该拒绝非项目所有者', async () => {
      vi.mocked(sessionModule.getSession).mockResolvedValueOnce({
        ...mockSession,
        userId: 'user-2', // Different user
      })
      vi.mocked(projectQueries.getProjectById).mockResolvedValueOnce({
        id: 'project-1',
        userId: 'user-1',
        name: 'Test Project',
      } as any)

      const req = new NextRequest('http://localhost/api/projects/project-1')
      
      await expect(requireProjectAccess(req, 'project-1')).rejects.toThrow('无权访问此项目')
    })

    it('应该在项目不存在时抛出错误', async () => {
      vi.mocked(sessionModule.getSession).mockResolvedValueOnce(mockSession)
      vi.mocked(projectQueries.getProjectById).mockResolvedValueOnce(null)

      const req = new NextRequest('http://localhost/api/projects/project-1')
      
      await expect(requireProjectAccess(req, 'project-1')).rejects.toThrow('项目不存在')
    })
  })

  describe('AuthError', () => {
    it('应该正确创建 AuthError', () => {
      const error = new AuthError('测试错误', 'TEST_CODE', 403)
      
      expect(error.message).toBe('测试错误')
      expect(error.code).toBe('TEST_CODE')
      expect(error.statusCode).toBe(403)
      expect(error.name).toBe('AuthError')
    })

    it('应该使用默认状态码 401', () => {
      const error = new AuthError('测试错误')
      
      expect(error.statusCode).toBe(401)
      expect(error.code).toBe('UNAUTHORIZED')
    })
  })

  describe('unauthorizedResponse', () => {
    it('应该返回 401 响应', () => {
      const response = unauthorizedResponse('自定义消息')
      
      expect(response.status).toBe(401)
    })

    it('应该返回默认消息', async () => {
      const response = unauthorizedResponse()
      const body = await response.json()
      
      expect(body.message).toBe('请先登录')
    })
  })

  describe('forbiddenResponse', () => {
    it('应该返回 403 响应', () => {
      const response = forbiddenResponse('自定义消息')
      
      expect(response.status).toBe(403)
    })

    it('应该返回默认消息', async () => {
      const response = forbiddenResponse()
      const body = await response.json()
      
      expect(body.message).toBe('无权访问')
    })
  })
})
