import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  callZhipuAI,
  callZhipuAIStream,
  estimateTokens,
  AIServiceError,
  type ZhipuMessage,
} from '@/lib/zhipu'

// Mock fetch
global.fetch = vi.fn()

describe('zhipu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('callZhipuAI', () => {
    const mockMessages: ZhipuMessage[] = [
      { role: 'user', content: 'Hello' },
    ]

    it('应该成功调用 AI API', async () => {
      const mockResponse = {
        id: 'test-id',
        created: Date.now(),
        model: 'glm-4-plus',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'Hello back!',
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30,
        },
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response)

      const result = await callZhipuAI(mockMessages)

      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        'https://open.bigmodel.cn/api/paas/v4/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': expect.stringContaining('Bearer'),
          }),
        })
      )
    })

    it('应该在 API 错误时抛出 AIServiceError', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
      } as Response)

      await expect(callZhipuAI(mockMessages, { enableFallback: false })).rejects.toThrow(
        AIServiceError
      )
    })

    it('应该在启用降级时返回降级响应', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

      const result = await callZhipuAI(mockMessages, { enableFallback: true })

      expect(result).toHaveProperty('isFallback', true)
      expect(result).toHaveProperty('content')
      expect(result).toHaveProperty('error')
    })

    it('应该在禁用降级时抛出错误', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

      await expect(callZhipuAI(mockMessages, { enableFallback: false })).rejects.toThrow()
    })

    it('应该使用自定义参数', async () => {
      const mockResponse = {
        id: 'test-id',
        created: Date.now(),
        model: 'glm-4-flash',
        choices: [],
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response)

      await callZhipuAI(mockMessages, {
        model: 'glm-4-flash',
        temperature: 0.5,
        maxTokens: 1000,
      })

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('glm-4-flash'),
        })
      )
    })
  })

  describe('callZhipuAIStream', () => {
    const mockMessages: ZhipuMessage[] = [
      { role: 'user', content: 'Hello' },
    ]

    it('应该成功流式调用 AI API', async () => {
      const mockReader = {
        read: vi.fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hello"}}]}\n'),
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":" world"}}]}\n'),
          })
          .mockResolvedValueOnce({
            done: true,
            value: undefined,
          }),
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      } as unknown as Response)

      const generator = callZhipuAIStream(mockMessages)
      const chunks: string[] = []

      for await (const chunk of generator) {
        chunks.push(chunk)
      }

      expect(chunks).toContain('Hello')
      expect(chunks).toContain(' world')
    })

    it('应该在流式调用失败时返回错误消息', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

      const generator = callZhipuAIStream(mockMessages, { enableFallback: true })
      const chunks: string[] = []

      for await (const chunk of generator) {
        chunks.push(chunk)
      }

      expect(chunks.some(chunk => chunk.includes('AI 服务错误'))).toBe(true)
    })
  })

  describe('estimateTokens', () => {
    it('应该正确估算中文 token 数', () => {
      // 中文约 1.5 字符 = 1 token
      const text = '你好世界' // 4 个中文字符
      const tokens = estimateTokens(text)
      expect(tokens).toBe(Math.ceil(4 / 1.5))
    })

    it('应该正确估算英文 token 数', () => {
      // 英文约 4 字符 = 1 token
      const text = 'Hello world' // 11 个字符（包括空格）
      const tokens = estimateTokens(text)
      expect(tokens).toBe(Math.ceil(11 / 4))
    })

    it('应该正确估算混合文本 token 数', () => {
      const text = 'Hello 世界' // 5 个英文 + 1 空格 + 2 个中文
      // 英文部分: 6 / 4 = 1.5 -> 2
      // 中文部分: 2 / 1.5 = 1.33 -> 2
      // 总计: 4
      const tokens = estimateTokens(text)
      expect(tokens).toBeGreaterThan(0)
    })

    it('应该处理空字符串', () => {
      expect(estimateTokens('')).toBe(0)
    })
  })

  describe('AIServiceError', () => {
    it('应该正确创建错误对象', () => {
      const error = new AIServiceError('Test error', 'TEST_CODE', 500)
      
      expect(error.message).toBe('Test error')
      expect(error.code).toBe('TEST_CODE')
      expect(error.statusCode).toBe(500)
      expect(error.name).toBe('AIServiceError')
    })

    it('应该在没有状态码时创建错误对象', () => {
      const error = new AIServiceError('Test error', 'TEST_CODE')
      
      expect(error.statusCode).toBeUndefined()
    })
  })
})
