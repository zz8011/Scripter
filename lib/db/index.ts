import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

let dbInstance: ReturnType<typeof drizzle> | null = null

function getConnectionString() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  return connectionString
}

// Get or create database client (lazy initialization)
export function getDb() {
  if (!dbInstance) {
    const connectionString = getConnectionString()
    const client = postgres(connectionString)
    dbInstance = drizzle(client, { schema })
  }
  return dbInstance
}

// Convenience export - lazy initializes on first use
export const db = new Proxy({} as never, {
  get(_target, prop) {
    return getDb()[prop as string]
  }
})
