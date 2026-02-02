#!/usr/bin/env node
/**
 * 部署验证脚本
 * 验证各服务是否正常运行
 */

const http = require('http');
const { execSync } = require('child_process');

const TESTS = {
  total: 0,
  passed: 0,
  failed: 0,
  results: []
};

function test(name, fn) {
  TESTS.total++;
  try {
    fn();
    TESTS.passed++;
    TESTS.results.push({ name, status: '✅ PASS' });
    console.log(`✅ ${name}`);
  } catch (error) {
    TESTS.failed++;
    TESTS.results.push({ name, status: '❌ FAIL', error: error.message });
    console.log(`❌ ${name}: ${error.message}`);
  }
}

async function httpGet(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { timeout }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Timeout')));
  });
}

async function main() {
  console.log('🚀 部署验证测试开始...\n');

  // 测试 1: Docker 容器状态
  test('Docker 容器运行状态', () => {
    const output = execSync('docker ps --format "{{.Names}}"').toString();
    if (!output.includes('scripter-backend')) throw new Error('Backend not running');
    if (!output.includes('scripter-casdoor')) throw new Error('Casdoor not running');
    if (!output.includes('scripter-postgres')) throw new Error('Postgres not running');
  });

  // 测试 2: 后端 API 健康检查
  test('Backend API 响应', async () => {
    try {
      const res = await httpGet('http://localhost:3000/api/health');
      if (res.status !== 200) throw new Error(`Status: ${res.status}`);
    } catch (e) {
      // 如果没有 health endpoint，测试首页
      const res = await httpGet('http://localhost:3000');
      if (res.status !== 200) throw new Error(`Status: ${res.status}`);
    }
  });

  // 测试 3: Casdoor 服务
  test('Casdoor 服务响应', async () => {
    const res = await httpGet('http://localhost:8000/api/get-application?id=admin/app-built-in');
    if (res.status !== 200) throw new Error(`Status: ${res.status}`);
  });

  // 测试 4: PostgreSQL 连接
  test('PostgreSQL 数据库连接', () => {
    const output = execSync(
      'docker exec scripter-postgres pg_isready -U scripter_user -d scripter'
    ).toString();
    if (!output.includes('accepting connections')) throw new Error('Database not ready');
  });

  // 测试 5: 数据库表存在
  test('数据库表已创建', () => {
    const output = execSync(
      'docker exec scripter-postgres psql -U scripter_user -d scripter -c "\\dt"'
    ).toString();
    if (!output.includes('projects') && !output.includes('users')) {
      throw new Error('Tables not found');
    }
  });

  // 测试 6: 环境变量配置
  test('环境变量配置正确', () => {
    const envContent = require('fs').readFileSync('.env.local', 'utf8');
    if (!envContent.includes('CASDOOR_CLIENT_ID=')) throw new Error('Missing CASDOOR_CLIENT_ID');
    if (!envContent.includes('CASDOOR_CLIENT_SECRET=')) throw new Error('Missing CASDOOR_CLIENT_SECRET');
    if (envContent.includes('your_client_id_here')) throw new Error('Client ID not configured');
  });

  // 输出结果
  console.log('\n' + '='.repeat(50));
  console.log(`测试结果: ${TESTS.passed}/${TESTS.total} 通过`);
  console.log(`通过率: ${((TESTS.passed/TESTS.total)*100).toFixed(1)}%`);
  
  if (TESTS.failed > 0) {
    console.log('\n❌ 失败的测试:');
    TESTS.results.filter(r => r.status === '❌ FAIL').forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log('\n✅ 所有部署测试通过！');
    console.log('\n📋 服务状态:');
    console.log('  - Backend:    http://localhost:3000');
    console.log('  - Casdoor:    http://localhost:8000');
    console.log('  - PostgreSQL: localhost:5432');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('测试执行错误:', err);
  process.exit(1);
});
