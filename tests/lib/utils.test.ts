import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  cn,
  generateRandomString,
  delay,
  retry,
  paginate,
  formatDate,
  formatBytes,
  formatNumber,
  truncateText,
  deepClone,
  safeJSONParse,
  debounce,
  throttle,
} from '@/lib/utils'

describe('cn', () => {
  it('应该合并多个 className', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
  })

  it('应该处理条件 className', () => {
    expect(cn('base', true && 'active', false && 'inactive')).toBe('base active')
  })

  it('应该处理对象形式的 className', () => {
    expect(cn({ active: true, disabled: false })).toBe('active')
  })

  it('应该合并 tailwind 冲突的类', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('应该处理数组形式的 className', () => {
    expect(cn(['class1', 'class2'])).toBe('class1 class2')
  })
})

describe('generateRandomString', () => {
  it('应该生成指定长度的随机字符串', () => {
    const str = generateRandomString(10)
    expect(str).toHaveLength(10)
    expect(str).toMatch(/^[A-Za-z0-9]+$/)
  })

  it('默认长度应为 16', () => {
    const str = generateRandomString()
    expect(str).toHaveLength(16)
  })

  it('生成的字符串应该是随机的', () => {
    const str1 = generateRandomString(16)
    const str2 = generateRandomString(16)
    expect(str1).not.toBe(str2)
  })
})

describe('delay', () => {
  it('应该在指定时间后 resolve', async () => {
    const start = Date.now()
    await delay(100)
    const elapsed = Date.now() - start
    expect(elapsed).toBeGreaterThanOrEqual(90)
  })
})

describe('retry', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('应该在成功时立即返回结果', async () => {
    const fn = vi.fn().mockResolvedValue('success')
    const result = await retry(fn)
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('应该在失败后重试', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValue('success')

    const promise = retry(fn, { maxAttempts: 3, delayMs: 1000 })
    
    // 等待所有延迟
    await vi.runAllTimersAsync()
    const result = await promise
    
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('应该在达到最大重试次数后抛出错误', async () => {
    let callCount = 0
    const fn = vi.fn(() => {
      callCount++
      throw new Error(`fail ${callCount}`)
    })
    
    const promise = retry(fn, { maxAttempts: 3, delayMs: 100 })
    
    // 等待所有延迟
    await vi.runAllTimersAsync()
    
    await expect(promise).rejects.toThrow('fail 3')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('应该使用指数退避', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValue('success')

    const setTimeoutSpy = vi.spyOn(global, 'setTimeout')
    
    const promise = retry(fn, { maxAttempts: 3, delayMs: 1000, backoff: true })
    await vi.runAllTimersAsync()
    await promise

    // 第一次重试等待 1000ms，第二次等待 2000ms
    expect(setTimeoutSpy).toHaveBeenCalledTimes(2)
  })
})

describe('paginate', () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  it('应该正确分页数据', () => {
    const result = paginate(items, { page: 1, limit: 3 })
    expect(result.data).toEqual([1, 2, 3])
    expect(result.pagination.page).toBe(1)
    expect(result.pagination.limit).toBe(3)
    expect(result.pagination.total).toBe(10)
    expect(result.pagination.totalPages).toBe(4)
    expect(result.pagination.hasNext).toBe(true)
    expect(result.pagination.hasPrev).toBe(false)
  })

  it('应该处理第二页', () => {
    const result = paginate(items, { page: 2, limit: 3 })
    expect(result.data).toEqual([4, 5, 6])
    expect(result.pagination.hasNext).toBe(true)
    expect(result.pagination.hasPrev).toBe(true)
  })

  it('应该处理最后一页', () => {
    const result = paginate(items, { page: 4, limit: 3 })
    expect(result.data).toEqual([10])
    expect(result.pagination.hasNext).toBe(false)
    expect(result.pagination.hasPrev).toBe(true)
  })

  it('应该使用传入的 total 参数', () => {
    const result = paginate(items.slice(0, 3), { page: 1, limit: 3 }, 100)
    expect(result.pagination.total).toBe(100)
    expect(result.pagination.totalPages).toBe(34)
  })
})

describe('formatDate', () => {
  it('应该格式化短日期', () => {
    const date = new Date('2024-01-15')
    expect(formatDate(date, 'short')).toMatch(/2024.*01.*15/)
  })

  it('应该格式化中等长度日期', () => {
    const date = new Date('2024-01-15')
    expect(formatDate(date, 'medium')).toContain('2024')
    expect(formatDate(date, 'medium')).toContain('15')
  })

  it('应该格式化长日期', () => {
    const date = new Date('2024-01-15T10:30:00')
    const result = formatDate(date, 'long')
    expect(result).toContain('2024')
    expect(result).toContain('15')
  })
})

describe('formatBytes', () => {
  it('应该格式化 0 字节', () => {
    expect(formatBytes(0)).toBe('0 Bytes')
  })

  it('应该格式化字节', () => {
    expect(formatBytes(512)).toBe('512 Bytes')
  })

  it('应该格式化 KB', () => {
    expect(formatBytes(1024)).toBe('1 KB')
  })

  it('应该格式化 MB', () => {
    expect(formatBytes(1024 * 1024)).toBe('1 MB')
  })

  it('应该格式化 GB', () => {
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB')
  })

  it('应该支持自定义小数位', () => {
    expect(formatBytes(1536, 0)).toBe('2 KB')
    expect(formatBytes(1536, 2)).toBe('1.5 KB')
  })
})

describe('formatNumber', () => {
  it('应该格式化数字', () => {
    expect(formatNumber(1000)).toBe('1,000')
    expect(formatNumber(1000000)).toBe('1,000,000')
  })
})

describe('truncateText', () => {
  it('不应该截断短文本', () => {
    expect(truncateText('hello', 10)).toBe('hello')
  })

  it('应该截断长文本', () => {
    expect(truncateText('hello world', 8)).toBe('hello...')
  })

  it('应该使用自定义后缀', () => {
    expect(truncateText('hello world', 8, '>>')).toBe('hello >>')
  })
})

describe('deepClone', () => {
  it('应该深克隆对象', () => {
    const obj = { a: 1, b: { c: 2 } }
    const cloned = deepClone(obj)
    expect(cloned).toEqual(obj)
    expect(cloned).not.toBe(obj)
    expect(cloned.b).not.toBe(obj.b)
  })

  it('应该深克隆数组', () => {
    const arr = [1, 2, { a: 3 }]
    const cloned = deepClone(arr)
    expect(cloned).toEqual(arr)
    expect(cloned).not.toBe(arr)
  })
})

describe('safeJSONParse', () => {
  it('应该解析有效的 JSON', () => {
    expect(safeJSONParse('{"a":1}', {})).toEqual({ a: 1 })
  })

  it('应该在解析失败时返回默认值', () => {
    expect(safeJSONParse('invalid', { default: true })).toEqual({ default: true })
  })

  it('应该解析数组 JSON', () => {
    expect(safeJSONParse('[1,2,3]', [])).toEqual([1, 2, 3])
  })
})

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('应该延迟函数执行', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100)

    debouncedFn()
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('应该取消之前的调用', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100)

    debouncedFn()
    debouncedFn()
    debouncedFn()

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('应该传递参数', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100)

    debouncedFn('arg1', 'arg2')
    vi.advanceTimersByTime(100)

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
  })
})

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('应该立即执行第一次调用', () => {
    const fn = vi.fn()
    const throttledFn = throttle(fn, 100)

    throttledFn()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('应该在限制时间内只执行一次', () => {
    const fn = vi.fn()
    const throttledFn = throttle(fn, 100)

    throttledFn()
    throttledFn()
    throttledFn()
    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(100)
    throttledFn()
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('应该传递参数', () => {
    const fn = vi.fn()
    const throttledFn = throttle(fn, 100)

    throttledFn('arg1', 'arg2')
    expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
  })
})
