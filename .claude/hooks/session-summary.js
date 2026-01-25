#!/usr/bin/env node
/**
 * 会话总结 Hook
 *
 * 在会话结束时自动保存关键信息
 * 下次会话可以快速恢复上下文
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const MEMORY_DIR = path.join(os.homedir(), '.claude', 'memory');
const SESSION_LOG = path.join(MEMORY_DIR, 'sessions.json');

// 确保目录存在
if (!fs.existsSync(MEMORY_DIR)) {
  fs.mkdirSync(MEMORY_DIR, { recursive: true });
}

function logSession() {
  const timestamp = new Date().toISOString();
  const cwd = process.cwd();
  const pid = process.pid;

  const session = {
    timestamp,
    pid,
    cwd,
    project: path.basename(cwd)
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
  console.error(`[SessionSummary] 会话已记录: ${timestamp}`);
  console.error(`[SessionSummary] 项目: ${session.project}`);
  console.error(`[SessionSummary] 使用 'claude sessions' 查看历史会话`);
}

logSession();
