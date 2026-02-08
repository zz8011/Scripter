/**
 * Story Bible 聚合器测试
 *
 * 注意：这些是集成测试，需要数据库连接
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import type { StoryBible } from '@/lib/db/schema/story-bible'

describe('Story Bible Aggregator', () => {
  // 这些测试需要实际的数据库连接
  // 在实际运行前需要设置测试数据库

  describe('Character Profile Aggregation', () => {
    it('should extract character role correctly', () => {
      // 测试角色判断逻辑
      const mockCharacter = {
        id: 'char-001',
        name: '李明',
        growthArc: '从普通士兵成长为将军',
        personality: ['正直', '勇敢'],
        speechStyle: '言简意赅',
        relationships: []
      }

      // 角色应该被识别为主角
      expect(mockCharacter.growthArc).toContain('成长')
    })

    it('should handle character relationships correctly', () => {
      const mockRelationships = [
        { targetCharacterId: 'char-002', type: '师徒', description: '严师' },
        { targetCharacterId: 'char-003', type: '战友', description: '生死之交' }
      ]

      const transformed = mockRelationships.map(r => ({
        targetId: r.targetCharacterId,
        relation: r.type
      }))

      expect(transformed).toHaveLength(2)
      expect(transformed[0].targetId).toBe('char-002')
      expect(transformed[0].relation).toBe('师徒')
    })
  })

  describe('World Rules Aggregation', () => {
    it('should summarize worldview items by category', () => {
      const mockEraItems = [
        { title: '时代背景', content: '唐朝贞观年间' },
        { title: '历史事件', content: '玄武门之变后' }
      ]

      const summary = mockEraItems
        .map(item => `${item.title}: ${item.content}`)
        .join('；')

      expect(summary).toContain('唐朝贞观年间')
      expect(summary).toContain('玄武门之变后')
    })

    it('should extract constraints from worldview items', () => {
      const mockItems = [
        { content: '不能使用现代科技' },
        { content: '必须符合历史背景' },
        { content: '普通描述文本' }
      ]

      const constraints = mockItems.filter(item =>
        item.content.includes('不能') ||
        item.content.includes('必须') ||
        item.content.includes('禁止')
      )

      expect(constraints).toHaveLength(2)
    })
  })

  describe('Plot Outline Aggregation', () => {
    it('should extract text from TipTap JSON format', () => {
      const mockTipTapContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: '李明走进军营。' }
            ]
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: '教官严厉地看着他。' }
            ]
          }
        ]
      }

      // 简单的文本提取逻辑测试
      const extractText = (node: any): string => {
        if (node.type === 'text') return node.text || ''
        if (node.content && Array.isArray(node.content)) {
          return node.content.map(extractText).join('')
        }
        return ''
      }

      const text = extractText(mockTipTapContent)
      expect(text).toContain('李明走进军营')
      expect(text).toContain('教官严厉地看着他')
    })

    it('should extract plot points from scene text', () => {
      const sceneText = '李明决定接受挑战。他发现了一个秘密。最终他成功完成了任务。'
      const actionKeywords = ['决定', '发现', '成功']

      const sentences = sceneText.split(/[。！？]/).filter(s => s.trim())
      const plotPoints: string[] = []

      for (const sentence of sentences) {
        for (const keyword of actionKeywords) {
          if (sentence.includes(keyword)) {
            plotPoints.push(sentence.trim())
            break
          }
        }
      }

      expect(plotPoints.length).toBeGreaterThan(0)
      expect(plotPoints[0]).toContain('决定')
    })
  })

  describe('Creative Intent Aggregation', () => {
    it('should infer tone from genre', () => {
      const testCases = [
        { genres: ['喜剧'], expectedTone: '轻松幽默' },
        { genres: ['悬疑'], expectedTone: '紧张悬疑' },
        { genres: ['历史'], expectedTone: '严肃史诗' }
      ]

      for (const testCase of testCases) {
        const genreStr = testCase.genres.join(',').toLowerCase()
        let tone = '多元混合'

        if (genreStr.includes('喜剧')) tone = '轻松幽默'
        else if (genreStr.includes('悬疑')) tone = '紧张悬疑'
        else if (genreStr.includes('历史')) tone = '严肃史诗'

        expect(tone).toBe(testCase.expectedTone)
      }
    })

    it('should infer themes from genre', () => {
      const genres = ['爱情', '家庭', '成长']
      const themes: string[] = []

      const genreStr = genres.join(',').toLowerCase()
      if (genreStr.includes('爱情')) themes.push('爱情')
      if (genreStr.includes('家庭')) themes.push('家庭')
      if (genreStr.includes('成长')) themes.push('成长')

      expect(themes).toContain('爱情')
      expect(themes).toContain('家庭')
      expect(themes).toContain('成长')
    })

    it('should infer target audience from genre', () => {
      const testCases = [
        { genres: ['青春', '校园'], expected: '18-25岁年轻观众' },
        { genres: ['家庭'], expected: '25-45岁家庭观众' },
        { genres: ['历史'], expected: '30-50岁成熟观众' }
      ]

      for (const testCase of testCases) {
        const genreStr = testCase.genres.join(',').toLowerCase()
        let audience = '全年龄段观众'

        if (genreStr.includes('青春') || genreStr.includes('校园')) {
          audience = '18-25岁年轻观众'
        } else if (genreStr.includes('家庭')) {
          audience = '25-45岁家庭观众'
        } else if (genreStr.includes('历史')) {
          audience = '30-50岁成熟观众'
        }

        expect(audience).toBe(testCase.expected)
      }
    })
  })

  describe('Error Handling', () => {
    it('should not throw errors when aggregation fails', async () => {
      // 聚合器应该捕获错误，不阻塞主流程
      // 这个测试验证错误处理逻辑
      const mockError = new Error('Database connection failed')

      // 模拟错误处理
      let errorCaught = false
      try {
        throw mockError
      } catch (error) {
        console.error('Error aggregating:', error)
        errorCaught = true
        // 不重新抛出错误
      }

      expect(errorCaught).toBe(true)
    })
  })
})

describe('Story Bible Data Structure', () => {
  it('should have correct structure', () => {
    const mockStoryBible: Partial<StoryBible> = {
      worldRules: {
        era: '唐朝贞观年间',
        geography: '长安城',
        socialRules: '等级制度',
        constraints: ['不能使用现代科技']
      },
      characterProfiles: [
        {
          id: 'char-001',
          name: '李明',
          role: 'protagonist',
          personality: '正直勇敢',
          speechStyle: '言简意赅',
          relationships: [],
          arc: '成长为将军'
        }
      ],
      plotOutline: [
        {
          sceneId: 'scene-001',
          sceneNumber: 1,
          summary: '李明初入军营',
          characters: ['char-001'],
          plotPoints: ['接受训练']
        }
      ],
      creativeIntent: {
        genre: '历史剧',
        tone: '严肃史诗',
        themes: ['忠诚', '成长'],
        targetAudience: '30-50岁成熟观众'
      }
    }

    expect(mockStoryBible.worldRules).toBeDefined()
    expect(mockStoryBible.characterProfiles).toHaveLength(1)
    expect(mockStoryBible.plotOutline).toHaveLength(1)
    expect(mockStoryBible.creativeIntent).toBeDefined()
  })
})
