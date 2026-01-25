#!/usr/bin/env node
/**
 * 增强版会话总结 Hook
 *
 * 在会话结束时生成结构化的 Markdown 报告
 * 提取关键决策、完成任务、技术笔记
 * 自动保存到 docs/reports/sessions/
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const REPORTS_DIR = path.join(process.cwd(), 'docs', 'reports', 'sessions');
const SESSION_LOG = path.join(os.homedir(), '.claude', 'memory', 'sessions.json');
const SESSION_STATE = path.join(process.cwd(), '.claude', 'session-state.json');

// 确保目录存在
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// 生成唯一 ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 提取关键决策（从环境变量或会话历史中）
function extractDecisions() {
  const decisionsEnv = process.env.SESSION_DECISIONS;
  if (decisionsEnv) {
    try {
      return JSON.parse(decisionsEnv);
    } catch (e) {
      return [];
    }
  }

  // 尝试从决策日志读取
  const decisionsLog = path.join(process.cwd(), '.claude', 'decisions.json');
  if (fs.existsSync(decisionsLog)) {
    try {
      const log = JSON.parse(fs.readFileSync(decisionsLog, 'utf8'));
      return log.decisions || [];
    } catch (e) {}
  }

  return [];
}

// 提取完成任务（从环境变量）
function extractCompletedTasks() {
  const tasksEnv = process.env.SESSION_COMPLETED_TASKS;
  if (tasksEnv) {
    try {
      return JSON.parse(tasksEnv);
    } catch (e) {
      return [];
    }
  }
  return [];
}

// 提取技术笔记（从环境变量）
function extractTechnicalNotes() {
  const notesEnv = process.env.SESSION_TECHNICAL_NOTES;
  if (notesEnv) {
    try {
      return JSON.parse(notesEnv);
    } catch (e) {
      return [];
    }
  }
  return [];
}

// 提取下一步待办（从环境变量）
function extractNextSteps() {
  const stepsEnv = process.env.SESSION_NEXT_STEPS;
  if (stepsEnv) {
    try {
      return JSON.parse(stepsEnv);
    } catch (e) {
      return [];
    }
  }
  return [];
}

// 生成会话报告
function generateSessionReport() {
  const now = new Date();
  const timestamp = now.toISOString();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = now.toTimeString().split(' ')[0]; // HH:MM:SS

  // 会话基本信息
  const sessionId = generateId();
  const cwd = process.cwd();
  const projectName = path.basename(cwd);
  const pid = process.pid;

  // 从环境变量获取会话统计
  const toolCalls = parseInt(process.env.SESSION_TOOL_CALLS || '0');
  const filesChanged = parseInt(process.env.SESSION_FILES_CHANGED || '0');
  const duration = parseInt(process.env.SESSION_DURATION || '0');

  // 提取内容
  const decisions = extractDecisions();
  const completedTasks = extractCompletedTasks();
  const technicalNotes = extractTechnicalNotes();
  const nextSteps = extractNextSteps();

  // 会话类型
  const sessionType = process.env.SESSION_TYPE || 'general';

  // 生成报告内容
  const report = `# 会话总结 - ${dateStr} ${timeStr}

> **会话 ID**: \`${sessionId}\`
> **项目**: ${projectName}
> **类型**: ${sessionType}
> **时长**: ${duration}分钟
> **工具调用**: ${toolCalls}次
> **文件修改**: ${filesChanged}个

---

## 📋 执行摘要

${generateExecutiveSummary(completedTasks, decisions)}

---

## 🎯 完成任务

${completedTasks.length > 0 ? completedTasks.map((task, i) => `${i + 1}. ${task}`).join('\n') : '_无完成任务_'}

---

## 🔑 关键决策

${decisions.length > 0 ? decisions.map((d, i) => {
  return `### ${i + 1}. ${d.title}\n\n**理由**: ${d.reason}\n\n**影响**: ${d.impact || '_未记录_'}\n`;
}).join('\n') : '_无关键决策_'}

---

## 📝 技术笔记

${technicalNotes.length > 0 ? technicalNotes.map(note => `- ${note}`).join('\n') : '_无技术笔记_'}

---

## 📌 下一步

${nextSteps.length > 0 ? nextSteps.map((step, i) => `${i + 1}. [ ] ${step}`).join('\n') : '_无下一步计划_'}

---

## 📊 会话元数据

\`\`\`json
{
  "session_id": "${sessionId}",
  "timestamp": "${timestamp}",
  "project": "${projectName}",
  "cwd": "${cwd}",
  "pid": ${pid},
  "session_type": "${sessionType}",
  "tool_calls": ${toolCalls},
  "files_changed": ${filesChanged},
  "duration_minutes": ${duration}
}
\`\`\`

---

*此报告由 Scripter 上下文管理系统自动生成*
`;

  return {
    report,
    sessionId,
    dateStr,
    metadata: {
      timestamp,
      sessionId,
      project: projectName,
      sessionType,
      toolCalls,
      filesChanged,
      duration
    }
  };
}

// 生成执行摘要
function generateExecutiveSummary(tasks, decisions) {
  const parts = [];

  if (tasks.length > 0) {
    parts.push(`本次会话完成了 **${tasks.length}** 个任务`);
  }

  if (decisions.length > 0) {
    parts.push(`做出了 **${decisions.length}** 个关键决策`);
  }

  if (parts.length === 0) {
    return '本次会话主要进行了项目探索和规划工作。';
  }

  return parts.join('，') + '。';
}

// 保存会话报告
function saveSessionReport(report, dateStr, sessionId) {
  const filename = `${dateStr}-session-${sessionId}.md`;
  const filepath = path.join(REPORTS_DIR, filename);

  fs.writeFileSync(filepath, report, 'utf8');
  console.error(`[SessionSummary] ✅ 报告已保存: ${filename}`);
  console.error(`[SessionSummary] 📁 路径: ${filepath}`);

  return filepath;
}

// 更新会话状态
function updateSessionState(metadata) {
  const state = {
    last_updated: new Date().toISOString(),
    last_session_id: metadata.sessionId,
    last_session_type: metadata.sessionType,
    last_session_timestamp: metadata.timestamp
  };

  fs.writeFileSync(SESSION_STATE, JSON.stringify(state, null, 2));
  console.error(`[SessionSummary] ✅ 会话状态已更新`);
}

// 记录到全局会话日志
function logToGlobalSessions(metadata) {
  const session = {
    timestamp: metadata.timestamp,
    pid: process.pid,
    cwd: process.cwd(),
    project: metadata.project,
    session_id: metadata.sessionId,
    session_type: metadata.sessionType
  };

  // 读取现有日志
  let sessions = [];
  if (fs.existsSync(SESSION_LOG)) {
    try {
      sessions = JSON.parse(fs.readFileSync(SESSION_LOG, 'utf8'));
    } catch (e) {}
  }

  // 添加新会话
  sessions.push(session);

  // 只保留最近 30 个会话
  if (sessions.length > 30) {
    sessions = sessions.slice(-30);
  }

  fs.writeFileSync(SESSION_LOG, JSON.stringify(sessions, null, 2));
  console.error(`[SessionSummary] ✅ 全局会话日志已更新`);
  console.error(`[SessionSummary] 💡 使用 'claude sessions' 查看历史会话`);
}

// 主函数
function main() {
  console.error('\n========================================');
  console.error('📊 增强版会话总结');
  console.error('========================================\n');

  // 生成报告
  const { report, sessionId, dateStr, metadata } = generateSessionReport();

  // 保存报告
  const filepath = saveSessionReport(report, dateStr, sessionId);

  // 更新会话状态
  updateSessionState(metadata);

  // 记录到全局日志
  logToGlobalSessions(metadata);

  // 显示摘要
  console.error('\n📋 会话摘要:');
  console.error(`   时长: ${metadata.duration}分钟`);
  console.error(`   工具调用: ${metadata.toolCalls}次`);
  console.error(`   文件修改: ${metadata.filesChanged}个`);

  console.error('\n========================================\n');

  return { filepath, sessionId, metadata };
}

// 执行
const result = main();

module.exports = { main, generateSessionReport, saveSessionReport };
