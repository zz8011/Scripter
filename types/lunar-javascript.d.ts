declare module 'lunar-javascript' {
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
