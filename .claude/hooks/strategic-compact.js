#!/usr/bin/env node
/**
 * 策略性压缩提示 Hook
 *
 * 在合适的时机提示用户手动压缩，而不是依赖自动压缩
 * 避免在任务中间压缩导致上下文丢失
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const COUNTER_FILE = path.join(os.tmpdir(), `claude-tool-count-${process.pid}`);
const THRESHOLD = process.env.COMPACT_THRESHOLD || 50;
const PHASE_FILE = path.join(os.tmpdir(), `claude-phase-${process.pid}`);

// 工具调用计数
let count = 0;
if (fs.existsSync(COUNTER_FILE)) {
  count = parseInt(fs.readFileSync(COUNTER_FILE, 'utf8') || '0');
}
count++;
fs.writeFileSync(COUNTER_FILE, count.toString());

// 检测当前阶段
const PHASES = {
  EXPLORING: '探索中',
  PLANNING: '规划中',
  IMPLEMENTING: '实施中',
  TESTING: '测试中',
  DEBUGGING: '调试中'
};

function getCurrentPhase() {
  if (fs.existsSync(PHASE_FILE)) {
    return fs.readFileSync(PHASE_FILE, 'utf8').trim();
  }
  return 'EXPLORING';
}

function suggestCompact() {
  const phase = getCurrentPhase();

  // 根据不同阶段给出建议
  const suggestions = {
    EXPLORING: '探索阶段完成，建议先总结发现再压缩',
    PLANNING: '计划已确定，是压缩的好时机',
    IMPLEMENTING: '实施进行中，建议等里程碑完成后再压缩',
    TESTING: '测试进行中，建议不压缩',
    DEBUGGING: '调试过程中，强烈建议不要压缩'
  };

  return suggestions[phase] || '可考虑压缩';
}

// 在阈值时提示
if (count === parseInt(THRESHOLD)) {
  console.error(`[StrategicCompact] 已进行 ${THRESHOLD} 次工具调用`);
  console.error(`[StrategicCompact] ${suggestCompact()}`);
  console.error(`[StrategicCompact] 使用 /plan 或手动压缩来保持上下文清晰`);
}

// 定期提示（每25次）
if (count > parseInt(THRESHOLD) && count % 25 === 0) {
  console.error(`[StrategicCompact] 已进行 ${count} 次工具调用`);
  console.error(`[StrategicCompact] 如果上下文陈旧，考虑压缩`);
}
