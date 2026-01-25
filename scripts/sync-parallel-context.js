#!/usr/bin/env node
/**
 * 并行上下文同步工具
 *
 * 用于并行开发时维护多个 Agent 之间的共享上下文
 * 收集进度、检测冲突、生成合并计划
 *
 * 使用方法:
 *   node scripts/sync-parallel-context.js init       # 初始化共享上下文
 *   node scripts/sync-parallel-context.js update      # 更新进度
 *   node scripts/sync-parallel-context.js check       # 检查冲突
 *   node scripts/sync-parallel-context.js merge-plan  # 生成合并计划
 *   node scripts/sync-parallel-context.js status      # 查看状态
 */

const fs = require('fs');
const path = require('path');

const SHARED_CONTEXT = path.join(process.cwd(), '.claude', 'shared-context.json');
const TEMPLATE_FILE = path.join(process.cwd(), '.claude', 'templates', 'parallel-context-sync.md');
const AGENT_REPORTS_DIR = path.join(process.cwd(), '.claude', 'parallel-reports');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function colorize(color, text) {
  return `${colors[color]}${text}${colors.reset}`;
}

// 初始化共享上下文
function cmdInit(agentCount = 3) {
  console.log('\n========================================');
  console.log(colorize('cyan', '🚀 初始化并行开发上下文'));
  console.log('========================================\n');

  const context = {
    version: '1.0',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    agents: [],
    shared_state: {
      database: { status: 'unknown' },
      branches: { main: 'main' }
    },
    sync_checkpoints: [],
    conflicts: []
  };

  // 创建默认 Agent 配置
  for (let i = 1; i <= agentCount; i++) {
    context.agents.push({
      id: `agent-${i}`,
      name: `Agent ${i}`,
      task: '',
      status: 'pending',
      branch: '',
      files: [],
      last_sync: null
    });
  }

  fs.writeFileSync(SHARED_CONTEXT, JSON.stringify(context, null, 2));
  console.log(colorize('green', `✅ 共享上下文已创建: ${SHARED_CONTEXT}`));
  console.log(`\n📋 配置了 ${agentCount} 个 Agent\n`);
  console.log('💡 下一步:');
  console.log('   1. 为每个 Agent 分配任务');
  console.log('   2. 使用 update 命令更新进度\n');

  console.log('========================================\n');
}

// 更新 Agent 进度
function cmdUpdate(agentId, task, status, files) {
  console.log('\n========================================');
  console.log(colorize('cyan', '📝 更新 Agent 进度'));
  console.log('========================================\n');

  if (!fs.existsSync(SHARED_CONTEXT)) {
    console.log(colorize('red', '⚠️  共享上下文不存在，请先运行 init\n'));
    return;
  }

  const context = JSON.parse(fs.readFileSync(SHARED_CONTEXT, 'utf8'));

  // 查找 Agent
  const agent = context.agents.find(a => a.id === agentId);
  if (!agent) {
    console.log(colorize('red', `⚠️  Agent ${agentId} 不存在\n`));
    return;
  }

  // 更新 Agent 信息
  if (task) agent.task = task;
  if (status) agent.status = status;
  if (files) {
    agent.files = files.split(',').map(f => f.trim());
  }
  agent.last_sync = new Date().toISOString();

  // 添加同步检查点
  context.sync_checkpoints.push({
    timestamp: new Date().toISOString(),
    agent: agentId,
    event: `进度更新: ${status}`,
    status: 'success'
  });

  context.updated_at = new Date().toISOString();

  fs.writeFileSync(SHARED_CONTEXT, JSON.stringify(context, null, 2));

  console.log(colorize('green', `✅ Agent ${agentId} 已更新`));
  console.log(`   任务: ${agent.task}`);
  console.log(`   状态: ${agent.status}`);
  console.log(`   文件: ${agent.files.length} 个\n`);

  console.log('========================================\n');
}

// 检查冲突
function cmdCheck() {
  console.log('\n========================================');
  console.log(colorize('cyan', '🔍 检查冲突'));
  console.log('========================================\n');

  if (!fs.existsSync(SHARED_CONTEXT)) {
    console.log(colorize('red', '⚠️  共享上下文不存在\n'));
    return;
  }

  const context = JSON.parse(fs.readFileSync(SHARED_CONTEXT, 'utf8'));

  // 文件冲突检测
  const fileMap = new Map();
  const fileConflicts = [];

  for (const agent of context.agents) {
    for (const file of agent.files) {
      if (fileMap.has(file)) {
        fileConflicts.push({
          file,
          agents: [fileMap.get(file), agent.id]
        });
      } else {
        fileMap.set(file, agent.id);
      }
    }
  }

  // 分支冲突检测
  const branches = new Set();
  const branchConflicts = [];

  for (const agent of context.agents) {
    if (agent.branch && branches.has(agent.branch)) {
      branchConflicts.push({
        branch: agent.branch,
        agents: context.agents.filter(a => a.branch === agent.branch).map(a => a.id)
      });
    }
    branches.add(agent.branch);
  }

  // 显示结果
  if (fileConflicts.length === 0 && branchConflicts.length === 0) {
    console.log(colorize('green', '✅ 未检测到冲突\n'));
  } else {
    console.log(colorize('yellow', '⚠️  检测到冲突:\n'));

    if (fileConflicts.length > 0) {
      console.log('📄 文件冲突:');
      for (const conflict of fileConflicts) {
        console.log(`   ${conflict.file}`);
        console.log(`     Agents: ${conflict.agents.join(', ')}`);
      }
      console.log('');
    }

    if (branchConflicts.length > 0) {
      console.log('🌿 分支冲突:');
      for (const conflict of branchConflicts) {
        console.log(`   ${conflict.branch}`);
        console.log(`     Agents: ${conflict.agents.join(', ')}`);
      }
      console.log('');
    }
  }

  // 更新上下文中的冲突信息
  context.conflicts = [...fileConflicts, ...branchConflicts];
  fs.writeFileSync(SHARED_CONTEXT, JSON.stringify(context, null, 2));

  console.log('========================================\n');
}

// 生成合并计划
function cmdMergePlan() {
  console.log('\n========================================');
  console.log(colorize('cyan', '📋 生成合并计划'));
  console.log('========================================\n');

  if (!fs.existsSync(SHARED_CONTEXT)) {
    console.log(colorize('red', '⚠️  共享上下文不存在\n'));
    return;
  }

  const context = JSON.parse(fs.readFileSync(SHARED_CONTEXT, 'utf8'));

  // 检查所有 Agent 是否完成
  const completedAgents = context.agents.filter(a => a.status === 'completed');
  const pendingAgents = context.agents.filter(a => a.status !== 'completed');

  if (pendingAgents.length > 0) {
    console.log(colorize('yellow', `⚠️  ${pendingAgents.length} 个 Agent 尚未完成:\n`));
    for (const agent of pendingAgents) {
      console.log(`   - ${agent.id}: ${agent.status}`);
    }
    console.log('');
  }

  console.log(colorize('green'), '✅ 合并计划:\n');

  // 步骤 1: 检查冲突
  console.log('1. 检查冲突');
  console.log(`   node scripts/sync-parallel-context.js check\n`);

  // 步骤 2: 解决冲突
  if (context.conflicts.length > 0) {
    console.log('2. 解决冲突');
    for (const conflict of context.conflicts) {
      if (conflict.file) {
        console.log(`   - ${conflict.file}: 协调 ${conflict.agents.join(' 和 ')}`);
      }
    }
    console.log('');
  }

  // 步骤 3: 合并分支
  console.log('3. 合并分支');
  const branches = [...new Set(context.agents.map(a => a.branch).filter(b => b))];
  for (const branch of branches) {
    if (branch !== 'main') {
      console.log(`   git merge ${branch}`);
    }
  }
  console.log('');

  // 步骤 4: 清理
  console.log('4. 清理临时分支');
  for (const branch of branches) {
    if (branch !== 'main') {
      console.log(`   git branch -d ${branch}`);
    }
  }
  console.log('');

  console.log('========================================\n');
}

// 查看状态
function cmdStatus() {
  console.log('\n========================================');
  console.log(colorize('cyan', '📊 并行开发状态'));
  console.log('========================================\n');

  if (!fs.existsSync(SHARED_CONTEXT)) {
    console.log(colorize('yellow', '⚠️  共享上下文不存在\n'));
    console.log('💡 使用以下命令初始化:');
    console.log('   node scripts/sync-parallel-context.js init\n');
    return;
  }

  const context = JSON.parse(fs.readFileSync(SHARED_CONTEXT, 'utf8'));

  console.log(`📅 创建时间: ${new Date(context.created_at).toLocaleString('zh-CN')}`);
  console.log(`🔄 更新时间: ${new Date(context.updated_at).toLocaleString('zh-CN')}`);
  console.log(`👥 Agent 数量: ${context.agents.length}\n`);

  console.log('📋 Agent 状态:\n');

  const statusIcons = {
    pending: '⏳',
    in_progress: '🔄',
    completed: '✅',
    blocked: '🚫',
    failed: '❌'
  };

  for (const agent of context.agents) {
    const icon = statusIcons[agent.status] || '⚪';
    console.log(`${icon} ${agent.id}`);
    console.log(`   任务: ${agent.task || '未分配'}`);
    console.log(`   状态: ${agent.status}`);
    console.log(`   分支: ${agent.branch || '未设置'}`);
    console.log(`   文件: ${agent.files.length} 个`);
    if (agent.last_sync) {
      console.log(`   同步: ${new Date(agent.last_sync).toLocaleTimeString('zh-CN')}`);
    }
    console.log('');
  }

  if (context.conflicts.length > 0) {
    console.log(colorize('yellow'), `⚠️  检测到 ${context.conflicts.length} 个冲突\n`);
  }

  console.log('========================================\n');
}

// 主函数
function main() {
  const command = process.argv[2] || 'status';
  const args = process.argv.slice(3);

  switch (command) {
    case 'init':
      cmdInit(parseInt(args[0]) || 3);
      break;
    case 'update':
      cmdUpdate(args[0], args[1], args[2], args[3]);
      break;
    case 'check':
      cmdCheck();
      break;
    case 'merge-plan':
      cmdMergePlan();
      break;
    case 'status':
      cmdStatus();
      break;
    default:
      console.log('\n并行上下文同步工具\n');
      console.log('使用方法:');
      console.log('  node scripts/sync-parallel-context.js init [count]      # 初始化');
      console.log('  node scripts/sync-parallel-context.js update <id> <task> <status> [files]  # 更新');
      console.log('  node scripts/sync-parallel-context.js check           # 检查冲突');
      console.log('  node scripts/sync-parallel-context.js merge-plan      # 合并计划');
      console.log('  node scripts/sync-parallel-context.js status          # 查看状态\n');
  }
}

main();
