#!/usr/bin/env tsx

/**
 * 环境配置检查脚本
 *
 * 用途: 验证 .env.local 中的所有必需配置是否正确设置
 * 运行: npx tsx scripts/check-config.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// ANSI 颜色代码
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

interface ConfigCheck {
  name: string;
  envVar: string;
  required: boolean;
  validate?: (value: string) => boolean;
  placeholder?: string;
}

const checks: ConfigCheck[] = [
  {
    name: '数据库连接',
    envVar: 'DATABASE_URL',
    required: true,
    validate: (value) => {
      return value.startsWith('postgresql://') &&
             !value.includes('your_') &&
             !value.includes('localhost');
    },
    placeholder: 'postgresql://user:password@host:5432/database',
  },
  {
    name: 'Casdoor 端点',
    envVar: 'CASDOOR_ENDPOINT',
    required: true,
    validate: (value) => {
      return value.startsWith('http') &&
             !value.includes('your_');
    },
    placeholder: 'http://localhost:8000',
  },
  {
    name: 'Casdoor Client ID',
    envVar: 'CASDOOR_CLIENT_ID',
    required: true,
    validate: (value) => {
      return value.length > 10 &&
             !value.includes('your_') &&
             !value.includes('here');
    },
    placeholder: 'Client ID from Casdoor',
  },
  {
    name: 'Casdoor Client Secret',
    envVar: 'CASDOOR_CLIENT_SECRET',
    required: true,
    validate: (value) => {
      return value.length > 10 &&
             !value.includes('your_') &&
             !value.includes('here');
    },
    placeholder: 'Client Secret from Casdoor',
  },
  {
    name: 'Casdoor 回调 URL',
    envVar: 'CASDOOR_CALLBACK_URL',
    required: true,
    validate: (value) => {
      return value.startsWith('http') &&
             value.includes('/api/auth/callback');
    },
    placeholder: 'http://localhost:3000/api/auth/callback',
  },
  {
    name: '智谱 API 密钥',
    envVar: 'ZHIPU_API_KEY',
    required: true,
    validate: (value) => {
      return value.length > 20 &&
             !value.includes('your_') &&
             !value.includes('here');
    },
    placeholder: 'API Key from open.bigmodel.cn',
  },
  {
    name: '应用 URL',
    envVar: 'NEXT_PUBLIC_APP_URL',
    required: false,
    validate: (value) => {
      return value.startsWith('http');
    },
  },
  {
    name: 'Node 环境',
    envVar: 'NODE_ENV',
    required: false,
    validate: (value) => {
      return ['development', 'production', 'test'].includes(value);
    },
  },
];

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkConfig(config: ConfigCheck, value: string | undefined) {
  if (!value) {
    if (config.required) {
      log(`❌ ${config.name}: 未设置`, 'red');
      log(`   环境变量: ${config.envVar}`, 'cyan');
      if (config.placeholder) {
        log(`   预期格式: ${config.placeholder}`, 'yellow');
      }
      return false;
    } else {
      log(`⚠️  ${config.name}: 未设置 (可选)`, 'yellow');
      return true;
    }
  }

  if (config.validate && !config.validate(value)) {
    log(`❌ ${config.name}: 配置无效`, 'red');
    log(`   当前值: ${maskSensitive(value)}`, 'cyan');
    if (config.placeholder) {
      log(`   预期格式: ${config.placeholder}`, 'yellow');
    }
    return false;
  }

  log(`✅ ${config.name}: 已配置`, 'green');
  return true;
}

function maskSensitive(value: string): string {
  // 隐藏敏感信息的中间部分
  if (value.length <= 10) return '*'.repeat(value.length);
  return value.substring(0, 4) + '*'.repeat(value.length - 8) + value.substring(value.length - 4);
}

function loadEnvFile(): Record<string, string> {
  const envPath = path.join(process.cwd(), '.env.local');
  const env: Record<string, string> = {};

  if (!fs.existsSync(envPath)) {
    log('❌ 未找到 .env.local 文件', 'red');
    log('   请运行: cp .env.example .env.local', 'yellow');
    return env;
  }

  log('✅ 找到 .env.local 文件\n', 'green');

  const content = fs.readFileSync(envPath, 'utf-8');
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=');

    if (key && value) {
      env[key] = value;
    }
  }

  return env;
}

async function checkDatabaseConnection(): Promise<boolean> {
  log('\n🔍 检查数据库连接...', 'blue');

  try {
    const { getDb } = await import('@/lib/db');
    const db = getDb();
    const { sql } = await import('drizzle-orm');
    await db.execute(sql`SELECT 1`);
    log('✅ 数据库连接成功', 'green');
    return true;
  } catch (error) {
    log('❌ 数据库连接失败', 'red');
    log(`   错误: ${(error as Error).message}`, 'cyan');
    return false;
  }
}

async function main() {
  log('\n====================================', 'blue');
  log('  剧灵环境配置检查工具', 'blue');
  log('====================================\n', 'blue');

  // 加载环境变量
  const env = loadEnvFile();

  if (Object.keys(env).length === 0) {
    log('❌ 无法继续检查，请先创建 .env.local 文件', 'red');
    process.exit(1);
  }

  // 检查每个配置项
  let allPassed = true;
  for (const check of checks) {
    const value = env[check.envVar];
    const passed = checkConfig(check, value);
    if (!passed) allPassed = false;
  }

  // 如果基本配置通过，检查数据库连接
  if (allPassed && env.DATABASE_URL) {
    // 加载 .env.local 到 process.env
    Object.assign(process.env, env);

    const dbConnected = await checkDatabaseConnection();
    if (!dbConnected) allPassed = false;
  }

  // 总结
  log('\n====================================', 'blue');
  if (allPassed) {
    log('✅ 所有配置检查通过！', 'green');
    log('\n下一步:', 'blue');
    log('  1. 运行数据库迁移: npm run db:push', 'cyan');
    log('  2. 启动开发服务器: npm run dev', 'cyan');
    log('  3. 访问应用: http://localhost:3000', 'cyan');
  } else {
    log('❌ 配置检查失败', 'red');
    log('\n请按照以下步骤修复:', 'yellow');
    log('  1. 编辑 .env.local 文件', 'cyan');
    log('  2. 填写所有必需的配置项', 'cyan');
    log('  3. 重新运行此脚本: npx tsx scripts/check-config.ts', 'cyan');
    log('\n详细配置指南:', 'blue');
    log('  docs/guides/environment-setup-guide.md', 'cyan');
  }
  log('====================================\n', 'blue');

  process.exit(allPassed ? 0 : 1);
}

main().catch((error) => {
  log(`\n❌ 脚本执行失败: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
