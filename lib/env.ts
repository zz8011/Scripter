import { z } from 'zod'

/**
 * 环境变量验证 schema
 * 使用 Zod 验证所有必需的环境变量
 */
const envSchema = z.object({
  // 数据库
  DATABASE_URL: z.string().url('DATABASE_URL 必须是有效的 URL'),
  
  // Casdoor 认证
  CASDOOR_ENDPOINT: z.string().url('CASDOOR_ENDPOINT 必须是有效的 URL'),
  CASDOOR_CLIENT_ID: z.string().min(1, 'CASDOOR_CLIENT_ID 不能为空'),
  CASDOOR_CLIENT_SECRET: z.string().min(1, 'CASDOOR_CLIENT_SECRET 不能为空'),
  CASDOOR_CALLBACK_URL: z.string().url('CASDOOR_CALLBACK_URL 必须是有效的 URL'),
  
  // 智谱 AI
  ZHIPU_API_KEY: z.string().min(1, 'ZHIPU_API_KEY 不能为空'),
  
  // 应用配置
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL 必须是有效的 URL').default('http://localhost:3000'),
  
  // 可选配置
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  BYPASS_AUTH: z.string().transform((v) => v === 'true').default('false'),
})

/**
 * 验证后的环境变量
 * 在应用启动时验证，如果验证失败会抛出错误
 */
export const env = (() => {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`)
      console.error('❌ 环境变量验证失败:')
      missingVars.forEach((v) => console.error(`  - ${v}`))
      console.error('\n请检查 .env.local 文件或系统环境变量配置')
      process.exit(1)
    }
    throw error
  }
})()

/**
 * 检查是否为开发环境
 */
export const isDev = env.NODE_ENV === 'development'

/**
 * 检查是否为生产环境
 */
export const isProd = env.NODE_ENV === 'production'

/**
 * 获取 Casdoor 配置
 */
export const casdoorConfig = {
  serverUrl: env.CASDOOR_ENDPOINT,
  clientId: env.CASDOOR_CLIENT_ID,
  clientSecret: env.CASDOOR_CLIENT_SECRET,
  callbackUrl: env.CASDOOR_CALLBACK_URL,
} as const

/**
 * 获取 AI 配置
 */
export const aiConfig = {
  zhipuApiKey: env.ZHIPU_API_KEY,
} as const

/**
 * 获取应用配置
 */
export const appConfig = {
  url: env.NEXT_PUBLIC_APP_URL,
  bypassAuth: env.BYPASS_AUTH,
} as const
