/**
 * 八字配置 API 路由
 * 
 * CRUD API for user bazi configuration
 * 
 * @module app/api/bazi
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSessionWithDev } from '@/lib/session'
import { calculateBazi, ElementType } from '@/lib/bazi/calculator'
import { generatePersonality } from '@/lib/bazi/personality'
import { generateShihoFromBazi } from '@/lib/bazi/shiho'
import { db } from '@/lib/db'
import { userBazi } from '@/lib/db/schema/user-bazi'
import { eq } from 'drizzle-orm'
import { logger } from '@/lib/logger'

// ============================================
// 类型定义
// ============================================

interface BaziRequest {
  year: number
  month: number
  day: number
  hour: number
}

// ============================================
// GET /api/bazi
// 获取当前用户的八字配置
// ============================================

export async function GET() {
  try {
    const session = await getSessionWithDev()
    if (!session?.user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const config = await db.query.userBazi.findFirst({
      where: eq(userBazi.userId, session.user.id),
    })

    if (!config) {
      return NextResponse.json({ error: '八字配置不存在' }, { status: 404 })
    }

    // 计算性格画像
    const birthDate = new Date(config.birthYear, config.birthMonth - 1, config.birthDay)
    const baziInfo = calculateBazi(birthDate, config.birthHour)
    
    const personality = generatePersonality({
      yearGan: baziInfo.year.stem,
      yearZhi: baziInfo.year.branch,
      monthGan: baziInfo.month.stem,
      monthZhi: baziInfo.month.branch,
      dayGan: baziInfo.day.stem,
      dayZhi: baziInfo.day.branch,
      hourGan: baziInfo.hour.stem,
      hourZhi: baziInfo.hour.branch,
      dayElement: baziInfo.dayMaster,
      dayYinYang: (['甲', '丙', '戊', '庚', '壬'] as string[]).includes(baziInfo.dayMasterStem) ? 'yang' : 'yin',
    })

    const response = {
      ...config,
      createdAt: config.createdAt.toISOString(),
      updatedAt: config.updatedAt.toISOString(),
      personality,
    }

    return NextResponse.json({ success: true, data: response })
  } catch (error) {
    logger.error('Get bazi config error:', error instanceof Error ? error : undefined)
    return NextResponse.json(
      { error: '获取八字配置失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}

// ============================================
// POST /api/bazi
// 创建或更新八字配置
// ============================================

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionWithDev()
    if (!session?.user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const body: BaziRequest = await request.json()
    const { year, month, day, hour } = body

    // 验证输入
    if (!year || !month || !day || hour === undefined) {
      return NextResponse.json(
        { error: '缺少必要的出生时间参数' },
        { status: 400 }
      )
    }

    // 计算八字
    const birthDate = new Date(year, month - 1, day)
    const baziInfo = calculateBazi(birthDate, hour)
    
    // 生成诗号
    const shihoResult = generateShihoFromBazi(
      baziInfo.dayMaster,
      year,
      month,
      day,
      hour
    )

    // 构建八字字符串
    const baziString = `${baziInfo.year.stem}${baziInfo.year.branch}年` +
      `${baziInfo.month.stem}${baziInfo.month.branch}月` +
      `${baziInfo.day.stem}${baziInfo.day.branch}日` +
      `${baziInfo.hour.stem}${baziInfo.hour.branch}时`

    // 五行名称映射
    const wuxingMap: Record<ElementType, string> = {
      wood: '木',
      fire: '火',
      earth: '土',
      metal: '金',
      water: '水',
    }

    // 检查是否已存在配置
    const existing = await db.query.userBazi.findFirst({
      where: eq(userBazi.userId, session.user.id),
    })

    if (existing) {
      // 更新现有配置
      const updated = await db
        .update(userBazi)
        .set({
          birthYear: year,
          birthMonth: month,
          birthDay: day,
          birthHour: hour,
          bazi: baziString,
          wuxing: wuxingMap[baziInfo.dayMaster],
          shiho: shihoResult.shiho,
          updatedAt: new Date(),
        })
        .where(eq(userBazi.id, existing.id))
        .returning()

      logger.info('Bazi config updated', { userId: session.user.id })
      
      return NextResponse.json({
        success: true,
        data: {
          ...updated[0],
          createdAt: updated[0].createdAt.toISOString(),
          updatedAt: updated[0].updatedAt.toISOString(),
        },
        message: '八字配置已更新',
      })
    } else {
      // 创建新配置
      const created = await db
        .insert(userBazi)
        .values({
          userId: session.user.id,
          birthYear: year,
          birthMonth: month,
          birthDay: day,
          birthHour: hour,
          bazi: baziString,
          wuxing: wuxingMap[baziInfo.dayMaster],
          shiho: shihoResult.shiho,
        })
        .returning()

      logger.info('Bazi config created', { userId: session.user.id })
      
      return NextResponse.json({
        success: true,
        data: {
          ...created[0],
          createdAt: created[0].createdAt.toISOString(),
          updatedAt: created[0].updatedAt.toISOString(),
        },
        message: '八字配置已创建',
      })
    }
  } catch (error) {
    logger.error('Create/Update bazi config error:', error instanceof Error ? error : undefined)
    return NextResponse.json(
      { error: '保存八字配置失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}

// ============================================
// DELETE /api/bazi
// 删除八字配置
// ============================================

export async function DELETE() {
  try {
    const session = await getSessionWithDev()
    if (!session?.user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const existing = await db.query.userBazi.findFirst({
      where: eq(userBazi.userId, session.user.id),
    })

    if (!existing) {
      return NextResponse.json({ error: '八字配置不存在' }, { status: 404 })
    }

    await db.delete(userBazi).where(eq(userBazi.id, existing.id))

    logger.info('Bazi config deleted', { userId: session.user.id })

    return NextResponse.json({
      success: true,
      message: '八字配置已删除',
    })
  } catch (error) {
    logger.error('Delete bazi config error:', error instanceof Error ? error : undefined)
    return NextResponse.json(
      { error: '删除八字配置失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}
