#!/usr/bin/env node
/**
 * 上下文管理器 CLI
 *
 * 用于管理项目上下文状态、快照和清理
 *
 * 使用方法:
 *   node scripts/context-manager.js status    # 查看当前状态
 *   node scripts/context-manager.js snapshot  # 保存快照
 *   node scripts/context-manager.js cleanup   # 清理旧上下文
 *   node scripts/context-manager.js report    # 生成上下文报告
 */

const fs = require('fs');
const path = require('path');

const PROJECT_DIR = process.cwd();
const CLAUDE_DIR = path.join(PROJECT_DIR, '.claude');
const MEMORY_FILE = path.join(CLAUDE_DIR, 'memory.json');
const SESSION_STATE = path.join(CLAUDE_DIR, 'session-state.json');
const DECISIONS_LOG = path.join(CLAUDE_DIR, 'decisions.json');
const PHASE_LOG = path.join(CLAUDE_DIR, 'phase-log.json');
const REPORTS_DIR = path.join(PROJECT_DIR, 'docs', 'reports', 'sessions');
const SNAPSHOTS_DIR = path.join(CLAUDE_DIR, 'snapshots');

// 确保快照目录存在
if (!fs.existsSync(SNAPSHOTS_DIR)) {
  fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
}

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

// 查看当前状态
function cmdStatus() {
  console.log('\n========================================');
  console.log(colorize('cyan', '📊 上下文状态'));
  console.log('========================================\n');

  // 项目记忆
  if (fs.existsSync(MEMORY_FILE)) {
    try {
      const memory = JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
      console.log(colorize('green', '✅ 项目记忆'));
      console.log(`   记忆项: ${Object.keys(memory).length}`);
      if (memory.project_state) {
        console.log(`   Sprint: ${memory.project_state.current_sprint || 'unknown'}`);
        console.log(`   阶段: ${memory.project_state.phase || 'unknown'}`);
      }
      if (memory.recent_work) {
        console.log(`   最近工作: ${memory.recent_work.length} 项`);
      }
      if (memory.decisions) {
        console.log(`   决策: ${memory.decisions.length} 条`);
      }
    } catch (e) {
      console.log(colorize('red', '⚠️  项目记忆损坏'));
    }
  } else {
    console.log(colorize('yellow', '⚠️  项目记忆不存在'));
  }

  console.log('');

  // 会话状态
  if (fs.existsSync(SESSION_STATE)) {
    try {
      const state = JSON.parse(fs.readFileSync(SESSION_STATE, 'utf8'));
      console.log(colorize('green', '✅ 会话状态'));
      console.log(`   当前阶段: ${state.current_phase || 'unknown'}`);
      console.log(`   更新时间: ${state.phase_updated_at || 'unknown'}`);
      console.log(`   会话 ID: ${state.last_session_id || 'unknown'}`);
    } catch (e) {
      console.log(colorize('red', '⚠️  会话状态损坏'));
    }
  } else {
    console.log(colorize('yellow', '⚠️  会话状态不存在'));
  }

  console.log('');

  // 决策日志
  if (fs.existsSync(DECISIONS_LOG)) {
    try {
      const log = JSON.parse(fs.readFileSync(DECISIONS_LOG, 'utf8'));
      console.log(colorize('green', '✅ 决策日志'));
      console.log(`   决策数: ${log.total_count || 0}`);
    } catch (e) {
      console.log(colorize('red', '⚠️  决策日志损坏'));
    }
  } else {
    console.log(colorize('yellow', '⚠️  决策日志不存在'));
  }

  console.log('');

  // 会话报告
  if (fs.existsSync(REPORTS_DIR)) {
    const reports = fs.readdirSync(REPORTS_DIR).filter(f => f.endsWith('.md'));
    console.log(colorize('green', `✅ 会话报告: ${reports.length} 个`));
    if (reports.length > 0) {
      const latest = reports.sort().pop();
      console.log(`   最新: ${latest}`);
    }
  } else {
    console.log(colorize('yellow', '⚠️  会话报告目录不存在'));
  }

  console.log('\n========================================\n');
}

// 保存快照
function cmdSnapshot() {
  console.log('\n========================================');
  console.log(colorize('cyan', '📸 保存快照'));
  console.log('========================================\n');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const snapshotDir = path.join(SNAPSHOTS_DIR, timestamp);

  fs.mkdirSync(snapshotDir, { recursive: true });

  let copied = 0;

  // 复制记忆文件
  if (fs.existsSync(MEMORY_FILE)) {
    fs.copyFileSync(MEMORY_FILE, path.join(snapshotDir, 'memory.json'));
    console.log(colorize('green', '✅ memory.json'));
    copied++;
  }

  // 复制会话状态
  if (fs.existsSync(SESSION_STATE)) {
    fs.copyFileSync(SESSION_STATE, path.join(snapshotDir, 'session-state.json'));
    console.log(colorize('green', '✅ session-state.json'));
    copied++;
  }

  // 复制决策日志
  if (fs.existsSync(DECISIONS_LOG)) {
    fs.copyFileSync(DECISIONS_LOG, path.join(snapshotDir, 'decisions.json'));
    console.log(colorize('green', '✅ decisions.json'));
    copied++;
  }

  // 复制阶段日志
  if (fs.existsSync(PHASE_LOG)) {
    fs.copyFileSync(PHASE_LOG, path.join(snapshotDir, 'phase-log.json'));
    console.log(colorize('green', '✅ phase-log.json'));
    copied++;
  }

  console.log(`\n📁 快照已保存到: ${snapshotDir}`);
  console.log(`📊 共复制 ${copied} 个文件\n`);

  // 创建快照元数据
  const metadata = {
    timestamp: new Date().toISOString(),
    files_copied: copied,
    session_id: fs.existsSync(SESSION_STATE) ?
      JSON.parse(fs.readFileSync(SESSION_STATE, 'utf8')).last_session_id :
      null
  };

  fs.writeFileSync(
    path.join(snapshotDir, 'snapshot-metadata.json'),
    JSON.stringify(metadata, null, 2)
  );

  console.log('========================================\n');
}

// 清理旧上下文
function cmdCleanup() {
  console.log('\n========================================');
  console.log(colorize('cyan', '🧹 清理旧上下文'));
  console.log('========================================\n');

  let cleaned = 0;

  // 清理临时文件
  const tmpDir = path.join(CLAUDE_DIR, 'tmp');
  if (fs.existsSync(tmpDir)) {
    try {
      const files = fs.readdirSync(tmpDir);
      for (const file of files) {
        fs.unlinkSync(path.join(tmpDir, file));
        cleaned++;
      }
      console.log(colorize('green', `✅ 清理临时文件: ${files.length} 个`));
    } catch (e) {
      console.log(colorize('red', '⚠️  清理临时文件失败'));
    }
  }

  // 清理旧快照（保留最近 10 个）
  if (fs.existsSync(SNAPSHOTS_DIR)) {
    try {
      const snapshots = fs.readdirSync(SNAPSHOTS_DIR)
        .filter(f => fs.statSync(path.join(SNAPSHOTS_DIR, f)).isDirectory())
        .sort()
        .reverse();

      // 删除超过 10 个的旧快照
      const toDelete = snapshots.slice(10);
      for (const snapshot of toDelete) {
        const snapshotPath = path.join(SNAPSHOTS_DIR, snapshot);
        const files = fs.readdirSync(snapshotPath);
        for (const file of files) {
          fs.unlinkSync(path.join(snapshotPath, file));
        }
        fs.rmdirSync(snapshotPath);
        cleaned++;
      }

      if (toDelete.length > 0) {
        console.log(colorize('green', `✅ 清理旧快照: ${toDelete.length} 个`));
      }
    } catch (e) {
      console.log(colorize('red', '⚠️  清理快照失败'));
    }
  }

  // 清理旧会话报告（保留最近 30 个）
  if (fs.existsSync(REPORTS_DIR)) {
    try {
      const reports = fs.readdirSync(REPORTS_DIR)
        .filter(f => f.endsWith('.md'))
        .sort();

      const toDelete = reports.slice(0, -30);
      for (const report of toDelete) {
        fs.unlinkSync(path.join(REPORTS_DIR, report));
        cleaned++;
      }

      if (toDelete.length > 0) {
        console.log(colorize('green', `✅ 清理旧报告: ${toDelete.length} 个`));
      }
    } catch (e) {
      console.log(colorize('red', '⚠️  清理报告失败'));
    }
  }

  console.log(`\n📊 共清理 ${cleaned} 项\n`);
  console.log('========================================\n');
}

// 生成上下文报告
function cmdReport() {
  console.log('\n========================================');
  console.log(colorize('cyan', '📊 上下文使用报告'));
  console.log('========================================\n');

  // 统计各文件大小
  const files = [
    { path: MEMORY_FILE, name: '项目记忆' },
    { path: SESSION_STATE, name: '会话状态' },
    { path: DECISIONS_LOG, name: '决策日志' },
    { path: PHASE_LOG, name: '阶段日志' }
  ];

  let totalSize = 0;
  let fileCount = 0;

  console.log('📁 文件大小:');
  console.log('');

  for (const file of files) {
    if (fs.existsSync(file.path)) {
      const stats = fs.statSync(file.path);
      const size = Math.round(stats.size / 1024); // KB
      totalSize += size;
      fileCount++;

      console.log(`   ${file.name}:`);
      console.log(`     大小: ${size} KB`);
      console.log(`     更新: ${new Date(stats.mtime).toLocaleString('zh-CN')}`);
      console.log('');
    }
  }

  console.log(`   总计: ${totalSize} KB (${fileCount} 个文件)\n`);

  // 统计会话报告
  if (fs.existsSync(REPORTS_DIR)) {
    const reports = fs.readdirSync(REPORTS_DIR).filter(f => f.endsWith('.md'));
    console.log(`📊 会话报告: ${reports.length} 个\n`);

    // 按日期统计
    const byDate = {};
    for (const report of reports) {
      const match = report.match(/(\d{4}-\d{2}-\d{2})/);
      if (match) {
        const date = match[1];
        byDate[date] = (byDate[date] || 0) + 1;
      }
    }

    console.log('   按日期统计:');
    for (const [date, count] of Object.entries(byDate).sort().reverse()) {
      console.log(`     ${date}: ${count} 个报告`);
    }
    console.log('');
  }

  // 统计快照
  if (fs.existsSync(SNAPSHOTS_DIR)) {
    const snapshots = fs.readdirSync(SNAPSHOTS_DIR)
      .filter(f => fs.statSync(path.join(SNAPSHOTS_DIR, f)).isDirectory());

    console.log(`📸 快照: ${snapshots.length} 个\n`);
  }

  console.log('========================================\n');
}

// 主函数
function main() {
  const command = process.argv[2] || 'status';

  switch (command) {
    case 'status':
      cmdStatus();
      break;
    case 'snapshot':
      cmdSnapshot();
      break;
    case 'cleanup':
      cmdCleanup();
      break;
    case 'report':
      cmdReport();
      break;
    default:
      console.log('\n上下文管理器 CLI\n');
      console.log('使用方法:');
      console.log('  node scripts/context-manager.js status    # 查看当前状态');
      console.log('  node scripts/context-manager.js snapshot  # 保存快照');
      console.log('  node scripts/context-manager.js cleanup   # 清理旧上下文');
      console.log('  node scripts/context-manager.js report    # 生成上下文报告\n');
  }
}

main();
