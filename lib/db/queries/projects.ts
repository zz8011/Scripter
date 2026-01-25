import { db } from '../index'
import { projects } from '../schema/projects'
import { eq, and, desc } from 'drizzle-orm'
import type { NewProject } from '../schema/projects'

export async function createProject(data: NewProject) {
  const [project] = await db.insert(projects).values(data).returning()
  return project
}

export async function getProjectById(id: string) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
  })
  return project
}

export async function getProjectsByUserId(userId: string) {
  const userProjects = await db.query.projects.findMany({
    where: eq(projects.userId, userId),
    orderBy: [desc(projects.updatedAt)],
  })
  return userProjects
}

export async function updateProject(id: string, data: Partial<NewProject>) {
  const [project] = await db
    .update(projects)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning()
  return project
}

export async function deleteProject(id: string, userId: string) {
  await db
    .delete(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, userId)))
}
