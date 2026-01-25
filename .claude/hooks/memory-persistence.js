#!/usr/bin/env node
/**
 * 记忆持久化 Hook
 *
 * 在会话开始和结束时保存/加载重要上下文
 * 避免因压缩丢失关键信息
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const MEMORY_DIR = path.join(os.homedir(), '.claude', 'memory');
const PROJECT_MEMORY = path.join(process.cwd(), '.claude', 'memory.json');

// 确保目录存在
if (!fs.existsSync(MEMORY_DIR)) {
  fs.mkdirSync(MEMORY_DIR, { recursive: true });
}

// 读取项目记忆
function loadMemory() {
  if (fs.existsSync(PROJECT_MEMORY)) {
    try {
      const memory = JSON.parse(fs.readFileSync(PROJECT_MEMORY, 'utf8'));
      console.error(`[Memory] 已加载项目记忆 (${Object.keys(memory).length} 项)`);
      console.error(`[Memory] 包括: ${Object.keys(memory).join(', ')}`);
      return memory;
    } catch (e) {
      console.error(`[Memory] 无法加载记忆: ${e.message}`);
    }
  }
  return null;
}

// 保存项目记忆
function saveMemory(key, value) {
  let memory = {};
  if (fs.existsSync(PROJECT_MEMORY)) {
    try {
      memory = JSON.parse(fs.readFileSync(PROJECT_MEMORY, 'utf8'));
    } catch (e) {}
  }

  memory[key] = {
    value,
    timestamp: new Date().toISOString(),
    session: process.pid
  };

  fs.writeFileSync(PROJECT_MEMORY, JSON.stringify(memory, null, 2));
  console.error(`[Memory] 已保存记忆: ${key}`);
}

// 从环境变量获取操作类型
const operation = process.env.MEMORY_OP || 'load';

if (operation === 'load') {
  loadMemory();
} else if (operation === 'save') {
  const key = process.env.MEMORY_KEY;
  const value = process.env.MEMORY_VALUE;
  if (key && value) {
    saveMemory(key, value);
  }
}

module.exports = { loadMemory, saveMemory };
