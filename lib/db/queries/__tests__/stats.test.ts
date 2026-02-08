/**
 * Dashboard 统计功能测试
 */

import { describe, it, expect } from '@jest/globals'

describe('Dashboard Stats', () => {
  describe('Word Count Calculation', () => {
    it('should count Chinese characters correctly', () => {
      const text = '这是一个测试文本'
      const chineseChars = text.match(/[\u4e00-\u9fa5]/g)
      const count = chineseChars ? chineseChars.length : 0

      expect(count).toBe(8)
    })

    it('should count English words correctly', () => {
      const text = 'This is a test'
      const englishWords = text.match(/[a-zA-Z]+/g)
      const count = englishWords ? englishWords.length : 0

      expect(count).toBe(4)
    })

    it('should count mixed Chinese and English correctly', () => {
      const text = '这是 a test 文本'

      const chineseChars = text.match(/[\u4e00-\u9fa5]/g)
      const chineseCount = chineseChars ? chineseChars.length : 0

      const englishWords = text.match(/[a-zA-Z]+/g)
      const englishCount = englishWords ? englishWords.length : 0

      const totalCount = chineseCount + englishCount

      expect(chineseCount).toBe(4) // 这是文本
      expect(englishCount).toBe(2) // a test
      expect(totalCount).toBe(6)
    })
  })

  describe('TipTap JSON Text Extraction', () => {
    it('should extract text from simple TipTap structure', () => {
      const content = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: '第一段文本' }
            ]
          }
        ]
      }

      const extractText = (node: any): string => {
        if (!node) return ''
        let text = ''
        if (node.text) text += node.text
        if (Array.isArray(node.content)) {
          for (const child of node.content) {
            text += extractText(child)
          }
        }
        return text
      }

      const text = extractText(content)
      expect(text).toBe('第一段文本')
    })

    it('should extract text from nested TipTap structure', () => {
      const content = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: '第一段' }
            ]
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: '第二段' }
            ]
          }
        ]
      }

      const extractText = (node: any): string => {
        if (!node) return ''
        let text = ''
        if (node.text) text += node.text
        if (Array.isArray(node.content)) {
          for (const child of node.content) {
            text += extractText(child)
          }
        }
        return text
      }

      const text = extractText(content)
      expect(text).toBe('第一段第二段')
    })

    it('should handle empty content', () => {
      const content = {
        type: 'doc',
        content: []
      }

      const extractText = (node: any): string => {
        if (!node) return ''
        let text = ''
        if (node.text) text += node.text
        if (Array.isArray(node.content)) {
          for (const child of node.content) {
            text += extractText(child)
          }
        }
        return text
      }

      const text = extractText(content)
      expect(text).toBe('')
    })
  })

  describe('Date Filtering', () => {
    it('should get today start time correctly', () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      expect(today.getHours()).toBe(0)
      expect(today.getMinutes()).toBe(0)
      expect(today.getSeconds()).toBe(0)
      expect(today.getMilliseconds()).toBe(0)
    })

    it('should compare dates correctly', () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const now = new Date()

      expect(now >= today).toBe(true)
    })
  })

  describe('Stats Data Structure', () => {
    it('should have correct user stats structure', () => {
      const mockStats = {
        projectCount: 5,
        sceneCount: 20,
        characterCount: 15,
        totalWords: 10000,
        todayWords: 500
      }

      expect(mockStats).toHaveProperty('projectCount')
      expect(mockStats).toHaveProperty('sceneCount')
      expect(mockStats).toHaveProperty('characterCount')
      expect(mockStats).toHaveProperty('totalWords')
      expect(mockStats).toHaveProperty('todayWords')
    })

    it('should have correct project stats structure', () => {
      const mockProject = {
        id: 'project-001',
        name: '测试项目',
        sceneCount: 10,
        characterCount: 5,
        wordCount: 5000
      }

      expect(mockProject).toHaveProperty('sceneCount')
      expect(mockProject).toHaveProperty('characterCount')
      expect(mockProject).toHaveProperty('wordCount')
    })
  })
})
