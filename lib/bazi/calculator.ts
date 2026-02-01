/**
 * 八字计算模块 (Bazi Calculator)
 * 
 * 功能:
 * 1. 公历转农历
 * 2. 计算四柱（年柱、月柱、日柱、时柱）
 * 3. 五行分析
 * 4. 确定日主
 * 
 * @module lib/bazi/calculator
 */

import { Solar, Lunar, LunarMonth } from 'lunar-javascript';

// ============================================
// 类型定义
// ============================================

/** 五行类型 */
export type ElementType = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

/** 天干类型 */
export type Stem = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸';

/** 地支类型 */
export type Branch = '子' | '丑' | '寅' | '卯' | '辰' | '巳' | '午' | '未' | '申' | '酉' | '戌' | '亥';

/** 天干地支组合 */
export interface Pillar {
  stem: Stem;
  branch: Branch;
  element: ElementType;
  stemElement: ElementType;
  branchElement: ElementType;
}

/** 五行统计 */
export interface ElementCount {
  wood: number;   // 木
  fire: number;   // 火
  earth: number;  // 土
  metal: number;  // 金
  water: number;  // 水
}

/** 八字信息 */
export interface BaziInfo {
  /** 公历出生日期 */
  birthDate: Date;
  /** 农历日期字符串 */
  lunarDate: string;
  /** 年柱 */
  year: Pillar;
  /** 月柱 */
  month: Pillar;
  /** 日柱 */
  day: Pillar;
  /** 时柱 */
  hour: Pillar;
  /** 五行统计 */
  elements: ElementCount;
  /** 日主（日柱天干） */
  dayMaster: ElementType;
  /** 日主天干 */
  dayMasterStem: Stem;
  /** 八字格局描述 */
  pattern: string;
  /** 生肖 */
  zodiac: string;
  /** 节气信息 */
  solarTerms: {
    current: string;
    next: string;
  };
}

/** 农历日期信息 */
export interface LunarDate {
  year: number;
  month: number;
  day: number;
  isLeap: boolean;
  yearGanZhi: string;
  monthGanZhi: string;
  dayGanZhi: string;
}

// ============================================
// 常量定义
// ============================================

/** 天干列表 */
const STEMS: Stem[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

/** 地支列表 */
const BRANCHES: Branch[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/** 天干五行映射 */
const STEM_ELEMENTS: Record<Stem, ElementType> = {
  '甲': 'wood', '乙': 'wood',
  '丙': 'fire', '丁': 'fire',
  '戊': 'earth', '己': 'earth',
  '庚': 'metal', '辛': 'metal',
  '壬': 'water', '癸': 'water',
};

/** 地支五行映射 */
const BRANCH_ELEMENTS: Record<Branch, ElementType> = {
  '寅': 'wood', '卯': 'wood',
  '巳': 'fire', '午': 'fire',
  '辰': 'earth', '戌': 'earth', '丑': 'earth', '未': 'earth',
  '申': 'metal', '酉': 'metal',
  '子': 'water', '亥': 'water',
};

/** 地支藏干映射（用于更精确的五行计算） */
const BRANCH_HIDDEN_STEMS: Record<Branch, { stem: Stem; weight: number }[]> = {
  '子': [{ stem: '癸', weight: 1.0 }],
  '丑': [{ stem: '己', weight: 0.6 }, { stem: '癸', weight: 0.3 }, { stem: '辛', weight: 0.1 }],
  '寅': [{ stem: '甲', weight: 0.6 }, { stem: '丙', weight: 0.3 }, { stem: '戊', weight: 0.1 }],
  '卯': [{ stem: '乙', weight: 1.0 }],
  '辰': [{ stem: '戊', weight: 0.6 }, { stem: '乙', weight: 0.3 }, { stem: '癸', weight: 0.1 }],
  '巳': [{ stem: '丙', weight: 0.6 }, { stem: '庚', weight: 0.3 }, { stem: '戊', weight: 0.1 }],
  '午': [{ stem: '丁', weight: 0.6 }, { stem: '己', weight: 0.4 }],
  '未': [{ stem: '己', weight: 0.6 }, { stem: '丁', weight: 0.3 }, { stem: '乙', weight: 0.1 }],
  '申': [{ stem: '庚', weight: 0.6 }, { stem: '壬', weight: 0.3 }, { stem: '戊', weight: 0.1 }],
  '酉': [{ stem: '辛', weight: 1.0 }],
  '戌': [{ stem: '戊', weight: 0.6 }, { stem: '辛', weight: 0.3 }, { stem: '丁', weight: 0.1 }],
  '亥': [{ stem: '壬', weight: 0.7 }, { stem: '甲', weight: 0.3 }],
};

/** 生肖映射 */
const ZODIAC_ANIMALS = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

/** 五行名称映射 */
const ELEMENT_NAMES: Record<ElementType, string> = {
  wood: '木',
  fire: '火',
  earth: '土',
  metal: '金',
  water: '水',
};

// ============================================
// 辅助函数
// ============================================

/**
 * 获取天干的五行属性
 */
function getStemElement(stem: Stem): ElementType {
  return STEM_ELEMENTS[stem];
}

/**
 * 获取地支的五行属性
 */
function getBranchElement(branch: Branch): ElementType {
  return BRANCH_ELEMENTS[branch];
}

/**
 * 解析天干地支字符串
 */
function parseGanZhi(ganZhi: string): { stem: Stem; branch: Branch } {
  if (ganZhi.length !== 2) {
    throw new Error(`Invalid GanZhi string: ${ganZhi}`);
  }
  const stem = ganZhi[0] as Stem;
  const branch = ganZhi[1] as Branch;
  
  if (!STEMS.includes(stem)) {
    throw new Error(`Invalid stem: ${stem}`);
  }
  if (!BRANCHES.includes(branch)) {
    throw new Error(`Invalid branch: ${branch}`);
  }
  
  return { stem, branch };
}

/**
 * 创建柱对象
 */
function createPillar(ganZhi: string): Pillar {
  const { stem, branch } = parseGanZhi(ganZhi);
  return {
    stem,
    branch,
    element: getStemElement(stem),
    stemElement: getStemElement(stem),
    branchElement: getBranchElement(branch),
  };
}

/**
 * 计算时柱
 * 根据日干和时辰计算时柱
 */
function calculateHourPillar(dayStem: Stem, hour: number): Pillar {
  // 时辰索引 (0-11)，每个时辰2小时，从子时(23-1)开始
  let hourIndex: number;
  if (hour >= 23 || hour < 1) {
    hourIndex = 0; // 子时
  } else {
    hourIndex = Math.floor((hour + 1) / 2);
  }
  
  // 确定时干
  // 甲己日起甲子时，乙庚日起丙子时，丙辛日起戊子时，丁壬日起庚子时，戊癸日起壬子时
  const dayStemIndex = STEMS.indexOf(dayStem);
  let startStemIndex: number;
  
  if (dayStemIndex === 0 || dayStemIndex === 5) { // 甲或己
    startStemIndex = 0; // 甲
  } else if (dayStemIndex === 1 || dayStemIndex === 6) { // 乙或庚
    startStemIndex = 2; // 丙
  } else if (dayStemIndex === 2 || dayStemIndex === 7) { // 丙或辛
    startStemIndex = 4; // 戊
  } else if (dayStemIndex === 3 || dayStemIndex === 8) { // 丁或壬
    startStemIndex = 6; // 庚
  } else { // 戊或癸
    startStemIndex = 8; // 壬
  }
  
  const hourStemIndex = (startStemIndex + hourIndex) % 10;
  const hourStem = STEMS[hourStemIndex];
  const hourBranch = BRANCHES[hourIndex];
  
  return {
    stem: hourStem,
    branch: hourBranch,
    element: getStemElement(hourStem),
    stemElement: getStemElement(hourStem),
    branchElement: getBranchElement(hourBranch),
  };
}

/**
 * 统计五行数量
 * 使用藏干权重进行更精确的计算
 */
function countElements(pillars: Pillar[]): ElementCount {
  const count: ElementCount = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };
  
  for (const pillar of pillars) {
    // 天干五行（权重1.0）
    count[pillar.stemElement] += 1.0;
    
    // 地支主五行（权重0.5）
    count[pillar.branchElement] += 0.5;
    
    // 地支藏干（按权重计算）
    const hiddenStems = BRANCH_HIDDEN_STEMS[pillar.branch];
    for (const { stem, weight } of hiddenStems) {
      count[getStemElement(stem)] += weight * 0.5;
    }
  }
  
  // 四舍五入到一位小数
  return {
    wood: Math.round(count.wood * 10) / 10,
    fire: Math.round(count.fire * 10) / 10,
    earth: Math.round(count.earth * 10) / 10,
    metal: Math.round(count.metal * 10) / 10,
    water: Math.round(count.water * 10) / 10,
  };
}

/**
 * 获取最旺的五行
 */
function getDominantElement(count: ElementCount): ElementType {
  const entries = Object.entries(count) as [ElementType, number][];
  return entries.reduce((max, current) => current[1] > max[1] ? current : max)[0];
}

/**
 * 生成八字格局描述
 */
function generatePattern(bazi: BaziInfo): string {
  const { dayMaster, elements, year, month, day, hour } = bazi;
  const dominant = getDominantElement(elements);
  
  const patterns: Record<ElementType, string> = {
    wood: '木旺',
    fire: '火旺',
    earth: '土旺',
    metal: '金旺',
    water: '水旺',
  };
  
  const dayMasterNames: Record<ElementType, string> = {
    wood: '木',
    fire: '火',
    earth: '土',
    metal: '金',
    water: '水',
  };
  
  return `${dayMasterNames[dayMaster]}日主${patterns[dominant]}格`;
}

// ============================================
// 主要功能函数
// ============================================

/**
 * 公历转农历
 * @param date 公历日期
 * @returns 农历日期信息
 */
export function solarToLunar(date: Date): LunarDate {
  const solar = Solar.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const lunar = solar.getLunar();
  
  return {
    year: lunar.getYear(),
    month: lunar.getMonth(),
    day: lunar.getDay(),
    isLeap: lunar.getMonth() < 0, // 闰月为负数
    yearGanZhi: lunar.getYearInGanZhi(),
    monthGanZhi: lunar.getMonthInGanZhi(),
    dayGanZhi: lunar.getDayInGanZhi(),
  };
}

/**
 * 计算八字
 * @param date 公历出生日期
 * @param hour 出生时辰 (0-23)
 * @returns 完整的八字信息
 */
export function calculateBazi(date: Date, hour?: number): BaziInfo {
  const solar = Solar.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const lunar = solar.getLunar();
  
  // 获取四柱干支
  const yearGanZhi = lunar.getYearInGanZhi();
  const monthGanZhi = lunar.getMonthInGanZhi();
  const dayGanZhi = lunar.getDayInGanZhi();
  
  // 创建年、月、日柱
  const yearPillar = createPillar(yearGanZhi);
  const monthPillar = createPillar(monthGanZhi);
  const dayPillar = createPillar(dayGanZhi);
  
  // 计算时柱（如果提供了时辰）
  const actualHour = hour ?? date.getHours();
  const hourPillar = calculateHourPillar(dayPillar.stem, actualHour);
  
  // 统计五行
  const pillars = [yearPillar, monthPillar, dayPillar, hourPillar];
  const elements = countElements(pillars);
  
  // 确定日主
  const dayMaster = dayPillar.stemElement;
  
  // 获取生肖
  const zodiacIndex = lunar.getYearZhiIndex();
  const zodiac = ZODIAC_ANIMALS[zodiacIndex];
  
  // 获取节气信息
  const jieQi = lunar.getJieQi();
  const nextJieQi = lunar.getNextJieQi();
  
  const bazi: BaziInfo = {
    birthDate: date,
    lunarDate: `${lunar.getYearInChinese()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
    elements,
    dayMaster,
    dayMasterStem: dayPillar.stem,
    pattern: '', // 稍后填充
    zodiac,
    solarTerms: {
      current: jieQi || '',
      next: nextJieQi?.getName() || '',
    },
  };
  
  // 生成格局描述
  bazi.pattern = generatePattern(bazi);
  
  return bazi;
}

/**
 * 分析五行
 * @param bazi 八字信息
 * @returns 五行分析结果
 */
export function analyzeElements(bazi: BaziInfo): {
  dominant: ElementType;
  weak: ElementType;
  balance: 'balanced' | 'strong' | 'weak';
  analysis: string;
} {
  const { elements } = bazi;
  const entries = Object.entries(elements) as [ElementType, number][];
  
  // 排序找出最旺和最弱
  entries.sort((a, b) => b[1] - a[1]);
  const dominant = entries[0][0];
  const weak = entries[entries.length - 1][0];
  
  // 计算标准差判断平衡度
  const values = entries.map(e => e[1]);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  let balance: 'balanced' | 'strong' | 'weak';
  let analysis: string;
  
  if (stdDev < 0.5) {
    balance = 'balanced';
    analysis = '五行较为平衡，性格稳重，各方面发展较为均衡。';
  } else if (entries[0][1] > 2.5) {
    balance = 'strong';
    analysis = `${ELEMENT_NAMES[dominant]}气旺盛，${getElementDescription(dominant)}`;
  } else {
    balance = 'weak';
    analysis = `${ELEMENT_NAMES[weak]}气较弱，建议多接触${ELEMENT_NAMES[weak]}属性的事物以平衡五行。`;
  }
  
  return {
    dominant,
    weak,
    balance,
    analysis,
  };
}

/**
 * 获取五行描述
 */
function getElementDescription(element: ElementType): string {
  const descriptions: Record<ElementType, string> = {
    wood: '具有生长、条达的特性，性格温和，富有创造力。',
    fire: '具有炎热、向上的特性，性格热情，充满活力。',
    earth: '具有长养、化育的特性，性格稳重，包容性强。',
    metal: '具有清静、收杀的特性，性格果断，追求精准。',
    water: '具有寒凉、向下的特性，性格智慧，灵活多变。',
  };
  return descriptions[element];
}

/**
 * 确定日主
 * @param bazi 八字信息
 * @returns 日主信息
 */
export function getDayMaster(bazi: BaziInfo): {
  stem: Stem;
  element: ElementType;
  name: string;
  nature: string;
} {
  const { dayMasterStem, dayMaster } = bazi;
  
  const natureMap: Record<Stem, string> = {
    '甲': '参天大树，阳刚之木',
    '乙': '花草藤蔓，阴柔之木',
    '丙': '太阳之火，光明普照',
    '丁': '灯烛之火，温暖内敛',
    '戊': '城墙之土，厚重稳固',
    '己': '田园之土，滋养万物',
    '庚': '斧钺之金，刚毅果决',
    '辛': '珠玉之金，精致内敛',
    '壬': '江河之水，奔流不息',
    '癸': '雨露之水，滋润万物',
  };
  
  return {
    stem: dayMasterStem,
    element: dayMaster,
    name: `${dayMasterStem}${ELEMENT_NAMES[dayMaster]}`,
    nature: natureMap[dayMasterStem],
  };
}

/**
 * 格式化八字输出
 * @param bazi 八字信息
 * @returns 格式化的字符串
 */
export function formatBazi(bazi: BaziInfo): string {
  const { year, month, day, hour, elements, dayMaster, pattern, zodiac } = bazi;
  
  return `
╔════════════════════════════════════════╗
║              八 字 命 盘                ║
╠════════════════════════════════════════╣
║  公历: ${bazi.birthDate.toLocaleString('zh-CN', { 
    year: 'numeric', month: '2-digit', day: '2-digit', 
    hour: '2-digit', minute: '2-digit' }).padEnd(28)}║
║  农历: ${bazi.lunarDate.padEnd(28)}║
║  生肖: ${zodiac.padEnd(28)}║
╠════════════════════════════════════════╣
║  四柱:  年柱    月柱    日柱    时柱    ║
║  天干:  ${year.stem}      ${month.stem}      ${day.stem}      ${hour.stem}      ║
║  地支:  ${year.branch}      ${month.branch}      ${day.branch}      ${hour.branch}      ║
╠════════════════════════════════════════╣
║  日主: ${getDayMaster(bazi).name} (${getDayMaster(bazi).nature})${''.padEnd(15)}║
║  格局: ${pattern.padEnd(28)}║
╠════════════════════════════════════════╣
║  五行统计:                              ║
║    木: ${elements.wood.toFixed(1)}  火: ${elements.fire.toFixed(1)}  土: ${elements.earth.toFixed(1)}  金: ${elements.metal.toFixed(1)}  水: ${elements.water.toFixed(1)}    ║
╚════════════════════════════════════════╝
  `.trim();
}

/**
 * 验证日期是否有效
 * @param date 日期对象
 * @returns 是否有效
 */
export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * 获取时辰名称
 * @param hour 小时 (0-23)
 * @returns 时辰名称
 */
export function getShiChen(hour: number): { name: string; branch: Branch; range: string } {
  const shiChenNames = [
    '子时', '丑时', '寅时', '卯时', '辰时', '巳时',
    '午时', '未时', '申时', '酉时', '戌时', '亥时'
  ];
  const ranges = [
    '23:00-01:00', '01:00-03:00', '03:00-05:00', '05:00-07:00',
    '07:00-09:00', '09:00-11:00', '11:00-13:00', '13:00-15:00',
    '15:00-17:00', '17:00-19:00', '19:00-21:00', '21:00-23:00'
  ];
  
  let index: number;
  if (hour >= 23 || hour < 1) {
    index = 0;
  } else {
    index = Math.floor((hour + 1) / 2);
  }
  
  return {
    name: shiChenNames[index],
    branch: BRANCHES[index],
    range: ranges[index],
  };
}

// ============================================
// 导出默认对象
// ============================================

export default {
  solarToLunar,
  calculateBazi,
  analyzeElements,
  getDayMaster,
  formatBazi,
  isValidDate,
  getShiChen,
};
