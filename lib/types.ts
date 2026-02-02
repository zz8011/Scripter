/* ==================================================
   类型定义 Type Definitions
   统一的全局类型定义文件
   ================================================== */

// ============================================
// 基础类型 / Base Types
// ============================================

/**
 * Cookie 会话类型 - 用于浏览器 cookie 存储
 * 由 lib/session.ts 管理
 */
export interface CookieSession {
  sessionId: string
  user: {
    id: string
    email: string
    name: string
  }
  accessToken: string
}

/**
 * 认证会话类型 - 用于 API 路由的会话
 * 由 lib/auth.ts 管理
 * 
 * 注意: 这与 CookieSession 是不同的类型，用于不同的场景
 */
export interface AuthSession {
  id: string
  userId: string
  email: string
  name: string
  accessToken: string
  expiresAt: Date
}

/**
 * 从 types.ts 重新导出 AuthError
 */
export { AuthError } from '@/lib/auth'

/**
 * @deprecated 使用 CookieSession 或 AuthSession
 * 保留此别名以向后兼容
 */
export type Session = CookieSession

// ============================================
// 导出相关类型 / Export Types
// ============================================

/**
 * 剧本元素类型
 */
export interface ScriptElement {
  type: 'scene-heading' | 'character' | 'dialogue' | 'action' | 'parenthetical' | 'text'
  content: string
}

/**
 * 导出选项 - 统一类型
 */
export interface ExportOptions {
  includeTitlePage?: boolean
  includeSceneNumbers?: boolean
  pageSize?: 'A4' | 'US-Letter'
}

/**
 * 导出格式类型
 */
export type ExportFormat = 'pdf' | 'word' | 'txt' | 'fountain'

/**
 * 导出进度状态
 */
export type ExportStatus = 'idle' | 'preparing' | 'generating' | 'downloading' | 'completed' | 'error'

/**
 * 导出进度类型
 */
export interface ExportProgress {
  status: 'idle' | 'preparing' | 'generating' | 'downloading' | 'completed' | 'error'
  progress: number // 0-100
  message: string
}

// ============================================
// AI 相关类型 / AI Types
// ============================================

/**
 * AI 消息类型
 */
export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  type?: 'text' | 'image' | 'file'
}

/**
 * 对话消息类型 - 用于数据库存储
 */
export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    skill?: string // 如果使用了 Skill
    intention?: string // 识别到的意图
    tokensUsed?: number // 消耗的 tokens
  }
}

// ============================================
// 用户相关类型 / User Types
// ============================================

/**
 * 用户信息类型
 */
export interface UserInfo {
  id: string
  name: string
  email?: string
  avatar?: string
}

/**
 * 用户八字配置类型
 */
export interface UserBaziConfig {
  id: string
  userId: string
  birthYear: number
  birthMonth: number
  birthDay: number
  birthHour: number
  bazi: string // 八字字符串
  wuxing: string // 五行: 金木水火土
  shiho: string // 诗号
  createdAt: Date
  updatedAt: Date
}

/**
 * 剧灵性格类型
 */
export interface JulingPersonality {
  elements: string[] // 五行属性：金木水火土
  style: string // 说话风格描述
}

// ============================================
// 项目相关类型 / Project Types
// ============================================

/**
 * 项目类型
 */
export interface Project {
  id: string
  name: string
  description: string
  coverImage?: string
  createdAt: Date
  updatedAt: Date
  wordCount: number
  sceneCount: number
  characterCount: number
  progress: number
  type: string
  estimatedEpisodes: number
}

/**
 * 项目元数据类型（API 使用）
 */
export interface ProjectMetadata {
  genre: string[]
  scriptType: 'movie' | 'series' | 'short-drama'
  orientation: 'landscape' | 'portrait'
  targetEpisodes: number
  currentStage: 'worldview' | 'character' | 'script' | 'optimize' | 'production'
}

// ============================================
// 人物相关类型 / Character Types
// ============================================

/**
 * 人物关系类型
 */
export interface Relationship {
  characterId: string
  type: 'family' | 'friend' | 'enemy' | 'lover' | 'mentor' | 'other'
  description: string
}

/**
 * 人物类型
 */
export interface Character {
  id: string
  projectId: string
  name: string
  avatar?: string
  nickname?: string
  age?: number
  gender?: 'male' | 'female' | 'other'
  personality?: string[]
  speechStyle?: string
  behaviorPattern?: string
  backstory?: string
  poem?: string // 诗号
  relationships?: Relationship[]
}

// ============================================
// 场景相关类型 / Scene Types
// ============================================

/**
 * 场景类型
 */
export interface Scene {
  id: string
  projectId: string
  episodeNumber: number
  sceneNumber: number
  title?: string
  location?: string
  time?: 'day' | 'night' | 'dawn' | 'dusk'
  environment?: 'interior' | 'exterior' | 'both'
  status: 'draft' | 'in_progress' | 'completed'
  content?: string // TipTap JSON
  duration?: number // 时长（秒）
}

// ============================================
// 世界观相关类型 / Worldview Types
// ============================================

/**
 * 世界观设定类型
 */
export interface WorldviewItem {
  id: string
  projectId: string
  category: string // 支持自定义分类
  title: string
  description: string
  tags?: string[]
  order: number
  createdAt: Date
  updatedAt: Date
}

/**
 * 世界观分类类型
 */
export interface WorldviewCategory {
  id: string
  name: string
  icon?: string
  description?: string
  isDefault: boolean
  order: number
}

// ============================================
// 分镜相关类型 / Storyboard Types
// ============================================

/**
 * 分镜类型
 */
export interface Storyboard {
  id: string
  sceneId: string
  shotNumber: number
  shotType: 'long' | 'medium' | 'close' | 'extreme_close'
  cameraMovement?: string
  visual: string
  audio?: string
  duration?: number
}

// ============================================
// UI 相关类型 / UI Types
// ============================================

/**
 * 导航项类型
 */
export interface NavItem {
  id: string
  label: string
  href: string
  icon: string
}

// ============================================
// API 相关类型 / API Types
// ============================================

/**
 * API 错误类型
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * API 响应类型
 */
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

// ============================================
// 用户行为相关类型 / User Behavior Types
// ============================================

/**
 * 用户行为动作类型
 */
export type UserBehaviorAction = 'edit' | 'save' | 'ai_chat' | 'export' | 'create' | 'delete' | 'view'

/**
 * 用户行为记录类型
 */
export interface UserBehavior {
  id: string
  userId: string
  projectId: string
  action: UserBehaviorAction
  metadata?: Record<string, unknown> // 额外信息
  createdAt: Date
}

// ============================================
// TipTap 编辑器相关类型 / TipTap Types
// ============================================

/**
 * TipTap 节点类型
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TipTapNode extends Record<string, any> {
  type?: string
  text?: string
  content?: TipTapNode[]
}

// ============================================
// 创作里程碑相关类型 / Milestone Types
// ============================================

/**
 * 里程碑类型
 */
export type MilestoneType = 'first_scene' | 'first_episode' | 'completed'

/**
 * 创作里程碑类型
 */
export interface CreativeMilestone {
  id: string
  userId: string
  projectId: string
  type: MilestoneType
  achievedAt: Date
  aiContribution: number // AI 贡献度 0-100（%）
}
