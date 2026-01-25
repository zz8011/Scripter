#!/usr/bin/env node
/**
 * 阶段追踪器 Hook
 *
 * 追踪会话所处阶段（探索/规划/实施/测试/调试）
 * 在阶段转换时提醒用户保存进度
 */

const fs = require('fs');
const path = require('path');

const SESSION_STATE = path.join(process.cwd(), '.claude', 'session-state.json');
const PHASE_LOG = path.join(process.cwd(), '.claude', 'phase-log.json');

// 会话阶段定义
const PHASES = {
  exploration: {
    name: '探索阶段',
    keywords: ['探索', '了解', '查看', '分析', 'exploring', 'understand', 'analyze', 'find'],
    icon: '🔍',
    compact_advice: '是压缩的好时机，已收集足够信息'
  },
  planning: {
    name: '规划阶段',
    keywords: ['计划', '规划', '设计', '方案', 'plan', 'design', 'architecture'],
    icon: '📋',
    compact_advice: '是压缩的好时机，规划已完成'
  },
  implementation: {
    name: '实施阶段',
    keywords: ['实现', '开发', '编写', '创建', 'implement', 'develop', 'create', 'write'],
    icon: '🔨',
    compact_advice: '建议等里程碑完成后再压缩'
  },
  testing: {
    name: '测试阶段',
    keywords: ['测试', '验证', '运行', 'test', 'verify', 'run'],
    icon: '🧪',
    compact_advice: '不建议压缩，保持测试上下文'
  },
  debugging: {
    name: '调试阶段',
    keywords: ['修复', '调试', '错误', 'bug', 'fix', 'debug', 'error'],
    icon: '🐛',
    compact_advice: '不建议压缩，保持错误信息上下文'
  },
  review: {
    name: '审查阶段',
    keywords: ['审查', '检查', 'review', 'check', 'audit'],
    icon: '👀',
    compact_advice: '是压缩的好时机'
  }
};

// 从对话历史检测当前阶段
function detectPhase(conversation) {
  // 如果没有对话历史，默认探索阶段
  if (!conversation || conversation.length === 0) {
    return 'exploration';
  }

  // 获取最近的对话（最后 10 条）
  const recent = conversation.slice(-10);
  const recentText = recent.map(m => m.content || '').join(' ').toLowerCase();

  // 计算每个阶段的匹配分数
  const scores = {};
  for (const [phase, config] of Object.entries(PHASES)) {
    scores[phase] = 0;
    for (const keyword of config.keywords) {
      const regex = new RegExp(keyword.toLowerCase(), 'g');
      const matches = recentText.match(regex);
      if (matches) {
        scores[phase] += matches.length;
      }
    }
  }

  // 返回分数最高的阶段
  let maxScore = 0;
  let detectedPhase = 'exploration';
  for (const [phase, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedPhase = phase;
    }
  }

  return detectedPhase;
}

// 读取上次阶段
function loadLastPhase() {
  if (fs.existsSync(SESSION_STATE)) {
    try {
      const state = JSON.parse(fs.readFileSync(SESSION_STATE, 'utf8'));
      return state.current_phase || 'exploration';
    } catch (e) {}
  }
  return 'exploration';
}

// 保存当前阶段
function saveCurrentPhase(phase) {
  let state = {};
  if (fs.existsSync(SESSION_STATE)) {
    try {
      state = JSON.parse(fs.readFileSync(SESSION_STATE, 'utf8'));
    } catch (e) {}
  }

  state.current_phase = phase;
  state.phase_updated_at = new Date().toISOString();

  fs.writeFileSync(SESSION_STATE, JSON.stringify(state, null, 2));
}

// 记录阶段历史
function logPhaseChange(oldPhase, newPhase, reason) {
  let logs = [];
  if (fs.existsSync(PHASE_LOG)) {
    try {
      logs = JSON.parse(fs.readFileSync(PHASE_LOG, 'utf8'));
    } catch (e) {}
  }

  logs.push({
    timestamp: new Date().toISOString(),
    from: oldPhase,
    to: newPhase,
    reason
  });

  // 只保留最近 50 条记录
  if (logs.length > 50) {
    logs = logs.slice(-50);
  }

  fs.writeFileSync(PHASE_LOG, JSON.stringify(logs, null, 2));
}

// 显示阶段信息
function displayPhaseInfo(phase) {
  const config = PHASES[phase];

  console.error('\n========================================');
  console.error(`${config.icon} 当前阶段: ${config.name}`);
  console.error('========================================\n');

  console.error(`💡 压缩建议: ${config.compact_advice}`);

  // 根据阶段给出具体建议
  switch (phase) {
    case 'exploration':
      console.error('\n📌 建议:');
      console.error('   - 已收集足够信息后，使用 /plan 进入规划');
      console.error('   - 压缩时可保留探索发现的关键信息');
      break;
    case 'planning':
      console.error('\n📌 建议:');
      console.error('   - 计划完成后，使用 ExitPlanMode 开始实施');
      console.error('   - 压缩时保留最终计划文件路径');
      break;
    case 'implementation':
      console.error('\n📌 建议:');
      console.error('   - 按任务里程碑分批实现');
      console.error('   - 完成每个里程碑后考虑压缩');
      console.error('   - 保留当前任务的上下文');
      break;
    case 'testing':
      console.error('\n📌 建议:');
      console.error('   - 保持测试失败信息上下文');
      console.error('   - 避免在调试测试时压缩');
      break;
    case 'debugging':
      console.error('\n📌 建议:');
      console.error('   - 保持错误堆栈和相关信息');
      console.error('   - 问题解决前不要压缩');
      break;
    case 'review':
      console.error('\n📌 建议:');
      console.error('   - 审查完成后可以压缩');
      console.error('   - 保留审查结论和改进建议');
      break;
  }

  console.error('\n========================================\n');
}

// 显示阶段转换提示
function displayPhaseTransition(from, to) {
  const fromConfig = PHASES[from];
  const toConfig = PHASES[to];

  console.error('\n========================================');
  console.error('🔄 阶段转换');
  console.error('========================================\n');
  console.error(`${fromConfig.icon} ${fromConfig.name} → ${toConfig.icon} ${toConfig.name}`);
  console.error(`\n💡 建议: ${toConfig.compact_advice}`);

  // 根据转换给出具体建议
  if (from === 'planning' && to === 'implementation') {
    console.error('\n📝 准备开始实施:');
    console.error('   - 确保计划已保存到文件');
    console.error('   - 考虑先压缩，然后开始实施');
  } else if (from === 'implementation' && to === 'testing') {
    console.error('\n🧪 准备开始测试:');
    console.error('   - 保留实施相关的上下文');
    console.error('   - 暂时不要压缩');
  } else if (from === 'testing' && to === 'debugging') {
    console.error('\n🐛 进入调试模式:');
    console.error('   - 保持测试失败信息');
    console.error('   - 不要压缩直到问题解决');
  }

  console.error('\n========================================\n');

  // 提示更新进度文档
  console.error('⚠️  建议更新进度文档:');
  console.error(`   echo "- [ ] 完成${fromConfig.name}，进入${toConfig.name}" >> docs/progress.md\n`);
}

// 主函数
function main() {
  // 从环境变量获取对话历史（如果有）
  const conversationEnv = process.env.CONVERSATION_HISTORY;
  let conversation = [];

  if (conversationEnv) {
    try {
      conversation = JSON.parse(conversationEnv);
    } catch (e) {
      // 忽略解析错误
    }
  }

  // 检测当前阶段
  const currentPhase = detectPhase(conversation);

  // 读取上次阶段
  const lastPhase = loadLastPhase();

  // 检查是否发生阶段转换
  if (currentPhase !== lastPhase) {
    displayPhaseTransition(lastPhase, currentPhase);
    logPhaseChange(lastPhase, currentPhase, '自动检测');
  }

  // 保存当前阶段
  saveCurrentPhase(currentPhase);

  // 显示阶段信息
  displayPhaseInfo(currentPhase);

  return {
    currentPhase,
    lastPhase,
    phaseChanged: currentPhase !== lastPhase,
    config: PHASES[currentPhase]
  };
}

// 执行
const result = main();

module.exports = { main, detectPhase, PHASES };
