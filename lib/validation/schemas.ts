/**
 * API 输入验证 Schema
 * 使用 Zod 进行类型安全的输入验证
 */

import { z } from 'zod'

// ============================================
// 项目相关 Schema
// ============================================

export const createProjectSchema = z.object({
  name: z.string().min(1, '项目名称不能为空').max(200, '项目名称不能超过 200 字符'),
  scriptType: z.enum(['movie', 'series', 'short-drama'], {
    errorMap: () => ({ message: '剧本类型必须是 movie、series 或 short-drama' }),
  }),
  orientation: z.enum(['landscape', 'portrait']).default('landscape'),
  targetEpisodes: z.number().int().min(1, '目标集数至少为 1').default(1),
  genre: z.array(z.string()).default([]),
})

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  scriptType: z.enum(['movie', 'series', 'short-drama']).optional(),
  orientation: z.enum(['landscape', 'portrait']).optional(),
  targetEpisodes: z.number().int().min(1).optional(),
  genre: z.array(z.string()).optional(),
  currentStage: z
    .enum(['worldview', 'characters', 'outline', 'scenes', 'script', 'storyboard'])
    .optional(),
})

// ============================================
// 角色相关 Schema
// ============================================

export const createCharacterSchema = z.object({
  projectId: z.string().uuid('无效的项目 ID'),
  name: z.string().min(1, '角色名称不能为空').max(100, '角色名称不能超过 100 字符'),
  role: z.enum(['protagonist', 'antagonist', 'supporting', 'minor'], {
    errorMap: () => ({ message: '角色类型无效' }),
  }),
  age: z.number().int().min(0).max(200).optional(),
  gender: z.enum(['male', 'female', 'other', 'unknown']).optional(),
  occupation: z.string().max(100).optional(),
  personality: z.string().max(1000).optional(),
  background: z.string().max(2000).optional(),
  goals: z.string().max(1000).optional(),
  conflicts: z.string().max(1000).optional(),
  arc: z.string().max(2000).optional(),
  appearance: z.string().max(1000).optional(),
  relationships: z.array(z.string()).default([]),
  baziData: z
    .object({
      year: z.number().int(),
      month: z.number().int().min(1).max(12),
      day: z.number().int().min(1).max(31),
      hour: z.number().int().min(0).max(23),
      isLunar: z.boolean().default(false),
    })
    .optional(),
})

export const updateCharacterSchema = createCharacterSchema.partial().omit({ projectId: true })

// ============================================
// 场景相关 Schema
// ============================================

export const createSceneSchema = z.object({
  projectId: z.string().uuid('无效的项目 ID'),
  episodeNumber: z.number().int().min(1, '集数至少为 1'),
  sceneNumber: z.number().int().min(1, '场次至少为 1'),
  title: z.string().min(1, '场景标题不能为空').max(200, '场景标题不能超过 200 字符'),
  location: z.string().max(200).optional(),
  timeOfDay: z.enum(['day', 'night', 'dawn', 'dusk', 'continuous']).optional(),
  setting: z.enum(['interior', 'exterior']).optional(),
  description: z.string().max(5000).optional(),
  characters: z.array(z.string()).default([]),
  props: z.array(z.string()).default([]),
  mood: z.string().max(100).optional(),
  purpose: z.string().max(500).optional(),
  conflict: z.string().max(500).optional(),
  outcome: z.string().max(500).optional(),
  duration: z.number().int().min(0).optional(),
  status: z.enum(['draft', 'in-progress', 'review', 'approved']).default('draft'),
})

export const updateSceneSchema = createSceneSchema.partial().omit({ projectId: true })

// ============================================
// 世界观相关 Schema
// ============================================

export const createWorldviewSchema = z.object({
  projectId: z.string().uuid('无效的项目 ID'),
  category: z.enum(
    [
      'era',
      'location',
      'society',
      'culture',
      'technology',
      'magic',
      'economy',
      'politics',
      'religion',
      'history',
      'other',
    ],
    {
      errorMap: () => ({ message: '世界观类别无效' }),
    }
  ),
  title: z.string().min(1, '标题不能为空').max(200, '标题不能超过 200 字符'),
  content: z.string().min(1, '内容不能为空').max(10000, '内容不能超过 10000 字符'),
  tags: z.array(z.string()).default([]),
  references: z.array(z.string()).default([]),
})

export const updateWorldviewSchema = createWorldviewSchema.partial().omit({ projectId: true })

// ============================================
// 分镜相关 Schema
// ============================================

export const createStoryboardSchema = z.object({
  sceneId: z.string().uuid('无效的场景 ID'),
  shotNumber: z.number().int().min(1, '镜头编号至少为 1'),
  shotType: z.enum([
    'extreme-close-up',
    'close-up',
    'medium-close-up',
    'medium-shot',
    'medium-long-shot',
    'long-shot',
    'extreme-long-shot',
    'over-the-shoulder',
    'point-of-view',
    'two-shot',
  ]),
  cameraMovement: z
    .enum(['static', 'pan', 'tilt', 'zoom', 'dolly', 'tracking', 'crane', 'handheld'])
    .optional(),
  cameraAngle: z.enum(['eye-level', 'high-angle', 'low-angle', 'birds-eye', 'dutch-angle']).optional(),
  description: z.string().max(1000).optional(),
  dialogue: z.string().max(2000).optional(),
  duration: z.number().int().min(0).optional(),
  notes: z.string().max(1000).optional(),
})

export const updateStoryboardSchema = createStoryboardSchema.partial().omit({ sceneId: true })

// ============================================
// AI 相关 Schema
// ============================================

export const aiChatSchema = z.object({
  message: z.string().min(1, '消息不能为空').max(5000, '消息不能超过 5000 字符'),
  projectId: z.string().uuid('无效的项目 ID').optional(),
  context: z
    .object({
      type: z.enum(['character', 'scene', 'worldview', 'general']),
      entityId: z.string().uuid().optional(),
    })
    .optional(),
})

export const aiSkillExecuteSchema = z.object({
  skillName: z.string().min(1, 'Skill 名称不能为空'),
  projectId: z.string().uuid('无效的项目 ID'),
  input: z.record(z.any()),
})

// ============================================
// 导出相关 Schema
// ============================================

export const exportRequestSchema = z.object({
  projectId: z.string().uuid('无效的项目 ID'),
  format: z.enum(['pdf', 'word', 'text', 'fountain'], {
    errorMap: () => ({ message: '导出格式无效' }),
  }),
  options: z
    .object({
      includeTitlePage: z.boolean().default(true),
      includeSceneNumbers: z.boolean().default(true),
      pageSize: z.enum(['A4', 'US-Letter']).default('A4'),
    })
    .optional(),
})

// ============================================
// 认证相关 Schema
// ============================================

export const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少 6 个字符'),
})

export const registerSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少 6 个字符').max(100, '密码不能超过 100 字符'),
  name: z.string().min(1, '姓名不能为空').max(100, '姓名不能超过 100 字符'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token 不能为空'),
  password: z.string().min(6, '密码至少 6 个字符').max(100, '密码不能超过 100 字符'),
})

// ============================================
// 类型导出
// ============================================

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type CreateCharacterInput = z.infer<typeof createCharacterSchema>
export type UpdateCharacterInput = z.infer<typeof updateCharacterSchema>
export type CreateSceneInput = z.infer<typeof createSceneSchema>
export type UpdateSceneInput = z.infer<typeof updateSceneSchema>
export type CreateWorldviewInput = z.infer<typeof createWorldviewSchema>
export type UpdateWorldviewInput = z.infer<typeof updateWorldviewSchema>
export type CreateStoryboardInput = z.infer<typeof createStoryboardSchema>
export type UpdateStoryboardInput = z.infer<typeof updateStoryboardSchema>
export type AIChatInput = z.infer<typeof aiChatSchema>
export type AISkillExecuteInput = z.infer<typeof aiSkillExecuteSchema>
export type ExportRequestInput = z.infer<typeof exportRequestSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
