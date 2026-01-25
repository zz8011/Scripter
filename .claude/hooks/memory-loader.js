#!/usr/bin/env node
/**
 * 记忆加载器 Hook
 *
 * 在会话开始时智能加载项目记忆
 * 根据会话类型分层加载相关上下文
 */

const fs = require('fs');
const path = require('path');

const PROJECT_MEMORY = path.join(process.cwd(), '.claude', 'memory.json');
const SESSION_STATE = path.join(process.cwd(), '.claude', 'session-state.json');
const PROGRESS_FILE = path.join(process.cwd(), 'docs', 'progress.md');
const REPORTS_DIR = path.join(process.cwd(), 'docs', 'reports', 'sessions');

// 会话类型关键词映射
const SESSION_KEYWORDS = {
  feature_dev: ['开发', '实现', '功能', 'feature', 'implement', 'add', 'create'],
  bug_fix: ['修复', 'bug', 'fix', 'error', 'issue', '问题'],
  ui_dev: ['ui', '界面', '组件', '设计', 'design', 'component'],
  review: ['review', '审查', '检查', '代码'],
  planning: ['plan', '规划', '计划', '设计'],
  testing: ['test', '测试', '验证'],
  deployment: ['deploy', '部署', '发布', 'release']
};

// 检测会话类型
function detectSessionType(userPrompt) {
  if (!userPrompt) return 'general';

  const prompt = userPrompt.toLowerCase();

  for (const [type, keywords] of Object.entries(SESSION_KEYWORDS)) {
    for (const keyword of keywords) {
      if (prompt.includes(keyword.toLowerCase())) {
        return type;
      }
    }
  }

  return 'general';
}

// 读取项目记忆
function loadProjectMemory() {
  if (!fs.existsSync(PROJECT_MEMORY)) {
    console.error(`[MemoryLoader] 项目记忆文件不存在: ${PROJECT_MEMORY}`);
    return null;
  }

  try {
    const memory = JSON.parse(fs.readFileSync(PROJECT_MEMORY, 'utf8'));
    console.error(`[MemoryLoader] ✅ 已加载项目记忆 (${Object.keys(memory).length} 项)`);
    return memory;
  } catch (e) {
    console.error(`[MemoryLoader] ⚠️  无法加载项目记忆: ${e.message}`);
    return null;
  }
}

// 读取会话状态
function loadSessionState() {
  if (!fs.existsSync(SESSION_STATE)) {
    return null;
  }

  try {
    const state = JSON.parse(fs.readFileSync(SESSION_STATE, 'utf8'));
    const lastSession = new Date(state.last_updated);
    const hoursAgo = Math.floor((Date.now() - lastSession) / (1000 * 60 * 60));

    console.error(`[MemoryLoader] ✅ 上次会话: ${lastSession.toLocaleString('zh-CN')} (${hoursAgo}小时前)`);
    return state;
  } catch (e) {
    console.error(`[MemoryLoader] ⚠️  无法加载会话状态: ${e.message}`);
    return null;
  }
}

// 分层加载记忆
function loadLayeredMemory(sessionType, memory, sessionState) {
  console.error(`\n[MemoryLoader] 📚 会话类型: ${sessionType}`);
  console.error(`[MemoryLoader] 📋 分层加载上下文:\n`);

  const layers = [];

  // L1: 核心项目配置 (始终加载)
  layers.push({
    name: 'L1: 核心项目配置',
    priority: 'critical',
    files: [
      'CLAUDE.md',
      'docs/prd/prd-v2.5.md',
      'docs/tech/tech-stack.md'
    ],
    description: '项目规范、PRD、技术栈'
  });

  // L2: 当前 Sprint/任务状态
  if (memory && memory.project_state) {
    layers.push({
      name: 'L2: 当前 Sprint/任务状态',
      priority: 'high',
      data: {
        current_sprint: memory.project_state.current_sprint,
        phase: memory.project_state.phase,
        recent_work: memory.recent_work || [],
        blockers: memory.blockers || []
      },
      description: '项目当前状态、最近工作、阻塞问题'
    });
  }

  // L3: 根据会话类型加载相关内容
  if (sessionType === 'feature_dev') {
    layers.push({
      name: 'L3: 功能开发相关',
      priority: 'medium',
      files: [
        'docs/tech/data-model.md',
        'docs/design/ui-design-system.md'
      ],
      data: {
        next_steps: memory?.next_steps || [],
        decisions: memory?.decisions?.slice(-5) || [] // 最近 5 个决策
      },
      description: '数据模型、设计系统、待办事项'
    });
  } else if (sessionType === 'ui_dev') {
    layers.push({
      name: 'L3: UI 开发相关',
      priority: 'medium',
      files: [
        'docs/design/ui-design-system.md',
        'docs/design/.claude/design-context.md'
      ],
      description: '设计系统规范、色彩、组件库'
    });
  } else if (sessionType === 'bug_fix') {
    layers.push({
      name: 'L3: 问题修复相关',
      priority: 'medium',
      data: {
        recent_work: memory?.recent_work || [],
        blockers: memory?.blockers || []
      },
      description: '最近工作、已知问题'
    });
  }

  // L4: 最近的会话总结
  const latestReport = getLatestSessionReport();
  if (latestReport) {
    layers.push({
      name: 'L4: 最近会话总结',
      priority: 'low',
      data: {
        latest_session_summary: latestReport.summary,
        latest_session_date: latestReport.date
      },
      description: '上次会话的关键决策和完成任务'
    });
  }

  return layers;
}

// 获取最新的会话总结报告
function getLatestSessionReport() {
  if (!fs.existsSync(REPORTS_DIR)) {
    return null;
  }

  try {
    const files = fs.readdirSync(REPORTS_DIR)
      .filter(f => f.endsWith('.md'))
      .sort()
      .reverse();

    if (files.length === 0) return null;

    const latestFile = path.join(REPORTS_DIR, files[0]);
    const content = fs.readFileSync(latestFile, 'utf8');

    // 提取基本信息
    const summaryMatch = content.match(/## 📋 执行摘要\n\n(.+?)(?=\n##|\n*$)/s);
    const dateMatch = files[0].match(/(\d{4}-\d{2}-\d{2})/);

    return {
      file: latestFile,
      date: dateMatch ? dateMatch[1] : 'unknown',
      summary: summaryMatch ? summaryMatch[1].trim() : '无法提取摘要'
    };
  } catch (e) {
    return null;
  }
}

// 显示加载建议
function displayLoadSuggestions(layers, sessionType) {
  console.error(`📦 上下文加载建议:\n`);

  let tokenEstimate = 0;

  for (const layer of layers) {
    const priorityIcon = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🟢'
    }[layer.priority] || '⚪';

    console.error(`${priorityIcon} ${layer.name}`);
    console.error(`   ${layer.description}`);

    if (layer.files) {
      console.error(`   文件:`);
      for (const file of layer.files) {
        const fullPath = path.join(process.cwd(), file);
        if (fs.existsSync(fullPath)) {
          const stats = fs.statSync(fullPath);
          const size = Math.round(stats.size / 1024); // KB
          console.error(`     - ${file} (${size}KB)`);
          tokenEstimate += size * 0.75; // 粗略估算: 1KB ≈ 750 tokens
        } else {
          console.error(`     - ${file} (不存在)`);
        }
      }
    }

    if (layer.data) {
      console.error(`   数据: ${JSON.stringify(layer.data, null, 2).split('\n').map(l => '     ' + l).join('\n')}`);
    }

    console.error('');
  }

  console.error(`📊 预估 Token 使用: ${Math.round(tokenEstimate)} tokens`);
  console.error(`\n💡 建议: ${getSuggestion(sessionType, tokenEstimate)}`);
}

// 获取建议
function getSuggestion(sessionType, tokenEstimate) {
  if (tokenEstimate > 50000) {
    return '上下文较大，建议优先阅读 L1-L2 层，其他层按需加载';
  }
  if (sessionType === 'feature_dev') {
    return '优先阅读 PRD 相关章节，然后查看数据模型';
  }
  if (sessionType === 'ui_dev') {
    return '优先阅读设计系统，然后查看相关组件文档';
  }
  if (sessionType === 'bug_fix') {
    return '优先查看最近工作记录和已知问题';
  }
  return '从 L1 开始逐层加载，根据需要深入';
}

// 主函数
function main() {
  console.error('\n========================================');
  console.error('🧠 记忆加载器');
  console.error('========================================\n');

  // 从环境变量获取用户提示（如果有）
  const userPrompt = process.env.USER_PROMPT || '';

  // 检测会话类型
  const sessionType = detectSessionType(userPrompt);

  // 加载项目记忆
  const memory = loadProjectMemory();

  // 加载会话状态
  const sessionState = loadSessionState();

  // 分层加载
  const layers = loadLayeredMemory(sessionType, memory, sessionState);

  // 显示建议
  displayLoadSuggestions(layers, sessionType);

  console.error('========================================\n');

  // 返回加载结果供其他 Hook 使用
  return {
    sessionType,
    memory,
    sessionState,
    layers
  };
}

// 执行
const result = main();

module.exports = { main, detectSessionType, loadProjectMemory, loadLayeredMemory };
