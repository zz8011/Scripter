/**
 * Skill 接口扩展测试
 * 验证 requiredContext 和其他新字段
 */

import { describe, it, expect } from 'vitest'
import { DialoguePolishSkill } from '../DialoguePolishSkill'
import { FormatFixSkill } from '../FormatFixSkill'
import { SceneExpandSkill } from '../SceneExpandSkill'
import type { Skill, ContextRequirement } from '../../core/types'

describe('Skill 接口扩展', () => {
  describe('DialoguePolishSkill', () => {
    const skill = new DialoguePolishSkill()

    it('应该有 requiredContext 字段', () => {
      expect(skill.requiredContext).toBeDefined()
      expect(Array.isArray(skill.requiredContext)).toBe(true)
    })

    it('requiredContext 应该包含 currentScene 和 characterProfile', () => {
      const contextTypes = skill.requiredContext!.map(c => c.type)
      expect(contextTypes).toContain('currentScene')
      expect(contextTypes).toContain('characterProfile')
    })

    it('应该有 inputSchema 字段', () => {
      expect(skill.inputSchema).toBeDefined()
      expect(skill.inputSchema!.dialogue).toBeDefined()
      expect(skill.inputSchema!.characterName).toBeDefined()
    })

    it('应该有 outputSchema 字段', () => {
      expect(skill.outputSchema).toBeDefined()
      expect(skill.outputSchema!.original).toBeDefined()
      expect(skill.outputSchema!.polished).toBeDefined()
    })

    it('应该有 estimatedTokens 函数', () => {
      expect(skill.estimatedTokens).toBeDefined()
      expect(typeof skill.estimatedTokens).toBe('function')
    })

    it('estimatedTokens 应该能正确计算', () => {
      const input = {
        dialogue: '这是一段测试对白',
        characterName: '李明'
      }
      const tokens = (skill.estimatedTokens as Function)(input)
      expect(tokens).toBeGreaterThan(0)
      expect(typeof tokens).toBe('number')
    })
  })

  describe('FormatFixSkill', () => {
    const skill = new FormatFixSkill()

    it('应该有 requiredContext 字段', () => {
      expect(skill.requiredContext).toBeDefined()
      expect(Array.isArray(skill.requiredContext)).toBe(true)
    })

    it('requiredContext 应该只包含 selectedText', () => {
      const contextTypes = skill.requiredContext!.map(c => c.type)
      expect(contextTypes).toContain('selectedText')
      expect(contextTypes.length).toBe(1)
    })

    it('应该有 inputSchema 字段', () => {
      expect(skill.inputSchema).toBeDefined()
      expect(skill.inputSchema!.content).toBeDefined()
    })

    it('应该有 outputSchema 字段', () => {
      expect(skill.outputSchema).toBeDefined()
      expect(skill.outputSchema!.fixed).toBeDefined()
      expect(skill.outputSchema!.content).toBeDefined()
    })

    it('estimatedTokens 应该能正确计算', () => {
      const input = {
        content: '场景1 咖啡厅\n李明：你好'
      }
      const tokens = (skill.estimatedTokens as Function)(input)
      expect(tokens).toBeGreaterThan(0)
    })
  })

  describe('SceneExpandSkill', () => {
    const skill = new SceneExpandSkill()

    it('应该有 requiredContext 字段', () => {
      expect(skill.requiredContext).toBeDefined()
      expect(Array.isArray(skill.requiredContext)).toBe(true)
    })

    it('requiredContext 应该包含 currentScene, plotOutline, worldRules', () => {
      const contextTypes = skill.requiredContext!.map(c => c.type)
      expect(contextTypes).toContain('currentScene')
      expect(contextTypes).toContain('plotOutline')
      expect(contextTypes).toContain('worldRules')
    })

    it('应该有 inputSchema 字段', () => {
      expect(skill.inputSchema).toBeDefined()
      expect(skill.inputSchema!.sceneContent).toBeDefined()
    })

    it('应该有 outputSchema 字段', () => {
      expect(skill.outputSchema).toBeDefined()
      expect(skill.outputSchema!.original).toBeDefined()
      expect(skill.outputSchema!.expanded).toBeDefined()
    })

    it('estimatedTokens 应该根据 targetLength 调整', () => {
      const inputShort = {
        sceneContent: '李明走进咖啡厅。',
        targetLength: 'short'
      }
      const inputLong = {
        sceneContent: '李明走进咖啡厅。',
        targetLength: 'long'
      }
      const tokensShort = (skill.estimatedTokens as Function)(inputShort)
      const tokensLong = (skill.estimatedTokens as Function)(inputLong)
      expect(tokensLong).toBeGreaterThan(tokensShort)
    })
  })

  describe('向后兼容性', () => {
    it('所有 Skill 应该仍然实现基础接口', () => {
      const skills: Skill[] = [
        new DialoguePolishSkill(),
        new FormatFixSkill(),
        new SceneExpandSkill()
      ]

      skills.forEach(skill => {
        expect(skill.id).toBeDefined()
        expect(skill.name).toBeDefined()
        expect(skill.description).toBeDefined()
        expect(skill.category).toBeDefined()
        expect(skill.metadata).toBeDefined()
        expect(typeof skill.execute).toBe('function')
      })
    })

    it('新字段应该是可选的', () => {
      // 创建一个最小化的 Skill 实现
      const minimalSkill: Skill = {
        id: 'test',
        name: 'Test Skill',
        description: 'Test',
        category: 'test',
        metadata: {
          version: '1.0.0',
          author: 'test',
          tags: [],
          confidence: 1.0
        },
        execute: async () => ({})
      }

      // 应该不需要 requiredContext 等新字段
      expect(minimalSkill.requiredContext).toBeUndefined()
      expect(minimalSkill.inputSchema).toBeUndefined()
      expect(minimalSkill.outputSchema).toBeUndefined()
      expect(minimalSkill.estimatedTokens).toBeUndefined()
    })
  })

  describe('ContextRequirement 类型', () => {
    it('应该支持所有定义的上下文类型', () => {
      const requirements: ContextRequirement[] = [
        { type: 'currentScene' },
        { type: 'selectedText' },
        { type: 'characterProfile', characterId: 'char-123' },
        { type: 'allCharacters' },
        { type: 'worldRules' },
        { type: 'plotOutline' },
        { type: 'adjacentScenes', range: 2 },
        { type: 'creativeIntent' },
        { type: 'conversationHistory', limit: 10 }
      ]

      // 类型检查通过即可
      expect(requirements.length).toBe(9)
    })
  })
})
