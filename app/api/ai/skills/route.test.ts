/**
 * Skills API 测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from './route'
import { SkillRegistry } from '@/lib/agents/skills/SkillRegistry'
import * as quota from '@/lib/quota'

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  withAuth: (handler: any) => handler
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn()
  }
}))

vi.mock('@/lib/quota')
vi.mock('@/lib/agents/skills/init')

describe('GET /api/ai/skills', () => {
  it('应该返回所有已注册的技能', async () => {
    const req = new NextRequest('http://localhost:3000/api/ai/skills')
    const session = { userId: 'test-user', email: 'test@example.com' }

    const response = await GET(req, session as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('skills')
    expect(Array.isArray(data.skills)).toBe(true)
  })

  it('返回的技能应该包含必要字段', async () => {
    const req = new NextRequest('http://localhost:3000/api/ai/skills')
    const session = { userId: 'test-user', email: 'test@example.com' }

    const response = await GET(req, session as any)
    const data = await response.json()

    if (data.skills.length > 0) {
      const skill = data.skills[0]
      expect(skill).toHaveProperty('id')
      expect(skill).toHaveProperty('name')
      expect(skill).toHaveProperty('description')
      expect(skill).toHaveProperty('category')
      expect(skill).toHaveProperty('metadata')
    }
  })
})

describe('POST /api/ai/skills', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该拒绝无效的输入', async () => {
    const req = new NextRequest('http://localhost:3000/api/ai/skills', {
      method: 'POST',
      body: JSON.stringify({
        // 缺少必需字段
      })
    })
    const session = { userId: 'test-user', email: 'test@example.com' }

    const response = await POST(req, session as any)
    const data = await response.json()

    expect(response.status).toBe(422)
    expect(data.code).toBe('VALIDATION_FAILED')
  })

  it('应该拒绝不存在的技能', async () => {
    const req = new NextRequest('http://localhost:3000/api/ai/skills', {
      method: 'POST',
      body: JSON.stringify({
        skillId: 'non-existent-skill',
        input: {}
      })
    })
    const session = { userId: 'test-user', email: 'test@example.com' }

    const response = await POST(req, session as any)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.code).toBe('NOT_FOUND')
  })

  it('应该在配额不足时拒绝执行', async () => {
    vi.mocked(quota.checkUserQuota).mockResolvedValue({
      allowed: false,
      hasQuota: false,
      reason: 'AI_QUOTA_EXCEEDED',
      remaining: 0
    })

    const req = new NextRequest('http://localhost:3000/api/ai/skills', {
      method: 'POST',
      body: JSON.stringify({
        skillId: 'format-fix',
        input: { content: 'test' }
      })
    })
    const session = { userId: 'test-user', email: 'test@example.com' }

    const response = await POST(req, session as any)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.code).toBe('TOO_MANY_REQUESTS')
  })

  it('应该成功执行技能并扣减配额', async () => {
    vi.mocked(quota.checkUserQuota).mockResolvedValue({
      allowed: true,
      hasQuota: true
    })
    vi.mocked(quota.deductQuota).mockResolvedValue()

    const req = new NextRequest('http://localhost:3000/api/ai/skills', {
      method: 'POST',
      body: JSON.stringify({
        skillId: 'format-fix',
        input: { content: 'test content' },
        editorState: {
          projectId: 'test-project',
          content: 'test content'
        }
      })
    })
    const session = { userId: 'test-user', email: 'test@example.com' }

    const response = await POST(req, session as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data).toHaveProperty('skillId')
    expect(data).toHaveProperty('result')
    expect(data).toHaveProperty('tokensUsed')
    expect(quota.deductQuota).toHaveBeenCalled()
  })
})
