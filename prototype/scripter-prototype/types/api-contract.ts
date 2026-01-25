/**
 * API 接口契约
 *
 * 此文件定义前后端之间的接口契约
 * 修改此文件需要前后端 Agent 协商一致
 */

// ==================== 通用类型 ====================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ==================== 角色相关 API ====================

export interface Character {
  id: string;
  name: string;
  description: string;
  personality: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCharacterRequest {
  name: string;
  description: string;
  personality: string;
}

export interface UpdateCharacterRequest {
  name?: string;
  description?: string;
  personality?: string;
}

// ==================== 场景相关 API ====================

export interface Scene {
  id: string;
  title: string;
  content: string;
  characters: string[];
  location?: string;
  time?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSceneRequest {
  title: string;
  content: string;
  characters: string[];
  location?: string;
  time?: string;
}

export interface UpdateSceneRequest {
  title?: string;
  content?: string;
  characters?: string[];
  location?: string;
  time?: string;
}

// ==================== 剧本相关 API ====================

export interface Script {
  id: string;
  title: string;
  description?: string;
  scenes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateScriptRequest {
  title: string;
  description?: string;
}

// ==================== API 路由定义 ====================

export const API_ROUTES = {
  // 角色相关
  CHARACTERS: '/api/characters',
  CHARACTER_BY_ID: (id: string) => `/api/characters/${id}`,

  // 场景相关
  SCENES: '/api/scenes',
  SCENE_BY_ID: (id: string) => `/api/scenes/${id}`,

  // 剧本相关
  SCRIPTS: '/api/scripts',
  SCRIPT_BY_ID: (id: string) => `/api/scripts/${id}`,
} as const;
