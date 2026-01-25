import { db } from '../index'
import { creativeMilestones } from '../schema/creative-milestones'
import { eq, and, desc } from 'drizzle-orm'
import type { NewCreativeMilestone } from '../schema/creative-milestones'

/**
 * Create a creative milestone
 */
export async function createCreativeMilestone(data: NewCreativeMilestone) {
  const [milestone] = await db.insert(creativeMilestones).values(data).returning()
  return milestone
}

/**
 * Get milestone by ID
 */
export async function getCreativeMilestoneById(id: string) {
  const milestone = await db.query.creativeMilestones.findFirst({
    where: eq(creativeMilestones.id, id),
  })
  return milestone
}

/**
 * Get milestones by user ID
 */
export async function getMilestonesByUserId(userId: string) {
  const milestones = await db.query.creativeMilestones.findMany({
    where: eq(creativeMilestones.userId, userId),
    orderBy: [desc(creativeMilestones.achievedAt)],
  })
  return milestones
}

/**
 * Get milestones by project ID
 */
export async function getMilestonesByProjectId(projectId: string) {
  const milestones = await db.query.creativeMilestones.findMany({
    where: eq(creativeMilestones.projectId, projectId),
    orderBy: [desc(creativeMilestones.achievedAt)],
  })
  return milestones
}

/**
 * Get milestone by type for project
 */
export async function getMilestoneByType(projectId: string, type: 'first_scene' | 'first_episode' | 'completed') {
  const milestone = await db.query.creativeMilestones.findFirst({
    where: and(
      eq(creativeMilestones.projectId, projectId),
      eq(creativeMilestones.type, type)
    ),
  })
  return milestone
}

/**
 * Check if milestone exists for project
 */
export async function hasMilestone(projectId: string, type: 'first_scene' | 'first_episode' | 'completed') {
  const milestone = await getMilestoneByType(projectId, type)
  return !!milestone
}

/**
 * Record milestone (idempotent)
 */
export async function recordMilestone(
  userId: string,
  projectId: string,
  type: 'first_scene' | 'first_episode' | 'completed',
  aiContribution: number
) {
  const existing = await getMilestoneByType(projectId, type)

  if (existing) {
    // Update existing milestone
    const [updated] = await db
      .update(creativeMilestones)
      .set({ aiContribution })
      .where(eq(creativeMilestones.id, existing.id))
      .returning()
    return updated
  }

  // Create new milestone
  return createCreativeMilestone({
    userId,
    projectId,
    type,
    aiContribution,
    achievedAt: new Date(),
  })
}

/**
 * Get user's AI contribution stats
 */
export async function getUserAIContributionStats(userId: string) {
  const milestones = await getMilestonesByUserId(userId)

  const stats = {
    totalProjects: new Set(milestones.map(m => m.projectId)).size,
    firstSceneCount: milestones.filter(m => m.type === 'first_scene').length,
    firstEpisodeCount: milestones.filter(m => m.type === 'first_episode').length,
    completedCount: milestones.filter(m => m.type === 'completed').length,
    averageAIContribution: 0,
  }

  if (milestones.length > 0) {
    stats.averageAIContribution =
      milestones.reduce((sum, m) => sum + m.aiContribution, 0) / milestones.length
  }

  return stats
}
