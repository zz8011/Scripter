/**
 * 诗号生成模块
 * 
 * 根据八字五行生成专属诗号（7-10字）
 * 
 * @module lib/bazi/shiho
 */

import { ElementType } from './calculator'
import { ShihoResult } from './types'

// ============================================
// 诗号模板库
// ============================================

/**
 * 金属性诗号模板
 */
const METAL_SHIHOS = [
  { text: '一剑霜寒十四州', meaning: '剑气如霜，威震四方', source: '化用唐·贯休《献钱尚父》' },
  { text: '铁马冰河入梦来', meaning: '铁骑破冰，壮志凌云', source: '宋·陆游《十一月四日风雨大作》' },
  { text: '金戈铁马气如虹', meaning: '兵器铠甲，气势如虹', source: '原创' },
  { text: '寒光凛冽照九州', meaning: '剑光寒冷，照耀天下', source: '原创' },
  { text: '铮铮铁骨傲苍穹', meaning: '铁骨铮铮，傲视天际', source: '原创' },
  { text: '金石为开志不移', meaning: '金石可开，志向坚定', source: '化用成语' },
  { text: '锋芒毕露贯长虹', meaning: '锋芒尽显，气贯长虹', source: '原创' },
  { text: '百炼成钢志愈坚', meaning: '千锤百炼，意志更坚', source: '原创' },
]

/**
 * 木属性诗号模板
 */
const WOOD_SHIHOS = [
  { text: '春风化雨润无声', meaning: '如春风化雨，默默滋养', source: '化用唐·杜甫《春夜喜雨》' },
  { text: '绿满窗前草不除', meaning: '绿意盎然，生机勃勃', source: '明·洪应明《菜根谭》' },
  { text: '十年树木凌云起', meaning: '十年成树，直上云霄', source: '原创' },
  { text: '枝繁叶茂荫苍生', meaning: '枝叶繁茂，庇护众生', source: '原创' },
  { text: '青松挺立傲霜雪', meaning: '青松挺拔，傲对霜雪', source: '原创' },
  { text: '生生不息春常在', meaning: '生命不息，春意长存', source: '原创' },
  { text: '木秀于林风必助', meaning: '良木出众，风来相助', source: '化用三国·魏·李康《运命论》' },
  { text: '根深叶茂源远流长', meaning: '根深叶茂，源远流长', source: '原创' },
]

/**
 * 水属性诗号模板
 */
const WATER_SHIHOS = [
  { text: '流水行云自在游', meaning: '如水如云，自在逍遥', source: '原创' },
  { text: '烟波江上使人愁', meaning: '烟波浩渺，引人遐思', source: '唐·崔颢《黄鹤楼》' },
  { text: '水滴石穿志未休', meaning: '水滴石穿，志向不休', source: '化用成语' },
  { text: '海纳百川容乃大', meaning: '包容广阔，有容乃大', source: '化用清·林则徐' },
  { text: '清溪流出碧山头', meaning: '清流潺潺，出自青山', source: '宋·朱熹《秋月》' },
  { text: '润物无声细水流', meaning: '润物无声，细水长流', source: '原创' },
  { text: '江河万里终归海', meaning: '江河奔流，终归大海', source: '原创' },
  { text: '上善若水任方圆', meaning: '至善如水，随方就圆', source: '化用《道德经》' },
]

/**
 * 火属性诗号模板
 */
const FIRE_SHIHOS = [
  { text: '烈火烹油势正旺', meaning: '烈火烹油，气势正盛', source: '化用《红楼梦》' },
  { text: '红日初升其道大光', meaning: '红日初升，前途光明', source: '梁启超《少年中国说》' },
  { text: '星火燎原志未消', meaning: '星星之火，可以燎原', source: '原创' },
  { text: '熔金铸剑锋芒露', meaning: '熔金铸剑，锋芒毕露', source: '原创' },
  { text: '炽热丹心照汗青', meaning: '赤诚之心，光照史册', source: '化用宋·文天祥' },
  { text: '凤凰涅槃获重生', meaning: '凤凰涅槃，浴火重生', source: '化用传说' },
  { text: '炎炎烈日正当空', meaning: '烈日当空，光芒万丈', source: '原创' },
  { text: '激情似火创辉煌', meaning: '激情如火，创造辉煌', source: '原创' },
]

/**
 * 土属性诗号模板
 */
const EARTH_SHIHOS = [
  { text: '厚德载物行千里', meaning: '厚德载物，行稳致远', source: '化用《周易》' },
  { text: '山重水复疑无路', meaning: '山水重重，柳暗花明', source: '宋·陆游《游山西村》' },
  { text: '脚踏实地步步升', meaning: '脚踏实地，步步高升', source: '原创' },
  { text: '稳如泰山不动摇', meaning: '稳如泰山，坚定不移', source: '化用成语' },
  { text: '沃野千里丰年兆', meaning: '沃土千里，丰年吉兆', source: '原创' },
  { text: '积土成山风雨兴', meaning: '积土成山，风雨兴焉', source: '化用《荀子》' },
  { text: '地载万物德无疆', meaning: '大地承载，德泽无边', source: '原创' },
  { text: '黄天厚土志弥坚', meaning: '黄天厚土，意志弥坚', source: '原创' },
]

// ============================================
// 诗号生成函数
// ============================================

/**
 * 根据五行获取诗号模板
 */
function getShihoTemplates(element: ElementType): typeof METAL_SHIHOS {
  switch (element) {
    case 'metal':
      return METAL_SHIHOS
    case 'wood':
      return WOOD_SHIHOS
    case 'water':
      return WATER_SHIHOS
    case 'fire':
      return FIRE_SHIHOS
    case 'earth':
      return EARTH_SHIHOS
    default:
      return EARTH_SHIHOS
  }
}

/**
 * 根据出生日期生成随机种子
 */
function generateSeed(year: number, month: number, day: number, hour: number): number {
  return year * 10000 + month * 100 + day + hour
}

/**
 * 伪随机数生成器（基于种子）
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

/**
 * 生成诗号
 * 
 * @param element - 五行属性
 * @param birthData - 出生日期数据（用于生成确定性随机）
 * @returns 诗号结果
 */
export function generateShiho(
  element: ElementType,
  birthData?: { year: number; month: number; day: number; hour: number }
): ShihoResult {
  const templates = getShihoTemplates(element)
  
  // 根据出生日期选择诗号（确定性，同一八字总是得到同一诗号）
  let selectedIndex: number
  if (birthData) {
    const seed = generateSeed(birthData.year, birthData.month, birthData.day, birthData.hour)
    selectedIndex = Math.floor(seededRandom(seed) * templates.length)
  } else {
    // 随机选择
    selectedIndex = Math.floor(Math.random() * templates.length)
  }
  
  const selected = templates[selectedIndex]
  
  return {
    shiho: selected.text,
    meaning: selected.meaning,
    source: selected.source,
    element,
  }
}

/**
 * 生成多个诗号选项
 * 
 * @param element - 五行属性
 * @param count - 数量（默认3个）
 * @returns 诗号结果数组
 */
export function generateShihoOptions(
  element: ElementType,
  count: number = 3
): ShihoResult[] {
  const templates = getShihoTemplates(element)
  const results: ShihoResult[] = []
  const usedIndices = new Set<number>()
  
  while (results.length < count && usedIndices.size < templates.length) {
    const index = Math.floor(Math.random() * templates.length)
    if (!usedIndices.has(index)) {
      usedIndices.add(index)
      const selected = templates[index]
      results.push({
        shiho: selected.text,
        meaning: selected.meaning,
        source: selected.source,
        element,
      })
    }
  }
  
  return results
}

/**
 * 根据八字完整信息生成诗号
 * 
 * @param dayElement - 日主五行
 * @param year - 出生年
 * @param month - 出生月
 * @param day - 出生日
 * @param hour - 出生时
 * @returns 诗号结果
 */
export function generateShihoFromBazi(
  dayElement: ElementType,
  year: number,
  month: number,
  day: number,
  hour: number
): ShihoResult {
  return generateShiho(dayElement, { year, month, day, hour })
}
