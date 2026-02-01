/**
 * 八字计算模块使用示例
 * 
 * 本文件展示了如何使用 lib/bazi/calculator 模块
 */

import {
  solarToLunar,
  calculateBazi,
  analyzeElements,
  getDayMaster,
  formatBazi,
  isValidDate,
  getShiChen,
} from './calculator';

// ============================================
// 示例 1: 公历转农历
// ============================================

console.log('=== 示例 1: 公历转农历 ===\n');

const date1 = new Date('2024-02-10'); // 2024年春节
const lunar1 = solarToLunar(date1);

console.log('公历日期:', date1.toLocaleDateString('zh-CN'));
console.log('农历日期:', lunar1);
// 输出:
// 公历日期: 2024/2/10
// 农历日期: { year: 2024, month: 1, day: 1, isLeap: false, yearGanZhi: '甲辰', ... }

// ============================================
// 示例 2: 计算八字
// ============================================

console.log('\n=== 示例 2: 计算八字 ===\n');

// 使用当前时间计算八字
const birthDate = new Date();
const bazi = calculateBazi(birthDate);

console.log('出生时间:', birthDate.toLocaleString('zh-CN'));
console.log('农历:', bazi.lunarDate);
console.log('生肖:', bazi.zodiac);
console.log('\n四柱:');
console.log('  年柱:', bazi.year.stem + bazi.year.branch, '- 五行:', bazi.year.element);
console.log('  月柱:', bazi.month.stem + bazi.month.branch, '- 五行:', bazi.month.element);
console.log('  日柱:', bazi.day.stem + bazi.day.branch, '- 五行:', bazi.day.element);
console.log('  时柱:', bazi.hour.stem + bazi.hour.branch, '- 五行:', bazi.hour.element);

// ============================================
// 示例 3: 五行分析
// ============================================

console.log('\n=== 示例 3: 五行分析 ===\n');

const analysis = analyzeElements(bazi);

console.log('五行统计:');
console.log('  木:', bazi.elements.wood);
console.log('  火:', bazi.elements.fire);
console.log('  土:', bazi.elements.earth);
console.log('  金:', bazi.elements.metal);
console.log('  水:', bazi.elements.water);

console.log('\n五行分析:');
console.log('  最旺五行:', analysis.dominant);
console.log('  最弱五行:', analysis.weak);
console.log('  平衡状态:', analysis.balance);
console.log('  分析:', analysis.analysis);

// ============================================
// 示例 4: 确定日主
// ============================================

console.log('\n=== 示例 4: 确定日主 ===\n');

const dayMaster = getDayMaster(bazi);

console.log('日主:', dayMaster.name);
console.log('五行属性:', dayMaster.element);
console.log('日主特性:', dayMaster.nature);

// ============================================
// 示例 5: 格式化输出
// ============================================

console.log('\n=== 示例 5: 格式化输出 ===\n');

console.log(formatBazi(bazi));

// ============================================
// 示例 6: 获取时辰
// ============================================

console.log('\n=== 示例 6: 获取时辰 ===\n');

const hour = birthDate.getHours();
const shiChen = getShiChen(hour);

console.log(`当前时间 ${hour}:00 对应时辰:`);
console.log('  时辰名称:', shiChen.name);
console.log('  地支:', shiChen.branch);
console.log('  时间范围:', shiChen.range);

// ============================================
// 示例 7: 验证日期
// ============================================

console.log('\n=== 示例 7: 验证日期 ===\n');

console.log('new Date() 是否有效:', isValidDate(new Date()));
console.log('new Date("invalid") 是否有效:', isValidDate(new Date('invalid')));
console.log('null 是否有效:', isValidDate(null as unknown as Date));

// ============================================
// 示例 8: 指定特定时间计算八字
// ============================================

console.log('\n=== 示例 8: 指定时间计算八字 ===\n');

// 指定一个具体的出生时间
const specificDate = new Date('1990-05-15T14:30:00');
const specificBazi = calculateBazi(specificDate);

console.log('指定出生时间:', specificDate.toLocaleString('zh-CN'));
console.log('八字:');
console.log('  年柱:', specificBazi.year.stem + specificBazi.year.branch);
console.log('  月柱:', specificBazi.month.stem + specificBazi.month.branch);
console.log('  日柱:', specificBazi.day.stem + specificBazi.day.branch);
console.log('  时柱:', specificBazi.hour.stem + specificBazi.hour.branch);
console.log('  日主:', getDayMaster(specificBazi).name);
console.log('  格局:', specificBazi.pattern);

// ============================================
// 示例 9: 使用自定义时辰计算
// ============================================

console.log('\n=== 示例 9: 使用自定义时辰计算 ===\n');

// 使用日期中的日期，但指定不同的时辰
const dateWithCustomHour = new Date('2024-06-15T10:00:00');
const baziWithCustomHour = calculateBazi(dateWithCustomHour, 20); // 强制使用戌时(20点)

console.log('日期:', dateWithCustomHour.toLocaleDateString('zh-CN'));
console.log('原时辰:', getShiChen(dateWithCustomHour.getHours()).name);
console.log('自定义时辰:', getShiChen(20).name);
console.log('时柱:', baziWithCustomHour.hour.stem + baziWithCustomHour.hour.branch);

// ============================================
// 示例 10: 批量计算多个日期的八字
// ============================================

console.log('\n=== 示例 10: 批量计算 ===\n');

const dates = [
  new Date('1984-02-15T12:00:00'),
  new Date('1995-08-20T08:00:00'),
  new Date('2008-01-01T00:00:00'),
  new Date('2024-02-10T12:00:00'), // 春节
];

console.log('批量计算结果:');
dates.forEach((date, index) => {
  const b = calculateBazi(date);
  const dm = getDayMaster(b);
  console.log(`\n${index + 1}. ${date.toLocaleDateString('zh-CN')}`);
  console.log(`   八字: ${b.year.stem}${b.year.branch} ${b.month.stem}${b.month.branch} ${b.day.stem}${b.day.branch} ${b.hour.stem}${b.hour.branch}`);
  console.log(`   日主: ${dm.name}, 生肖: ${b.zodiac}`);
});

// ============================================
// 示例 11: 剧灵生辰八字系统实际使用场景
// ============================================

console.log('\n=== 示例 11: 剧灵系统使用场景 ===\n');

/**
 * 生成剧灵八字信息
 * 这是剧灵系统中最常用的功能
 */
function generateJulingBazi(userRegistrationDate: Date) {
  // 1. 计算八字
  const bazi = calculateBazi(userRegistrationDate);
  
  // 2. 分析五行
  const analysis = analyzeElements(bazi);
  
  // 3. 获取日主信息
  const dayMaster = getDayMaster(bazi);
  
  return {
    birthDate: userRegistrationDate,
    lunarDate: bazi.lunarDate,
    bazi: {
      year: { stem: bazi.year.stem, branch: bazi.year.branch, element: bazi.year.element },
      month: { stem: bazi.month.stem, branch: bazi.month.branch, element: bazi.month.element },
      day: { stem: bazi.day.stem, branch: bazi.day.branch, element: bazi.day.element },
      hour: { stem: bazi.hour.stem, branch: bazi.hour.branch, element: bazi.hour.element },
    },
    elements: bazi.elements,
    dayMaster: {
      stem: dayMaster.stem,
      element: dayMaster.element,
      name: dayMaster.name,
      nature: dayMaster.nature,
    },
    pattern: bazi.pattern,
    zodiac: bazi.zodiac,
    analysis: {
      dominant: analysis.dominant,
      weak: analysis.weak,
      balance: analysis.balance,
      description: analysis.analysis,
    },
  };
}

// 模拟用户注册时间
const userRegDate = new Date('2024-06-15T14:30:00');
const julingInfo = generateJulingBazi(userRegDate);

console.log('剧灵生辰信息:');
console.log(JSON.stringify(julingInfo, null, 2));
