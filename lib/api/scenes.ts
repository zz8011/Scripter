/**
 * Scene API Client
 *
 * API client for scene-related operations
 */

export interface Scene {
  id: string
  projectId: string
  episodeNumber: number
  sceneNumber: number
  location: string
  timeOfDay: string
  intExt: string
  content: any // TipTap JSON format
  duration: number
  status: 'draft' | 'completed'
  createdAt: Date | string
}

export interface CreateSceneInput {
  projectId: string
  episodeNumber: number
  sceneNumber: number
  location: string
  timeOfDay: string
  intExt: string
  content?: any
  duration?: number
  status?: 'draft' | 'completed'
}

export interface UpdateSceneInput {
  episodeNumber?: number
  sceneNumber?: number
  location?: string
  timeOfDay?: string
  intExt?: string
  content?: any
  duration?: number
  status?: 'draft' | 'completed'
}

export interface ScenesResponse {
  scenes: Scene[]
}

export interface SceneResponse {
  scene: Scene
}

/**
 * Re-export ApiError from projects
 */
export { ApiError } from '@/lib/api/projects'

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

    // Import ApiError dynamically to avoid circular dependency
    const { ApiError } = await import('@/lib/api/projects')
    throw new ApiError(errorMessage, response.status, details)
  }

  return response
}

/**
 * Get all scenes for a project
 */
export async function getScenes(projectId: string, episodeNumber?: number): Promise<Scene[]> {
  const url = episodeNumber
    ? `/api/scenes?projectId=${projectId}&episodeNumber=${episodeNumber}`
    : `/api/scenes?projectId=${projectId}`

  const response = await fetchApi(url)
  const data = (await response.json()) as ScenesResponse
  return data.scenes
}

/**
 * Get a single scene by ID
 */
export async function getScene(id: string): Promise<Scene> {
  const response = await fetchApi(`/api/scenes/${id}`)
  const data = (await response.json()) as SceneResponse
  return data.scene
}

/**
 * Create a new scene
 */
export async function createScene(input: CreateSceneInput): Promise<Scene> {
  const response = await fetchApi('/api/scenes', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  const data = (await response.json()) as SceneResponse
  return data.scene
}

/**
 * Update a scene
 */
export async function updateScene(id: string, input: UpdateSceneInput & { projectId: string }): Promise<Scene> {
  const response = await fetchApi(`/api/scenes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
  const data = (await response.json()) as SceneResponse
  return data.scene
}

/**
 * Delete a scene
 */
export async function deleteScene(id: string, projectId: string): Promise<void> {
  await fetchApi(`/api/scenes/${id}?projectId=${projectId}`, {
    method: 'DELETE',
  })
}
