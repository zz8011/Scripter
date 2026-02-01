import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// 定义数据库类型 - 使用 ReturnType 自动推断
type DatabaseType = ReturnType<typeof drizzle<typeof schema>>

let dbInstance: DatabaseType | null = null

function getConnectionString() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  return connectionString
}

// Get or create database client (lazy initialization)
export function getDb(): DatabaseType {
  if (!dbInstance) {
    const connectionString = getConnectionString()
    const client = postgres(connectionString)
    dbInstance = drizzle(client, { schema }) as DatabaseType
  }
  return dbInstance
}

// Convenience export - lazy initializes on first use
export const db: DatabaseType = new Proxy({} as DatabaseType, {
  get(_target, prop) {
    return getDb()[prop as keyof DatabaseType]
  }
})
