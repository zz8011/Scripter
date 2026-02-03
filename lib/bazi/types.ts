/**
 * 八字系统类型定义
 * 
 * @module lib/bazi/types
 */

import { ElementType, Pillar, BaziInfo as CalculatorBaziInfo } from './calculator'
import { 
  BaziInfo as PersonalityBaziInfo, 
  JulingPersonality,
  CoreTraits,
  SpeechStyle,
  CollaborationStyle
} from './personality'

// 重新导出 calculator 的类型
export type { ElementType, Pillar }
export type { CalculatorBaziInfo as BaziInfo }

// 重新导出 personality 的类型
export type { 
  PersonalityBaziInfo,
  JulingPersonality as PersonalityProfile,
  CoreTraits,
  SpeechStyle,
  CollaborationStyle
}

/**
 * 诗号结果
 */
export interface ShihoResult {
  /** 诗号文本 (7-10字) */
  shiho: string
  /** 诗号释义 */
  meaning: string
  /** 创作说明/出处 */
  source: string
  /** 五行属性 */
  element: ElementType
}

/**
 * 完整八字分析结果
 */
export interface BaziAnalysis {
  /** 八字信息 */
  bazi: CalculatorBaziInfo
  /** 性格画像 */
  personality: JulingPersonality
  /** 诗号 */
  shiho: ShihoResult
  /** 分析摘要 */
  summary: string
}

/**
 * 八字配置输入
 */
export interface BaziConfigInput {
  /** 出生年 */
  year: number
  /** 出生月 (1-12) */
  month: number
  /** 出生日 */
  day: number
  /** 出生时 (0-23) */
  hour: number
}

/**
 * 八字配置（数据库结构）
 */
export interface BaziConfig {
  id: string
  userId: string
  birthYear: number
  birthMonth: number
  birthDay: number
  birthHour: number
  /** 八字字符串 */
  bazi: string
  /** 五行属性 */
  wuxing: string
  /** 诗号 */
  shiho: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * 八字计算请求
 */
export interface CalculateBaziRequest {
  year: number
  month: number
  day: number
  hour: number
}

/**
 * 八字计算响应
 */
export interface CalculateBaziResponse {
  success: boolean
  data?: BaziAnalysis
  error?: string
}
