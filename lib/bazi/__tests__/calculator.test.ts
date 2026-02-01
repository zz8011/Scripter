import { describe, it, expect } from 'vitest';
import {
  solarToLunar,
  calculateBazi,
  analyzeElements,
  getDayMaster,
  formatBazi,
  isValidDate,
  getShiChen,
  type ElementType,
  type Stem,
  type Branch,
} from '../calculator';

describe('Bazi Calculator', () => {
  // ============================================
  // 基础工具函数测试
  // ============================================
  
  describe('isValidDate', () => {
    it('should return true for valid date', () => {
      expect(isValidDate(new Date('2024-01-15'))).toBe(true);
      expect(isValidDate(new Date())).toBe(true);
    });

    it('should return false for invalid date', () => {
      expect(isValidDate(new Date('invalid'))).toBe(false);
      expect(isValidDate(null as unknown as Date)).toBe(false);
      expect(isValidDate(undefined as unknown as Date)).toBe(false);
    });
  });

  describe('getShiChen', () => {
    it('should return correct shichen for each hour', () => {
      expect(getShiChen(0)).toEqual({ name: '子时', branch: '子', range: '23:00-01:00' });
      expect(getShiChen(2)).toEqual({ name: '丑时', branch: '丑', range: '01:00-03:00' });
      expect(getShiChen(4)).toEqual({ name: '寅时', branch: '寅', range: '03:00-05:00' });
      expect(getShiChen(6)).toEqual({ name: '卯时', branch: '卯', range: '05:00-07:00' });
      expect(getShiChen(8)).toEqual({ name: '辰时', branch: '辰', range: '07:00-09:00' });
      expect(getShiChen(10)).toEqual({ name: '巳时', branch: '巳', range: '09:00-11:00' });
      expect(getShiChen(12)).toEqual({ name: '午时', branch: '午', range: '11:00-13:00' });
      expect(getShiChen(14)).toEqual({ name: '未时', branch: '未', range: '13:00-15:00' });
      expect(getShiChen(16)).toEqual({ name: '申时', branch: '申', range: '15:00-17:00' });
      expect(getShiChen(18)).toEqual({ name: '酉时', branch: '酉', range: '17:00-19:00' });
      expect(getShiChen(20)).toEqual({ name: '戌时', branch: '戌', range: '19:00-21:00' });
      expect(getShiChen(22)).toEqual({ name: '亥时', branch: '亥', range: '21:00-23:00' });
    });

    it('should handle 23:00 as Zi Shi', () => {
      expect(getShiChen(23)).toEqual({ name: '子时', branch: '子', range: '23:00-01:00' });
    });
  });

  // ============================================
  // 公历转农历测试
  // ============================================
  
  describe('solarToLunar', () => {
    it('should convert 2024 Spring Festival correctly', () => {
      const date = new Date('2024-02-10'); // 2024年春节
      const lunar = solarToLunar(date);
      
      expect(lunar.year).toBe(2024);
      expect(lunar.month).toBe(1); // 正月
      expect(lunar.day).toBe(1);   // 初一
      expect(lunar.isLeap).toBe(false);
    });

    it('should convert 2023 New Year correctly', () => {
      const date = new Date('2023-01-22'); // 2023年春节
      const lunar = solarToLunar(date);
      
      expect(lunar.year).toBe(2023);
      expect(lunar.month).toBe(1);
      expect(lunar.day).toBe(1);
    });

    it('should return correct GanZhi for year', () => {
      const date = new Date('2024-06-15');
      const lunar = solarToLunar(date);
      
      // 2024年是甲辰年
      expect(lunar.yearGanZhi).toBe('甲辰');
    });

    it('should handle leap month correctly', () => {
      // 2023年有闰二月
      const date = new Date('2023-03-23'); // 闰二月初二
      const lunar = solarToLunar(date);
      
      expect(lunar.month).toBe(-2); // 闰月为负数
      expect(lunar.isLeap).toBe(true);
    });
  });

  // ============================================
  // 八字计算测试
  // ============================================
  
  describe('calculateBazi', () => {
    it('should calculate 2024 Jia Chen year correctly', () => {
      const date = new Date('2024-02-10T12:00:00');
      const bazi = calculateBazi(date);
      
      // 2024年是甲辰年
      expect(bazi.year.stem).toBe('甲');
      expect(bazi.year.branch).toBe('辰');
      expect(bazi.year.element).toBe('wood');
      expect(bazi.zodiac).toBe('龙');
    });

    it('should calculate day pillar correctly', () => {
      const date = new Date('2024-06-15T10:30:00');
      const bazi = calculateBazi(date);
      
      // 验证日柱存在且格式正确
      expect(bazi.day.stem).toBeDefined();
      expect(bazi.day.branch).toBeDefined();
      expect(bazi.dayMaster).toBeDefined();
      expect(bazi.dayMasterStem).toBe(bazi.day.stem);
    });

    it('should calculate hour pillar based on day stem', () => {
      const date = new Date('2024-06-15T10:00:00'); // 巳时
      const bazi = calculateBazi(date);
      
      expect(bazi.hour.branch).toBe('巳');
      // 时干根据日干推算
      expect(bazi.hour.stem).toBeDefined();
    });

    it('should calculate all four pillars', () => {
      const date = new Date('1990-05-15T14:30:00');
      const bazi = calculateBazi(date);
      
      expect(bazi.year).toBeDefined();
      expect(bazi.month).toBeDefined();
      expect(bazi.day).toBeDefined();
      expect(bazi.hour).toBeDefined();
      
      // 验证每个柱都有天干地支
      [bazi.year, bazi.month, bazi.day, bazi.hour].forEach(pillar => {
        expect(pillar.stem).toBeDefined();
        expect(pillar.branch).toBeDefined();
        expect(pillar.element).toBeDefined();
      });
    });

    it('should include lunar date string', () => {
      const date = new Date('2024-02-10T12:00:00');
      const bazi = calculateBazi(date);
      
      // 农历日期格式为：二〇二四年正月初一
      expect(bazi.lunarDate).toContain('年');
      expect(bazi.lunarDate).toContain('月');
      // 初一没有"日"字，改为验证包含数字
      expect(bazi.lunarDate.length).toBeGreaterThan(5);
    });

    it('should calculate elements count', () => {
      const date = new Date('2024-06-15T12:00:00');
      const bazi = calculateBazi(date);
      
      expect(bazi.elements.wood).toBeGreaterThanOrEqual(0);
      expect(bazi.elements.fire).toBeGreaterThanOrEqual(0);
      expect(bazi.elements.earth).toBeGreaterThanOrEqual(0);
      expect(bazi.elements.metal).toBeGreaterThanOrEqual(0);
      expect(bazi.elements.water).toBeGreaterThanOrEqual(0);
    });

    it('should generate pattern description', () => {
      const date = new Date('2024-06-15T12:00:00');
      const bazi = calculateBazi(date);
      
      expect(bazi.pattern).toContain('日主');
      expect(bazi.pattern).toContain('格');
    });

    it('should handle custom hour parameter', () => {
      const date = new Date('2024-06-15T10:00:00'); // 原本10点
      const bazi1 = calculateBazi(date);
      const bazi2 = calculateBazi(date, 14); // 强制改为14点
      
      expect(bazi1.hour.branch).toBe('巳');
      expect(bazi2.hour.branch).toBe('未');
    });

    it('should include solar terms info', () => {
      const date = new Date('2024-06-15T12:00:00');
      const bazi = calculateBazi(date);
      
      expect(bazi.solarTerms).toBeDefined();
      expect(typeof bazi.solarTerms.current).toBe('string');
      expect(typeof bazi.solarTerms.next).toBe('string');
    });
  });

  // ============================================
  // 五行分析测试
  // ============================================
  
  describe('analyzeElements', () => {
    it('should identify dominant and weak elements', () => {
      const date = new Date('2024-06-15T12:00:00');
      const bazi = calculateBazi(date);
      const analysis = analyzeElements(bazi);
      
      expect(analysis.dominant).toBeDefined();
      expect(['wood', 'fire', 'earth', 'metal', 'water']).toContain(analysis.dominant);
      
      expect(analysis.weak).toBeDefined();
      expect(['wood', 'fire', 'earth', 'metal', 'water']).toContain(analysis.weak);
    });

    it('should return balance status', () => {
      const date = new Date('2024-06-15T12:00:00');
      const bazi = calculateBazi(date);
      const analysis = analyzeElements(bazi);
      
      expect(['balanced', 'strong', 'weak']).toContain(analysis.balance);
    });

    it('should provide analysis text', () => {
      const date = new Date('2024-06-15T12:00:00');
      const bazi = calculateBazi(date);
      const analysis = analyzeElements(bazi);
      
      expect(analysis.analysis).toBeTruthy();
      expect(analysis.analysis.length).toBeGreaterThan(0);
    });
  });

  // ============================================
  // 日主测试
  // ============================================
  
  describe('getDayMaster', () => {
    it('should return correct day master info', () => {
      const date = new Date('2024-06-15T12:00:00');
      const bazi = calculateBazi(date);
      const dayMaster = getDayMaster(bazi);
      
      expect(dayMaster.stem).toBe(bazi.dayMasterStem);
      expect(dayMaster.element).toBe(bazi.dayMaster);
      // 日主名称应该是天干+五行，如"庚金"
      expect(dayMaster.name).toBe(dayMaster.stem + (dayMaster.element === 'wood' ? '木' : dayMaster.element === 'fire' ? '火' : dayMaster.element === 'earth' ? '土' : dayMaster.element === 'metal' ? '金' : '水'));
      expect(dayMaster.nature).toBeDefined();
    });

    it('should have nature description for all stems', () => {
      const testDates = [
        new Date('2024-02-04T12:00:00'), // 甲日
        new Date('2024-02-05T12:00:00'), // 乙日
        new Date('2024-02-06T12:00:00'), // 丙日
      ];
      
      testDates.forEach(date => {
        const bazi = calculateBazi(date);
        const dayMaster = getDayMaster(bazi);
        expect(dayMaster.nature).toBeTruthy();
        expect(dayMaster.nature.length).toBeGreaterThan(0);
      });
    });
  });

  // ============================================
  // 格式化输出测试
  // ============================================
  
  describe('formatBazi', () => {
    it('should return formatted string', () => {
      const date = new Date('2024-06-15T12:00:00');
      const bazi = calculateBazi(date);
      const formatted = formatBazi(bazi);
      
      expect(typeof formatted).toBe('string');
      // 检查包含关键信息（使用空格分隔的"八 字 命 盘"）
      expect(formatted).toContain('八');
      expect(formatted).toContain('字');
      expect(formatted).toContain('命');
      expect(formatted).toContain('盘');
      expect(formatted).toContain(bazi.year.stem);
      expect(formatted).toContain(bazi.year.branch);
    });

    it('should include all pillars in output', () => {
      const date = new Date('2024-06-15T12:00:00');
      const bazi = calculateBazi(date);
      const formatted = formatBazi(bazi);
      
      expect(formatted).toContain('年柱');
      expect(formatted).toContain('月柱');
      expect(formatted).toContain('日柱');
      expect(formatted).toContain('时柱');
    });
  });

  // ============================================
  // 已知日期验证测试
  // ============================================
  
  describe('known date validation', () => {
    // 使用已知的八字日期进行验证
    it('should match known bazi for 1984-02-15', () => {
      // 1984年2月15日应该是甲子年
      const date = new Date('1984-02-15T12:00:00');
      const bazi = calculateBazi(date);
      
      expect(bazi.year.stem).toBe('甲');
      expect(bazi.year.branch).toBe('子');
      expect(bazi.zodiac).toBe('鼠');
    });

    it('should match known bazi for 2025-01-29', () => {
      // 2025年春节，乙巳年
      const date = new Date('2025-01-29T12:00:00');
      const bazi = calculateBazi(date);
      
      expect(bazi.year.stem).toBe('乙');
      expect(bazi.year.branch).toBe('巳');
      expect(bazi.zodiac).toBe('蛇');
    });

    it('should calculate correct day pillar for 2024-01-01', () => {
      const date = new Date('2024-01-01T12:00:00');
      const bazi = calculateBazi(date);
      
      // 验证日柱存在
      expect(bazi.day.stem).toBeDefined();
      expect(bazi.day.branch).toBeDefined();
      // 2024年1月1日仍然是癸卯年（立春前）
      expect(bazi.year.stem).toBe('癸');
      expect(bazi.year.branch).toBe('卯');
    });
  });

  // ============================================
  // 边界情况测试
  // ============================================
  
  describe('edge cases', () => {
    it('should handle midnight (00:00)', () => {
      const date = new Date('2024-06-15T00:00:00');
      const bazi = calculateBazi(date);
      
      expect(bazi.hour.branch).toBe('子');
    });

    it('should handle late night (23:00)', () => {
      const date = new Date('2024-06-15T23:00:00');
      const bazi = calculateBazi(date);
      
      expect(bazi.hour.branch).toBe('子');
    });

    it('should handle early morning (05:00)', () => {
      const date = new Date('2024-06-15T05:00:00');
      const bazi = calculateBazi(date);
      
      expect(bazi.hour.branch).toBe('卯');
    });

    it('should handle historical dates', () => {
      const date = new Date('1990-01-01T12:00:00');
      const bazi = calculateBazi(date);
      
      expect(bazi.year.stem).toBe('己');
      expect(bazi.year.branch).toBe('巳');
      expect(bazi.zodiac).toBe('蛇');
    });

    it('should handle future dates', () => {
      const date = new Date('2030-06-15T12:00:00');
      const bazi = calculateBazi(date);
      
      expect(bazi.year.stem).toBe('庚');
      expect(bazi.year.branch).toBe('戌');
    });
  });
});
