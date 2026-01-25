#!/usr/bin/env node
/**
 * 智能压缩提示 Hook v2
 *
 * 基于语义相似度和逻辑断点检测
 * 在合适的时机提示压缩，避免丢失关键信息
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const COUNTER_FILE = path.join(os.tmpdir(), `claude-tool-count-${process.pid}`);
const SESSION_STATE = path.join(process.cwd(), '.claude', 'session-state.json');
const THRESHOLD = parseInt(process.env.COMPACT_THRESHOLD || '50');

// 工具调用计数
let count = 0;
if (fs.existsSync(COUNTER_FILE)) {
  count = parseInt(fs.readFileSync(COUNTER_FILE, 'utf8') || '0');
}
count++;
fs.writeFileSync(COUNTER_FILE, count.toString());

// 逻辑断点检测
function detectLogicalBreakpoint() {
  // 检查会话状态
  if (!fs.existsSync(SESSION_STATE)) {
    return { detected: false, reason: '无会话状态' };
  }

  try {
    const state = JSON.parse(fs.readFileSync(SESSION_STATE, 'utf8'));

    // 检测阶段变化
    if (state.phase_changed) {
      return {
        detected: true,
        type: 'phase_change',
        reason: `阶段从 ${state.last_phase} 变为 ${state.current_phase}`,
        priority: 'high'
      };
    }

    // 检测任务完成（从环境变量）
    const taskCompleted = process.env.TASK_COMPLETED === 'true';
    if (taskCompleted) {
      return {
        detected: true,
        type: 'task_complete',
        reason: '任务已完成',
        priority: 'high'
      };
    }

    // 检测里程碑完成（从环境变量）
    const milestoneReached = process.env.MILESTONE_REACHED === 'true';
    if (milestoneReached) {
      return {
        detected: true,
        type: 'milestone_reached',
        reason: '里程碑已达成',
        priority: 'high'
      };
    }

    return { detected: false, reason: '无逻辑断点' };
  } catch (e) {
    return { detected: false, reason: `无法读取状态: ${e.message}` };
  }
}

// 读取当前阶段
function getCurrentPhase() {
  if (!fs.existsSync(SESSION_STATE)) {
    return 'exploration';
  }

  try {
    const state = JSON.parse(fs.readFileSync(SESSION_STATE, 'utf8'));
    return state.current_phase || 'exploration';
  } catch (e) {
    return 'exploration';
  }
}

// 阶段压缩建议
function getPhaseAdvice(phase) {
  const advice = {
    exploration: {
      shouldCompact: true,
      reason: '探索阶段已收集足够信息',
      advice: '可压缩，保留关键发现'
    },
    planning: {
      shouldCompact: true,
      reason: '规划已完成',
      advice: '强烈建议压缩，保留最终计划'
    },
    implementation: {
      shouldCompact: false,
      reason: '实施进行中',
      advice: '建议等里程碑完成后再压缩'
    },
    testing: {
      shouldCompact: false,
      reason: '测试进行中',
      advice: '不建议压缩，保持测试上下文'
    },
    debugging: {
      shouldCompact: false,
      reason: '调试进行中',
      advice: '强烈建议不要压缩，保持错误信息'
    },
    review: {
      shouldCompact: true,
      reason: '审查阶段',
      advice: '可压缩，保留审查结论'
    }
  };

  return advice[phase] || { shouldCompact: false, reason: '未知阶段', advice: '谨慎压缩' };
}

// 生成压缩前摘要
function generateCompactSummary() {
  const summary = [];

  // 读取会话状态
  if (fs.existsSync(SESSION_STATE)) {
    try {
      const state = JSON.parse(fs.readFileSync(SESSION_STATE, 'utf8'));
      summary.push(`## 会话状态`);
      summary.push(`- 当前阶段: ${state.current_phase || 'unknown'}`);
      summary.push(`- 阶段更新时间: ${state.phase_updated_at || 'unknown'}`);
      summary.push(`- 会话 ID: ${state.last_session_id || 'unknown'}`);
      summary.push('');
    } catch (e) {}
  }

  // 读取项目记忆
  const memoryPath = path.join(process.cwd(), '.claude', 'memory.json');
  if (fs.existsSync(memoryPath)) {
    try {
      const memory = JSON.parse(fs.readFileSync(memoryPath, 'utf8'));
      summary.push(`## 项目状态`);
      if (memory.project_state) {
        summary.push(`- 当前 Sprint: ${memory.project_state.current_sprint || 'unknown'}`);
        summary.push(`- 阶段: ${memory.project_state.phase || 'unknown'}`);
      }
      if (memory.recent_work && memory.recent_work.length > 0) {
        summary.push(`- 最近工作: ${memory.recent_work.slice(-3).join(', ')}`);
      }
      summary.push('');
    } catch (e) {}
  }

  return summary.join('\n');
}

// 显示压缩提示
function displayCompactPrompt(reason, priority, phase) {
  const phaseAdvice = getPhaseAdvice(phase);

  console.error('\n========================================');
  console.error('💬 压缩提示');
  console.error('========================================\n');

  console.error(`📍 触发原因: ${reason}`);
  console.error(`🔑 优先级: ${priority === 'high' ? '🔴 高' : '🟡 中'}`);
  console.error(`🎯 当前阶段: ${phase}`);

  console.error(`\n${phaseAdvice.shouldCompact ? '✅' : '⚠️'} ${phaseAdvice.reason}`);
  console.error(`💡 建议: ${phaseAdvice.advice}`);

  // 如果是高优先级，显示压缩摘要
  if (priority === 'high' && phaseAdvice.shouldCompact) {
    console.error('\n📋 压缩前摘要:');
    console.error('---');
    console.error(generateCompactSummary());
    console.error('---');
  }

  console.error('\n========================================\n');
}

// 主函数
function main() {
  // 检测逻辑断点
  const breakpoint = detectLogicalBreakpoint();

  // 获取当前阶段
  const phase = getCurrentPhase();
  const phaseAdvice = getPhaseAdvice(phase);

  // 在阈值时提示
  if (count === THRESHOLD) {
    displayCompactPrompt(
      `已进行 ${THRESHOLD} 次工具调用`,
      'medium',
      phase
    );
  }

  // 定期提示（每 25 次）
  if (count > THRESHOLD && count % 25 === 0) {
    displayCompactPrompt(
      `已进行 ${count} 次工具调用`,
      'medium',
      phase
    );
  }

  // 检测到逻辑断点时提示
  if (breakpoint.detected) {
    displayCompactPrompt(
      breakpoint.reason,
      breakpoint.priority,
      phase
    );
  }

  // 如果在压缩时给出了建议，不要重复提示
  if (phaseAdvice.shouldCompact && breakpoint.detected && breakpoint.priority === 'high') {
    console.error('🔄 这是一个很好的压缩时机！\n');
  } else if (!phaseAdvice.shouldCompact) {
    console.error(`⚠️  ${phaseAdvice.advice}\n`);
  }

  return {
    count,
    phase,
    phaseAdvice,
    breakpoint
  };
}

// 执行
const result = main();

module.exports = { main, detectLogicalBreakpoint, getPhaseAdvice };
