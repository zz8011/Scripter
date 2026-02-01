/* ==================================================
   AI Skills API 路由
   /api/ai/skills/route.ts
   ================================================== */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionWithDev } from '@/lib/session';
import { checkUserQuota, useQuota } from '@/lib/quota';
import {
  SkillRegistry,
  FormatFixSkill,
  DialoguePolishSkill,
  SceneExpandSkill,
} from '@/lib/agents/skills';
import { Context } from '@/lib/agents/core/types';

/**
 * GET /api/ai/skills
 * 获取所有可用的 Skills
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionWithDev();
    if (!session) {
      return NextResponse.json(
        { error: '未授权', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // 初始化 Skills
    initializeSkills();

    const registry = SkillRegistry.getInstance();
    const skills = registry.getAllSkills().map((skill) => ({
      id: skill.id,
      name: skill.name,
      description: skill.description,
      category: skill.category,
      tags: skill.tags,
      confidence: skill.confidence,
    }));

    return NextResponse.json({ skills });
  } catch (error) {
    console.error('[API] 获取 Skills 失败:', error);
    return NextResponse.json(
      { error: '获取 Skills 失败', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/skills
 * 执行指定的 Skill
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionWithDev();
    if (!session) {
      return NextResponse.json(
        { error: '未授权', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // 检查配额
    const quotaCheck = await checkUserQuota(session.user.id);
    if (!quotaCheck.hasQuota) {
      return NextResponse.json(
        {
          error: 'AI 配额已用完',
          code: 'QUOTA_EXCEEDED',
          quota: quotaCheck,
        },
        { status: 429 }
      );
    }

    // 解析请求体
    const body = await request.json();
    const { skillId, skillName, input, projectId } = body;

    if (!skillId && !skillName) {
      return NextResponse.json(
        { error: '请提供 skillId 或 skillName', code: 'BAD_REQUEST' },
        { status: 400 }
      );
    }

    // 初始化 Skills
    initializeSkills();

    const registry = SkillRegistry.getInstance();
    let skill;

    if (skillId) {
      skill = registry.getSkill(skillId);
    } else if (skillName) {
      const skills = registry.searchSkills({ name: skillName });
      skill = skills[0];
    }

    if (!skill) {
      return NextResponse.json(
        { error: 'Skill 未找到', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // 构建上下文
    const context: Context = {
      userId: session.user.id,
      projectId,
      sessionId: session.sessionId,
      timestamp: new Date(),
    };

    // 执行 Skill
    const result = await skill.execute(context, input);

    // 扣除配额
    await useQuota(session.user.id, 1);

    return NextResponse.json({
      success: true,
      skill: {
        id: skill.id,
        name: skill.name,
      },
      result,
      quota: {
        remaining: quotaCheck.remaining ? quotaCheck.remaining - 1 : 0,
      },
    });
  } catch (error) {
    console.error('[API] 执行 Skill 失败:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '执行 Skill 失败',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * 初始化 Skills（注册到 Registry）
 */
let skillsInitialized = false;

function initializeSkills() {
  if (skillsInitialized) return;

  const registry = SkillRegistry.getInstance();

  // 注册格式修复 Skill
  registry.register(new FormatFixSkill());

  // 注册对白润色 Skill
  registry.register(new DialoguePolishSkill());

  // 注册场景扩展 Skill
  registry.register(new SceneExpandSkill());

  skillsInitialized = true;
  console.log('[Skills API] Skills 初始化完成');
}
