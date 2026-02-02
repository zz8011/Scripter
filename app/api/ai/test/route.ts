import { NextRequest, NextResponse } from 'next/server'
import { callZhipuAI, type ZhipuMessage } from '@/lib/zhipu'
import { logger } from '@/lib/logger'

/**
 * POST /api/ai/test
 * 开发模式下的 AI 测试端点（无需认证）
 * 仅用于开发和测试，生产环境应该禁用
 */
export async function POST(request: NextRequest) {
  // 安全检查：仅在开发环境启用
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Test endpoint is only available in development mode' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { message } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      )
    }

    // 构建消息列表
    const messages: ZhipuMessage[] = [
      {
        role: 'system',
        content: '你是剧灵（Scripter），一个专业的剧本创作 AI 助手。你擅长帮助用户创作剧本、塑造人物、设计场景和构建世界观。你的回答应该专业、富有创意，并且简洁明了。',
      },
      {
        role: 'user',
        content: message,
      },
    ]

    // 调用智谱 AI
    const response = await callZhipuAI(messages, {
      model: 'glm-4-plus',
      temperature: 0.7,
      maxTokens: 1000,
    })

    const assistantMessage = response.choices[0].message

    return NextResponse.json({
      content: assistantMessage.content,
      usage: response.usage,
      model: response.model,
    })
  } catch (error) {
    logger.error('Error in AI test endpoint:', error instanceof Error ? error : undefined)

    // 返回详细错误信息
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json(
      {
        error: 'Failed to process AI request',
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}
