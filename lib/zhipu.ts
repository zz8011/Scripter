/**
 * 智谱 AI 服务封装
 *
 * 提供智谱 GLM-4.7 API 调用功能
 */

import { aiConfig } from './env'

const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'

/**
 * AI 服务错误类型
 */
export class AIServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'AIServiceError'
  }
}

/**
 * AI 服务降级响应
 */
interface FallbackResponse {
  content: string
  isFallback: true
  error: string
}

export interface ZhipuMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ZhipuResponse {
  id: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

/**
 * 调用智谱 AI API
 * 支持自动降级策略
 */
export async function callZhipuAI(
  messages: ZhipuMessage[],
  options: {
    model?: string
    temperature?: number
    maxTokens?: number
    stream?: boolean
    enableFallback?: boolean
  } = {}
): Promise<ZhipuResponse | FallbackResponse> {
  const {
    model = 'glm-4-plus',
    temperature = 0.7,
    maxTokens = 2000,
    stream = false,
    enableFallback = true,
  } = options

  try {
    const response = await fetch(ZHIPU_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiConfig.zhipuApiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new AIServiceError(
        `AI API 错误: ${response.status} - ${errorText}`,
        'AI_API_ERROR',
        response.status
      )
    }

    const data: ZhipuResponse = await response.json()
    return data
  } catch (error) {
    console.error('Error calling Zhipu AI:', error)
    
    // 降级策略
    if (enableFallback) {
      console.warn('AI 服务调用失败，启用降级响应')
      return generateFallbackResponse(messages, error)
    }
    
    throw error instanceof AIServiceError 
      ? error 
      : new AIServiceError(
          error instanceof Error ? error.message : '未知错误',
          'AI_SERVICE_ERROR'
        )
  }
}

/**
 * 生成降级响应
 */
function generateFallbackResponse(
  messages: ZhipuMessage[],
  error: unknown
): FallbackResponse {
  const lastUserMessage = messages
    .filter((m) => m.role === 'user')
    .pop()?.content || ''
  
  const errorMessage = error instanceof Error ? error.message : '服务暂时不可用'
  
  return {
    content: `抱歉，AI 服务暂时不可用。\n\n错误信息: ${errorMessage}\n\n请稍后重试，或联系管理员检查服务状态。`,
    isFallback: true,
    error: errorMessage,
  }
}

/**
 * 流式调用智谱 AI（用于 Server-Sent Events）
 * 支持自动降级策略
 */
export async function* callZhipuAIStream(
  messages: ZhipuMessage[],
  options: {
    model?: string
    temperature?: number
    maxTokens?: number
    enableFallback?: boolean
  } = {}
): AsyncGenerator<string, void, unknown> {
  const {
    model = 'glm-4-plus',
    temperature = 0.7,
    maxTokens = 2000,
    enableFallback = true,
  } = options

  try {
    const response = await fetch(ZHIPU_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiConfig.zhipuApiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new AIServiceError(
        `AI API 错误: ${response.status} - ${errorText}`,
        'AI_API_ERROR',
        response.status
      )
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new AIServiceError('响应体不可读', 'STREAM_ERROR')
    }

    const decoder = new TextDecoder()
    let buffer = ''
    let hasReceivedContent = false

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      hasReceivedContent = true
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data:')) continue

        const data = trimmed.slice(5).trim()
        if (data === '[DONE]') return

        try {
          const parsed = JSON.parse(data)
          const content = parsed.choices?.[0]?.delta?.content
          if (content) {
            yield content
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }

    // 如果没有收到任何内容，可能是错误
    if (!hasReceivedContent && enableFallback) {
      yield '抱歉，AI 服务没有返回内容。请稍后重试。'
    }
  } catch (error) {
    console.error('Error in Zhipu AI stream:', error)
    
    // 流式降级策略
    if (enableFallback) {
      const errorMessage = error instanceof Error ? error.message : '服务暂时不可用'
      yield `\n\n[AI 服务错误: ${errorMessage}]`
      return
    }
    
    throw error instanceof AIServiceError
      ? error
      : new AIServiceError(
          error instanceof Error ? error.message : '未知错误',
          'AI_STREAM_ERROR'
        )
  }
}

/**
 * 计算 Token 估算值（粗略计算）
 * 中文：约 1.5 字符 = 1 token
 * 英文：约 4 字符 = 1 token
 */
export function estimateTokens(text: string): number {
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
  const otherChars = text.length - chineseChars
  return Math.ceil(chineseChars / 1.5 + otherChars / 4)
}
