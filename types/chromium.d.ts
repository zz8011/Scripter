declare module '@sparticuz/chromium' {
  export const args: string[];
  export const defaultViewport: any;
  export const headless: any;
  export function executablePath(): Promise<string>;
}
