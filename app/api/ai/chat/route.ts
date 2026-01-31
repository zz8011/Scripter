import { NextRequest, NextResponse } from 'next/server'
import { callZhipuAI, estimateTokens, type ZhipuMessage } from '@/lib/zhipu'
import { checkUserQuota, useQuota } from '@/lib/quota'
import { createAIConversation, addMessageToConversation } from '@/lib/db/queries/ai-conversations'
import { getSessionWithDev } from '@/lib/session'

/**
 * POST /api/ai/chat
 * Send a message to AI and get response
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionWithDev()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { messages, agent, projectId, conversationId } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 })
    }

    // Estimate tokens needed
    const promptText = messages.map(m => m.content).join('\n')
    const estimatedTokens = estimateTokens(promptText)

    // Check quota
    const quotaCheck = await checkUserQuota(session.user.id, estimatedTokens)
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        {
          error: 'QUOTA_EXCEEDED',
          message: 'AI quota exceeded',
          remaining: quotaCheck.remaining,
          resetAt: quotaCheck.resetAt,
        },
        { status: 429 }
      )
    }

    // Call Zhipu AI
    const response = await callZhipuAI(messages as ZhipuMessage[], {
      model: 'glm-4-plus',
      temperature: 0.7,
      maxTokens: 2000,
    })

    // Deduct quota
    const actualTokens = response.usage.total_tokens
    await useQuota(session.user.id, actualTokens)

    // Create or update conversation
    const assistantMessage = response.choices[0].message

    let conversation
    if (conversationId) {
      conversation = await addMessageToConversation(conversationId, session.user.id, {
        role: 'user',
        content: messages[messages.length - 1].content,
        timestamp: new Date(),
        metadata: { tokensUsed: response.usage.prompt_tokens },
      })
      conversation = await addMessageToConversation(conversationId, session.user.id, {
        role: 'assistant',
        content: assistantMessage.content,
        timestamp: new Date(),
        metadata: { tokensUsed: response.usage.completion_tokens },
      })
    } else if (projectId) {
      conversation = await createAIConversation({
        userId: session.user.id,
        projectId,
        agent: agent || 'chat',
        messages: [
          {
            role: 'user',
            content: messages[messages.length - 1].content,
            timestamp: new Date(),
            metadata: { tokensUsed: response.usage.prompt_tokens },
          },
          {
            role: 'assistant',
            content: assistantMessage.content,
            timestamp: new Date(),
            metadata: { tokensUsed: response.usage.completion_tokens },
          },
        ] as any,
      })
    }

    return NextResponse.json({
      content: assistantMessage.content,
      usage: response.usage,
      conversationId: conversation?.id,
    })
  } catch (error) {
    console.error('Error in AI chat:', error)
    return NextResponse.json({ error: 'Failed to process AI request' }, { status: 500 })
  }
}
