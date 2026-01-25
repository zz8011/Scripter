import { NextRequest } from 'next/server'
import { callZhipuAIStream, estimateTokens, type ZhipuMessage } from '@/lib/zhipu'
import { checkUserQuota, useQuota } from '@/lib/quota'
import { createAIConversation } from '@/db/queries/ai-conversations'
import { auth } from '@/lib/session'

/**
 * POST /api/ai/stream
 * Stream AI response using Server-Sent Events
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { messages, agent, projectId } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response('Messages are required', { status: 400 })
    }

    // Estimate tokens needed
    const promptText = messages.map(m => m.content).join('\n')
    const estimatedTokens = estimateTokens(promptText)

    // Check quota
    const quotaCheck = await checkUserQuota(session.user.id, estimatedTokens)
    if (!quotaCheck.allowed) {
      return new Response(
        `data: ${JSON.stringify({ error: 'QUOTA_EXCEEDED', remaining: quotaCheck.remaining })}\n\n`,
        {
          status: 429,
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
          },
        }
      )
    }

    // Create SSE stream
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullContent = ''
          let tokenCount = 0

          for await (const chunk of callZhipuAIStream(messages as ZhipuMessage[])) {
            fullContent += chunk
            tokenCount = estimateTokens(fullContent)

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`)
            )
          }

          // Deduct quota (approximate)
          await useQuota(session.user.id, estimatedTokens + tokenCount)

          // Save conversation
          if (projectId) {
            await createAIConversation({
              userId: session.user.id,
              projectId,
              agent: agent || 'chat',
              messages: [
                {
                  role: 'user',
                  content: messages[messages.length - 1].content,
                  timestamp: new Date(),
                  metadata: { tokensUsed: estimatedTokens },
                },
                {
                  role: 'assistant',
                  content: fullContent,
                  timestamp: new Date(),
                  metadata: { tokensUsed: tokenCount },
                },
              ] as any,
            })
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          console.error('Error in AI stream:', error)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`)
          )
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Error setting up AI stream:', error)
    return new Response('Failed to setup stream', { status: 500 })
  }
}
