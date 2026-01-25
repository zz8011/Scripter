/**
 * 通用验证器
 */

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * 验证邮箱格式
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证 UUID 格式
 */
export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * 验证项目名称
 */
export function validateProjectName(name: string): ValidationResult {
  const errors: string[] = []

  if (!name || name.trim().length === 0) {
    errors.push('Project name is required')
  } else if (name.length > 100) {
    errors.push('Project name must be less than 100 characters')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * 验证剧本类型
 */
export function validateScriptType(type: string): boolean {
  const validTypes = ['movie', 'series', 'short-drama']
  return validTypes.includes(type)
}

/**
 * 验证方向
 */
export function validateOrientation(orientation: string): boolean {
  const validOrientations = ['landscape', 'portrait']
  return validOrientations.includes(orientation)
}

/**
 * 验证集数
 */
export function validateEpisodes(count: number): ValidationResult {
  const errors: string[] = []

  if (!Number.isInteger(count) || count < 1) {
    errors.push('Episode count must be a positive integer')
  } else if (count > 500) {
    errors.push('Episode count cannot exceed 500')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * 验证场景编号
 */
export function validateSceneNumber(number: number): boolean {
  return Number.isInteger(number) && number > 0
}

/**
 * 验证时长（秒）
 */
export function validateDuration(duration: number): boolean {
  return Number.isInteger(duration) && duration >= 0
}

/**
 * 验证分镜类型
 */
export function validateShotType(type: string): boolean {
  const validTypes = ['远景', '中景', '特写', '全景', '近景', '大特写']
  return validTypes.includes(type)
}

/**
 * 验证拍摄角度
 */
export function validateAngle(angle: string): boolean {
  const validAngles = ['平视', '仰视', '俯视', '鸟瞰', '虫视']
  return validAngles.includes(angle)
}

/**
 * 验证运镜方式
 */
export function validateMovement(movement: string): boolean {
  const validMovements = ['推', '拉', '摇', '移', '跟', '升降', '旋转', '静止']
  return validMovements.includes(movement)
}

/**
 * 清理和验证字符串输入
 */
export function sanitizeString(input: string, maxLength = 1000): string {
  return input.trim().slice(0, maxLength)
}

/**
 * 验证 JSON 数据
 */
export function validateJSON(input: string): boolean {
  try {
    JSON.parse(input)
    return true
  } catch {
    return false
  }
}
