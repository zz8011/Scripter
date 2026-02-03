/**
 * 八字系统模块入口
 * 
 * @module lib/bazi
 */

// 从 calculator 导出（排除 BaziInfo 避免冲突）
export { 
  calculateBazi,
} from './calculator'
export type { 
  ElementType,
  Pillar,
  ElementCount,
  LunarDate,
  Stem,
  Branch,
  BaziInfo as CalculatorBaziInfo,
} from './calculator'

// 从 personality 导出
export { generatePersonality } from './personality'
export type { 
  BaziInfo as PersonalityBaziInfo,
  CoreTraits,
  SpeechStyle,
  CollaborationStyle,
  JulingPersonality,
} from './personality'

// 从 shiho 导出
export { generateShiho, generateShihoOptions, generateShihoFromBazi } from './shiho'

// 从 types 导出
export type * from './types'
