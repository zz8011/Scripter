/**
 * 数据库迁移脚本
 *
 * 用法:
 *   pnpm tsx scripts/migrate.ts     # 应用所有迁移
 *   pnpm tsx scripts/migrate.ts status  # 查看迁移状态
 */

import { db } from '../src/db'
import { sql } from 'drizzle-orm'

const migrations = [
  '0000_init',
]

async function main() {
  const command = process.argv[2] || 'run'

  if (command === 'status') {
    await showStatus()
  } else if (command === 'run') {
    await runMigrations()
  } else {
    console.log('Usage: pnpm tsx scripts/migrate.ts [run|status]')
  }
}

async function showStatus() {
  console.log('Checking migration status...\n')

  // Check if _migrations table exists
  const result = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = '_drizzle_migrations'
    )
  `)

  const hasTable = result.rows[0].exists

  if (!hasTable) {
    console.log('❌ No migrations table found. Run "pnpm migrate" to set up the database.')
    return
  }

  // Get applied migrations
  const applied = await db.execute(sql`
    SELECT hash FROM _drizzle_migrations ORDER BY created_at DESC
  `)

  console.log(`✅ Applied migrations: ${applied.rows.length}\n`)
  applied.rows.forEach((row: any, i: number) => {
    console.log(`  ${i + 1}. ${row.hash}`)
  })
}

async function runMigrations() {
  console.log('Running migrations...\n')

  // Create migrations table if not exists
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS _drizzle_migrations (
      id SERIAL PRIMARY KEY,
      hash TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)

  console.log('✅ Migrations table ready')

  // Apply each migration
  for (const migration of migrations) {
    await applyMigration(migration)
  }

  console.log('\n✅ All migrations applied successfully!')
}

async function applyMigration(name: string) {
  console.log(`Applying: ${name}`)

  // Check if already applied
  const existing = await db.execute(sql`
    SELECT id FROM _drizzle_migrations WHERE hash = ${name}
  `)

  if (existing.rows.length > 0) {
    console.log(`  ⏭️  Already applied, skipping`)
    return
  }

  // Read and execute SQL file
  const { readFileSync } = await import('fs')
  const { resolve } = await import('path')

  const sqlFile = resolve(__dirname, `../drizzle/migrations/${name}.sql`)
  const sqlContent = readFileSync(sqlFile, 'utf-8')

  await db.execute(sql.raw(sqlContent))

  // Record migration
  await db.execute(sql`
    INSERT INTO _drizzle_migrations (hash) VALUES (${name})
  `)

  console.log(`  ✅ Applied`)
}

main().catch(console.error)
