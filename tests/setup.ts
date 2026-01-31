import '@testing-library/jest-dom'

// 扩展 expect 类型声明
declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

interface CustomMatchers<R = unknown> {
  toBeInTheDocument(): R
  toHaveClass(className: string): R
  toHaveTextContent(text: string | RegExp): R
  toBeVisible(): R
  toBeDisabled(): R
  toBeEnabled(): R
  toHaveAttribute(attr: string, value?: string): R
  toHaveStyle(style: Record<string, any>): R
}

// 忽略测试中未处理的 promise rejection
process.on('unhandledRejection', () => {
  // 在测试中忽略未处理的 rejection
})
