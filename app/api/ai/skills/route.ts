import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { SkillRegistry } from '@/lib/agents/skills/SkillRegistry'
import { initializeSkills } from '@/lib/agents/skills/init'
import { ContextAssembler } from '@/lib/agents/context/ContextAssembler'
import { Context } from '@/lib/agents/core/types'
import { checkUserQuota, deductQuota } from '@/lib/quota'
import { ApiErrors, handleApiError } from '@/lib/errors/api-error'

// 初始化技能（仅在模块首次加载时执行一次）
let skillsInitialized = false
function ensureSkillsInitialized() {
  if (!skillsInitialized) {
    initializeSkills()
    skillsInitialized = true
  }
}

// 输入验证schema
const executeSkillSchema = z.object({
  skillId: z.string().min(1, '技能ID不能为空'),
  input: z.record(z.unknown()),
  editorState: z.object({
    projectId: z.string(),
    content: z.string().optional(),
    selection: z.object({
      start: z.number(),
      end: z.number()
    }).optional()
  }).optional()
})

// GET /api/ai/skills - 获取所有可用技能
export const GET = withAuth(async (req: NextRequest, session) => {
  try {
    ensureSkillsInitialized()

    const registry = SkillRegistry.getInstance()
    const allSkills = registry.getAllSkills()

    // 转换为 API 响应格式
    const skills = allSkills.map(skill => ({
      id: skill.id,
      name: skill.name,
      description: skill.description,
      category: skill.category,
      metadata: skill.metadata
    }))

    return NextResponse.json({ skills })
  } catch (error) {
    logger.error('Failed to get skills:', error instanceof Error ? error : undefined)
    return handleApiError(error)
  }
})

// POST /api/ai/skills - 执行技能
export const POST = withAuth(async (req: NextRequest, session) => {
  try {
    ensureSkillsInitialized()

    const body = await req.json()

    // 输入验证
    const result = executeSkillSchema.safeParse(body)
    if (!result.success) {
      throw ApiErrors.validationFailed('输入参数验证失败', {
        errors: result.error.format()
      })
    }

    const { skillId, input, editorState } = result.data
    const userId = session.userId

    // 获取技能
    const registry = SkillRegistry.getInstance()
    const skill = registry.getSkill(skillId)

    if (!skill) {
      throw ApiErrors.notFound(`技能不存在: ${skillId}`)
    }

    // 使用 ContextAssembler 智能组装上下文
    let context: Context;
    let contextTokens = 0;

    if (skill.requiredContext && skill.requiredContext.length > 0) {
      // 如果技能声明了 requiredContext，使用 ContextAssembler
      logger.info(`Assembling context for skill: ${skillId}, requirements: ${skill.requiredContext.map(r => r.type).join(', ')}`)

      const assembler = new ContextAssembler();

      // 提取选中的文本（如果有 selection）
      let selectedText: string | undefined;
      if (editorState?.selection && editorState?.content) {
        const { start, end } = editorState.selection;
        selectedText = editorState.content.substring(start, end);
      }

      const assembled = await assembler.assemble(skill.requiredContext, {
        projectId: editorState?.projectId || 'unknown',
        userId,
        currentSceneId: (input as any).sceneId || (input as any).currentSceneId,
        selectedText,
        editorContent: editorState?.content
      });

      context = assembled.context;
      contextTokens = assembled.tokensUsed;

      logger.info(`Context assembled: ${contextTokens} tokens, sources: ${Object.keys(assembled.summary).join(', ')}`)
    } else {
      // 如果没有声明 requiredContext，使用旧的简单上下文
      context = {
        taskId: `skill-${Date.now()}`,
        projectId: editorState?.projectId || 'unknown',
        userId,
        script: {
          content: editorState?.content || '',
          metadata: {
            wordCount: editorState?.content?.length || 0,
            sceneCount: 0,
            characterCount: 0
          }
        },
        projectSettings: {
          genre: [],
          scriptType: 'standard',
          targetEpisodes: 1
        },
        agentStates: new Map(),
        conversationHistory: []
      };

      contextTokens = Math.ceil((editorState?.content?.length || 0) / 4);
    }

    // 预估总 token 消耗
    const inputText = JSON.stringify(input);
    const inputTokens = Math.ceil(inputText.length / 4);
    const estimatedTokens = contextTokens + inputTokens + 500; // 上下文 + 输入 + 输出预估

    // 检查配额
    const quotaCheck = await checkUserQuota(userId, estimatedTokens);
    if (!quotaCheck.allowed) {
      throw ApiErrors.tooManyRequests('AI 配额不足', {
        reason: quotaCheck.reason,
        remaining: quotaCheck.remaining,
        resetAt: quotaCheck.resetAt
      })
    }

    // 执行技能
    logger.info(`Executing skill: ${skillId} for user: ${userId}`)
    const skillResult = await skill.execute(context, input)

    // 计算实际 token 消耗
    const outputText = JSON.stringify(skillResult);
    const outputTokens = Math.ceil(outputText.length / 4);
    const actualTokens = contextTokens + inputTokens + outputTokens;

    // 扣减配额
    await deductQuota(userId, actualTokens)

    logger.info(`Skill executed successfully: ${skillId}, tokens used: ${actualTokens} (context: ${contextTokens}, input: ${inputTokens}, output: ${outputTokens})`)

    // 返回结果
    return NextResponse.json({
      success: true,
      skillId,
      result: skillResult,
      tokensUsed: actualTokens,
      breakdown: {
        context: contextTokens,
        input: inputTokens,
        output: outputTokens
      }
    })

  } catch (error) {
    logger.error('Failed to execute skill:', error instanceof Error ? error : undefined)
    return handleApiError(error)
  }
})

