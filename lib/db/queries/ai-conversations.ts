import { db } from '../index'
import { aiConversations } from '../schema/ai-conversations'
import { eq, and, desc, asc } from 'drizzle-orm'
import type { NewAIConversation, ConversationMessage } from '../schema/ai-conversations'

/**
 * Create a new AI conversation
 */
export async function createAIConversation(data: NewAIConversation) {
  const [conversation] = await db.insert(aiConversations).values(data).returning()
  return conversation
}

/**
 * Get AI conversation by ID
 */
export async function getAIConversationById(id: string) {
  const conversation = await db.query.aiConversations.findFirst({
    where: eq(aiConversations.id, id),
  })
  return conversation
}

/**
 * Get AI conversations by user ID
 */
export async function getAIConversationsByUserId(userId: string, limit = 50) {
  const conversations = await db.query.aiConversations.findMany({
    where: eq(aiConversations.userId, userId),
    orderBy: [desc(aiConversations.updatedAt)],
    limit,
  })
  return conversations
}

/**
 * Get AI conversations by project ID
 */
export async function getAIConversationsByProjectId(projectId: string, limit = 100) {
  const conversations = await db.query.aiConversations.findMany({
    where: eq(aiConversations.projectId, projectId),
    orderBy: [desc(aiConversations.updatedAt)],
    limit,
  })
  return conversations
}

/**
 * Get AI conversations by agent
 */
export async function getAIConversationsByAgent(userId: string, agent: string, limit = 50) {
  const conversations = await db.query.aiConversations.findMany({
    where: and(eq(aiConversations.userId, userId), eq(aiConversations.agent, agent)),
    orderBy: [desc(aiConversations.updatedAt)],
    limit,
  })
  return conversations
}

/**
 * Add message to conversation
 */
export async function addMessageToConversation(
  conversationId: string,
  userId: string,
  message: ConversationMessage
) {
  const conversation = await getAIConversationById(conversationId)
  if (!conversation || conversation.userId !== userId) {
    throw new Error('Conversation not found or access denied')
  }

  const updatedMessages = [...conversation.messages, message]
  const [updated] = await db
    .update(aiConversations)
    .set({
      messages: updatedMessages as any,
      updatedAt: new Date(),
    })
    .where(eq(aiConversations.id, conversationId))
    .returning()

  return updated
}

/**
 * Update AI conversation
 */
export async function updateAIConversation(id: string, userId: string, data: Partial<NewAIConversation>) {
  const [conversation] = await db
    .update(aiConversations)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(aiConversations.id, id), eq(aiConversations.userId, userId)))
    .returning()
  return conversation
}

/**
 * Delete AI conversation
 */
export async function deleteAIConversation(id: string, userId: string) {
  await db
    .delete(aiConversations)
    .where(and(eq(aiConversations.id, id), eq(aiConversations.userId, userId)))
}

/**
 * Get token usage for user in a time range
 */
export async function getTokenUsage(userId: string, startDate?: Date, endDate?: Date) {
  const conversations = await getAIConversationsByUserId(userId, 1000)

  let totalTokens = 0
  for (const conv of conversations) {
    const convDate = new Date(conv.createdAt)
    if (startDate && convDate < startDate) continue
    if (endDate && convDate > endDate) continue

    for (const msg of conv.messages) {
      totalTokens += msg.metadata?.tokensUsed || 0
    }
  }

  return totalTokens
}
