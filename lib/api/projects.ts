/**
 * Project API Client
 *
 * API client for project-related operations
 */

import type { ApiError } from '@/lib/types'

export interface Project {
  id: string
  userId: string
  name: string
  scriptType: 'movie' | 'series' | 'short-drama'
  orientation: 'landscape' | 'portrait'
  targetEpisodes: number
  genre: string[]
  currentStage: 'worldview' | 'character' | 'script' | 'optimize' | 'production'
  createdAt: Date | string
  updatedAt: Date | string
}

export interface CreateProjectInput {
  name: string
  scriptType: 'movie' | 'series' | 'short-drama'
  orientation?: 'landscape' | 'portrait'
  targetEpisodes?: number
  genre?: string[]
}

export interface UpdateProjectInput {
  name?: string
  genre?: string[]
  currentStage?: 'worldview' | 'character' | 'script' | 'optimize' | 'production'
}

export interface ProjectsResponse {
  projects: Project[]
}

export interface ProjectResponse {
  project: Project
}

/**
 * API error class - 从 types.ts 重新导出
 */
export { ApiError } from '@/lib/types'

/**
 * Fetch wrapper with error handling
 */
async function fetchApi(url: string, options?: RequestInit): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    let errorMessage = 'API request failed'
    let details: unknown

    try {
      const error = await response.json()
      errorMessage = error.error || errorMessage
      details = error.details
    } catch {
      // Ignore JSON parse errors
    }

    throw new ApiError(errorMessage, response.status, details)
  }

  return response
}

/**
 * Get all projects for the current user
 */
export async function getProjects(): Promise<Project[]> {
  const response = await fetchApi('/api/projects')
  const data = (await response.json()) as ProjectsResponse
  return data.projects
}

/**
 * Get a single project by ID
 */
export async function getProject(id: string): Promise<Project> {
  const response = await fetchApi(`/api/projects/${id}`)
  const data = (await response.json()) as ProjectResponse
  return data.project
}

/**
 * Create a new project
 */
export async function createProject(input: CreateProjectInput): Promise<Project> {
  const response = await fetchApi('/api/projects', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  const data = (await response.json()) as ProjectResponse
  return data.project
}

/**
 * Update a project
 */
export async function updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
  const response = await fetchApi(`/api/projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
  const data = (await response.json()) as ProjectResponse
  return data.project
}

/**
 * Delete a project
 */
export async function deleteProject(id: string): Promise<void> {
  await fetchApi(`/api/projects/${id}`, {
    method: 'DELETE',
  })
}
