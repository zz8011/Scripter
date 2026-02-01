declare module 'lunar-javascript' {
  export class Lunar {
    static fromDate(date: Date): Lunar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    getGanZhi(): string[];
    getBaZi(): string[];
    getWuXing(): string[];
  }
  
  export class Solar {
    static fromDate(date: Date): Solar;
    getLunar(): Lunar;
  }
}
