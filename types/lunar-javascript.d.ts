declare module 'lunar-javascript' {
  export class JieQi {
    getName(): string;
    getSolar(): Solar;
  }

  export class Lunar {
    static fromDate(date: Date): Lunar;
    static fromYmd(year: number, month: number, day: number): Lunar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    getGanZhi(): string[];
    getBaZi(): string[];
    getWuXing(): string[];
    getYearInGanZhi(): string;
    getMonthInGanZhi(): string;
    getDayInGanZhi(): string;
    getYearZhiIndex(): number;
    getYearInChinese(): string;
    getMonthInChinese(): string;
    getDayInChinese(): string;
    getJieQi(): JieQi | null;
    getNextJieQi(): JieQi | null;
  }

  export class LunarMonth {
    static fromYm(year: number, month: number): LunarMonth;
    getYear(): number;
    getMonth(): number;
  }

  export class Solar {
    static fromDate(date: Date): Solar;
    static fromYmd(year: number, month: number, day: number): Solar;
    getLunar(): Lunar;
  }
}
