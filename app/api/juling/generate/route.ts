import { NextRequest, NextResponse } from 'next/server'
import { getSessionWithDev } from '@/lib/session'
import { checkUserQuota } from '@/lib/quota'
import { calculateBazi } from '@/lib/bazi/calculator'
import { generatePersonality, BaziInfo as PersonalityBaziInfo } from '@/lib/bazi/personality'
import { getOrCreateJulingConfig, updateJulingConfig } from '@/lib/db/queries/juling-configs'
import { logger } from '@/lib/logger'

/**
 * POST /api/juling/generate
 * 根据注册时间生成八字和性格
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 认证检查
    const session = await getSessionWithDev()
    if (!session) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: '请先登录' },
        { status: 401 }
      )
    }

    // 2. 配额检查 (生成八字消耗 100 tokens)
    const quotaCheck = await checkUserQuota(session.user.id, 100)
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        {
          error: 'QUOTA_EXCEEDED',
          message: 'AI 配额已用完',
          details: {
            remaining: quotaCheck.remaining,
            resetAt: quotaCheck.resetAt,
          },
        },
        { status: 403 }
      )
    }

    // 3. 解析请求体
    const body = await request.json()
    const { birthDate, hour } = body as { birthDate?: string; hour?: number }

    if (!birthDate) {
      return NextResponse.json(
        { error: 'INVALID_INPUT', message: '缺少 birthDate 参数' },
        { status: 400 }
      )
    }

    // 4. 验证日期格式
    const date = new Date(birthDate)
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: 'INVALID_INPUT', message: '无效的日期格式' },
        { status: 400 }
      )
    }

    // 5. 计算八字
    const baziInfo = calculateBazi(date, hour)

    // 6. 转换为 personality 模块需要的格式
    const personalityBazi: PersonalityBaziInfo = {
      yearGan: baziInfo.year.stem,
      yearZhi: baziInfo.year.branch,
      monthGan: baziInfo.month.stem,
      monthZhi: baziInfo.month.branch,
      dayGan: baziInfo.day.stem,
      dayZhi: baziInfo.day.branch,
      hourGan: baziInfo.hour.stem,
      hourZhi: baziInfo.hour.branch,
      dayElement: baziInfo.dayMaster,
      dayYinYang: ['甲', '丙', '戊', '庚', '壬'].includes(baziInfo.dayMasterStem) ? 'yang' : 'yin',
    }

    // 7. 生成性格
    const personality = generatePersonality(personalityBazi)

    // 8. 获取或创建剧灵配置
    const config = await getOrCreateJulingConfig(session.user.id)

    // 9. 更新剧灵配置（保存八字和性格信息）
    await updateJulingConfig(session.user.id, {
      birthDate: date,
      personality: {
        elements: [baziInfo.dayMaster],
        style: personality.coreTraits.elementDescription,
        bazi: {
          year: baziInfo.year,
          month: baziInfo.month,
          day: baziInfo.day,
          hour: baziInfo.hour,
          dayMaster: baziInfo.dayMaster,
          pattern: baziInfo.pattern,
          zodiac: baziInfo.zodiac,
        },
        coreTraits: personality.coreTraits,
        speechStyle: personality.speechStyle,
        collaborationStyle: personality.collaborationStyle,
        poem: personality.poem,
      } as any,
    })

    logger.info('Generated Juling Bazi for user ' + session.user.id, {
      userId: session.user.id,
      dayMaster: baziInfo.dayMaster,
      pattern: baziInfo.pattern,
    })

    // 10. 返回结果
    return NextResponse.json({
      success: true,
      data: {
        bazi: {
          lunarDate: baziInfo.lunarDate,
          year: baziInfo.year,
          month: baziInfo.month,
          day: baziInfo.day,
          hour: baziInfo.hour,
          dayMaster: baziInfo.dayMaster,
          dayMasterStem: baziInfo.dayMasterStem,
          pattern: baziInfo.pattern,
          zodiac: baziInfo.zodiac,
          elements: baziInfo.elements,
        },
        personality: {
          coreTraits: personality.coreTraits,
          speechStyle: personality.speechStyle,
          collaborationStyle: personality.collaborationStyle,
          poem: personality.poem,
        },
        config: {
          id: config.id,
          name: config.name,
          birthDate: date.toISOString(),
        },
      },
    })
  } catch (error) {
    logger.error('Error generating Juling Bazi:', error as Error)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '生成八字时发生错误' },
      { status: 500 }
    )
  }
}
