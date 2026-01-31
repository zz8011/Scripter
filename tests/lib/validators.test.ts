import { describe, it, expect } from 'vitest'
import {
  validateEmail,
  validateUUID,
  validateProjectName,
  validateScriptType,
  validateOrientation,
  validateEpisodes,
  validateSceneNumber,
  validateDuration,
  validateShotType,
  validateAngle,
  validateMovement,
  sanitizeString,
  validateJSON,
} from '@/lib/validators'

describe('validateEmail', () => {
  it('应该验证有效的邮箱', () => {
    expect(validateEmail('test@example.com')).toBe(true)
    expect(validateEmail('user.name@domain.co.uk')).toBe(true)
    expect(validateEmail('user+tag@example.com')).toBe(true)
  })

  it('应该拒绝无效的邮箱', () => {
    expect(validateEmail('')).toBe(false)
    expect(validateEmail('invalid')).toBe(false)
    expect(validateEmail('@example.com')).toBe(false)
    expect(validateEmail('test@')).toBe(false)
    expect(validateEmail('test@.com')).toBe(false)
    expect(validateEmail('test example.com')).toBe(false)
  })
})

describe('validateUUID', () => {
  it('应该验证有效的 UUID', () => {
    expect(validateUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
    expect(validateUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true)
  })

  it('应该拒绝无效的 UUID', () => {
    expect(validateUUID('')).toBe(false)
    expect(validateUUID('not-a-uuid')).toBe(false)
    expect(validateUUID('550e8400-e29b-61d4-a716-446655440000')).toBe(false) // 版本 6 无效 (应为 1-5)
    expect(validateUUID('550e8400-e29b-41d4-c716-446655440000')).toBe(false) // 变体错误 (应为 89ab)
    expect(validateUUID('550e8400e29b41d4a716446655440000')).toBe(false) // 缺少连字符
    expect(validateUUID('550e8400-e29b-41d4-a716-44665544')).toBe(false) // 长度不足
  })
})

describe('validateProjectName', () => {
  it('应该验证有效的项目名称', () => {
    const result = validateProjectName('My Project')
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('应该拒绝空项目名称', () => {
    const result = validateProjectName('')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Project name is required')
  })

  it('应该拒绝仅包含空格的项目名称', () => {
    const result = validateProjectName('   ')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Project name is required')
  })

  it('应该拒绝过长的项目名称', () => {
    const longName = 'a'.repeat(101)
    const result = validateProjectName(longName)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Project name must be less than 100 characters')
  })

  it('应该接受恰好 100 个字符的项目名称', () => {
    const name = 'a'.repeat(100)
    const result = validateProjectName(name)
    expect(result.valid).toBe(true)
  })
})

describe('validateScriptType', () => {
  it('应该验证有效的剧本类型', () => {
    expect(validateScriptType('movie')).toBe(true)
    expect(validateScriptType('series')).toBe(true)
    expect(validateScriptType('short-drama')).toBe(true)
  })

  it('应该拒绝无效的剧本类型', () => {
    expect(validateScriptType('')).toBe(false)
    expect(validateScriptType('invalid')).toBe(false)
    expect(validateScriptType('MOVIE')).toBe(false) // 大小写敏感
    expect(validateScriptType('tv')).toBe(false)
  })
})

describe('validateOrientation', () => {
  it('应该验证有效的方向', () => {
    expect(validateOrientation('landscape')).toBe(true)
    expect(validateOrientation('portrait')).toBe(true)
  })

  it('应该拒绝无效的方向', () => {
    expect(validateOrientation('')).toBe(false)
    expect(validateOrientation('square')).toBe(false)
    expect(validateOrientation('LANDSCAPE')).toBe(false) // 大小写敏感
  })
})

describe('validateEpisodes', () => {
  it('应该验证有效的集数', () => {
    const result = validateEpisodes(10)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('应该验证边界值', () => {
    expect(validateEpisodes(1).valid).toBe(true)
    expect(validateEpisodes(500).valid).toBe(true)
  })

  it('应该拒绝零集数', () => {
    const result = validateEpisodes(0)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Episode count must be a positive integer')
  })

  it('应该拒绝负数集数', () => {
    const result = validateEpisodes(-5)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Episode count must be a positive integer')
  })

  it('应该拒绝小数集数', () => {
    const result = validateEpisodes(10.5)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Episode count must be a positive integer')
  })

  it('应该拒绝超过 500 集的剧本', () => {
    const result = validateEpisodes(501)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Episode count cannot exceed 500')
  })
})

describe('validateSceneNumber', () => {
  it('应该验证有效的场景编号', () => {
    expect(validateSceneNumber(1)).toBe(true)
    expect(validateSceneNumber(100)).toBe(true)
  })

  it('应该拒绝无效的场景编号', () => {
    expect(validateSceneNumber(0)).toBe(false)
    expect(validateSceneNumber(-1)).toBe(false)
    expect(validateSceneNumber(1.5)).toBe(false)
  })
})

describe('validateDuration', () => {
  it('应该验证有效的时长', () => {
    expect(validateDuration(0)).toBe(true)
    expect(validateDuration(60)).toBe(true)
    expect(validateDuration(3600)).toBe(true)
  })

  it('应该拒绝负时长', () => {
    expect(validateDuration(-1)).toBe(false)
  })

  it('应该拒绝小数时长', () => {
    expect(validateDuration(60.5)).toBe(false)
  })
})

describe('validateShotType', () => {
  it('应该验证有效的分镜类型', () => {
    expect(validateShotType('远景')).toBe(true)
    expect(validateShotType('中景')).toBe(true)
    expect(validateShotType('特写')).toBe(true)
    expect(validateShotType('全景')).toBe(true)
    expect(validateShotType('近景')).toBe(true)
    expect(validateShotType('大特写')).toBe(true)
  })

  it('应该拒绝无效的分镜类型', () => {
    expect(validateShotType('')).toBe(false)
    expect(validateShotType('invalid')).toBe(false)
    expect(validateShotType('远景 ')).toBe(false) // 包含空格
  })
})

describe('validateAngle', () => {
  it('应该验证有效的拍摄角度', () => {
    expect(validateAngle('平视')).toBe(true)
    expect(validateAngle('仰视')).toBe(true)
    expect(validateAngle('俯视')).toBe(true)
    expect(validateAngle('鸟瞰')).toBe(true)
    expect(validateAngle('虫视')).toBe(true)
  })

  it('应该拒绝无效的拍摄角度', () => {
    expect(validateAngle('')).toBe(false)
    expect(validateAngle('侧视')).toBe(false)
  })
})

describe('validateMovement', () => {
  it('应该验证有效的运镜方式', () => {
    expect(validateMovement('推')).toBe(true)
    expect(validateMovement('拉')).toBe(true)
    expect(validateMovement('摇')).toBe(true)
    expect(validateMovement('移')).toBe(true)
    expect(validateMovement('跟')).toBe(true)
    expect(validateMovement('升降')).toBe(true)
    expect(validateMovement('旋转')).toBe(true)
    expect(validateMovement('静止')).toBe(true)
  })

  it('应该拒绝无效的运镜方式', () => {
    expect(validateMovement('')).toBe(false)
    expect(validateMovement('zoom')).toBe(false)
  })
})

describe('sanitizeString', () => {
  it('应该去除首尾空格', () => {
    expect(sanitizeString('  hello  ')).toBe('hello')
  })

  it('应该截断过长的字符串', () => {
    const longString = 'a'.repeat(2000)
    const result = sanitizeString(longString)
    expect(result).toHaveLength(1000)
  })

  it('应该使用自定义最大长度', () => {
    const result = sanitizeString('hello world', 5)
    expect(result).toBe('hello')
  })

  it('应该处理空字符串', () => {
    expect(sanitizeString('')).toBe('')
  })
})

describe('validateJSON', () => {
  it('应该验证有效的 JSON', () => {
    expect(validateJSON('{}')).toBe(true)
    expect(validateJSON('[]')).toBe(true)
    expect(validateJSON('{"key": "value"}')).toBe(true)
    expect(validateJSON('[1, 2, 3]')).toBe(true)
    expect(validateJSON('"string"')).toBe(true)
    expect(validateJSON('123')).toBe(true)
    expect(validateJSON('true')).toBe(true)
    expect(validateJSON('null')).toBe(true)
  })

  it('应该拒绝无效的 JSON', () => {
    expect(validateJSON('')).toBe(false)
    expect(validateJSON('{')).toBe(false)
    expect(validateJSON('invalid')).toBe(false)
    expect(validateJSON('{key: value}')).toBe(false) // 缺少引号
    expect(validateJSON("{'key': 'value'}")).toBe(false) // 单引号
  })
})
