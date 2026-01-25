/**
 * 智谱 AI 服务封装
 *
 * 提供智谱 GLM-4.7 API 调用功能
 */

const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY
const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'

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
 */
export async function callZhipuAI(
  messages: ZhipuMessage[],
  options: {
    model?: string
    temperature?: number
    maxTokens?: number
    stream?: boolean
  } = {}
): Promise<ZhipuResponse> {
  if (!ZHIPU_API_KEY) {
    throw new Error('ZHIPU_API_KEY is not configured')
  }

  const {
    model = 'glm-4-plus',
    temperature = 0.7,
    maxTokens = 2000,
    stream = false,
  } = options

  try {
    const response = await fetch(ZHIPU_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ZHIPU_API_KEY}`,
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
      const error = await response.text()
      throw new Error(`Zhipu AI API error: ${response.status} - ${error}`)
    }

    const data: ZhipuResponse = await response.json()
    return data
  } catch (error) {
    console.error('Error calling Zhipu AI:', error)
    throw error
  }
}

/**
 * 流式调用智谱 AI（用于 Server-Sent Events）
 */
export async function* callZhipuAIStream(
  messages: ZhipuMessage[],
  options: {
    model?: string
    temperature?: number
    maxTokens?: number
  } = {}
): AsyncGenerator<string, void, unknown> {
  if (!ZHIPU_API_KEY) {
    throw new Error('ZHIPU_API_KEY is not configured')
  }

  const {
    model = 'glm-4-plus',
    temperature = 0.7,
    maxTokens = 2000,
  } = options

  try {
    const response = await fetch(ZHIPU_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ZHIPU_API_KEY}`,
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
      const error = await response.text()
      throw new Error(`Zhipu AI API error: ${response.status} - ${error}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('Response body is not readable')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

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
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  } catch (error) {
    console.error('Error in Zhipu AI stream:', error)
    throw error
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
