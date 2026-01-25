#!/usr/bin/env node
/**
 * 决策记录器 Hook
 *
 * 自动识别技术决策并记录
 * 更新 .claude/decisions.json 和 docs/tech/decisions.md
 */

const fs = require('fs');
const path = require('path');

const DECISIONS_LOG = path.join(process.cwd(), '.claude', 'decisions.json');
const DECISIONS_MD = path.join(process.cwd(), 'docs', 'tech', 'decisions.md');
const TECH_DOCS_DIR = path.join(process.cwd(), 'docs', 'tech');

// 技术决策关键词
const DECISION_KEYWORDS = [
  '选择', '采用', '决定', '使用', 'prefer',
  'choose', 'adopt', 'decide', 'use', 'select'
];

// 技术决策模式
const DECISION_PATTERNS = [
  /选择\s+(.+?)\s+(?:来|而不是|instead of|rather than)/i,
  /决定\s+使用\s+(.+?)\s+(?:因为|because|due to)/i,
  /采用\s+(.+?)\s+(?:方案|方案|solution)/i,
  /(?:使用|use|using)\s+(.+?)\s+(?:而不是|rather than|instead of)/i
];

// 检测是否是技术文件
function isTechnicalFile(filePath) {
  const techExtensions = [
    '.js', '.ts', '.jsx', '.tsx', '.vue', '.svelte',
    '.py', '.rb', '.go', '.rs', '.java',
    '.md', '.json', '.yaml', '.yml', '.toml',
    '.sql', '.prisma'
  ];

  const techDirs = [
    'src', 'lib', 'components', 'pages', 'app',
    'docs', 'config', '.claude', 'scripts'
  ];

  const ext = path.extname(filePath);
  const dir = path.dirname(filePath);

  return techExtensions.includes(ext) ||
    techDirs.some(d => dir.includes(d));
}

// 从消息中提取决策
function extractDecisionFromMessage(message) {
  if (!message || typeof message !== 'string') {
    return null;
  }

  const lowerMessage = message.toLowerCase();

  // 检查是否包含决策关键词
  const hasKeyword = DECISION_KEYWORDS.some(kw =>
    lowerMessage.includes(kw.toLowerCase())
  );

  if (!hasKeyword) {
    return null;
  }

  // 尝试匹配决策模式
  for (const pattern of DECISION_PATTERNS) {
    const match = message.match(pattern);
    if (match) {
      return {
        title: match[1].trim(),
        raw: match[0],
        confidence: 'high'
      };
    }
  }

  // 如果没有匹配模式但有关键词，返回低置信度决策
  return {
    title: message.substring(0, 100),
    raw: message,
    confidence: 'low'
  };
}

// 读取现有决策日志
function loadDecisionsLog() {
  if (fs.existsSync(DECISIONS_LOG)) {
    try {
      const log = JSON.parse(fs.readFileSync(DECISIONS_LOG, 'utf8'));
      return log.decisions || [];
    } catch (e) {}
  }
  return [];
}

// 保存决策日志
function saveDecisionsLog(decisions) {
  const log = {
    last_updated: new Date().toISOString(),
    total_count: decisions.length,
    decisions
  };

  // 确保 tech 文档目录存在
  if (!fs.existsSync(TECH_DOCS_DIR)) {
    fs.mkdirSync(TECH_DOCS_DIR, { recursive: true });
  }

  fs.writeFileSync(DECISIONS_LOG, JSON.stringify(log, null, 2));
}

// 添加新决策
function addDecision(decision, context) {
  const decisions = loadDecisionsLog();

  // 检查是否已存在类似决策
  const exists = decisions.some(d =>
    d.title.toLowerCase() === decision.title.toLowerCase()
  );

  if (exists) {
    console.error(`[DecisionLogger] ℹ️  决策已存在: ${decision.title}`);
    return false;
  }

  const newDecision = {
    id: `decision-${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    title: decision.title,
    confidence: decision.confidence,
    context: {
      file: context.file || 'unknown',
      operation: context.operation || 'unknown',
      session: process.pid
    }
  };

  decisions.push(newDecision);
  saveDecisionsLog(decisions);

  console.error(`[DecisionLogger] ✅ 记录决策: ${newDecision.title}`);
  console.error(`[DecisionLogger] 📋 ID: ${newDecision.id}`);
  console.error(`[DecisionLogger] 📁 文件: ${context.file}`);

  return true;
}

// 更新 Markdown 决策文档
function updateDecisionsMarkdown() {
  const decisions = loadDecisionsLog();

  if (decisions.length === 0) {
    return;
  }

  // 确保 tech 文档目录存在
  if (!fs.existsSync(TECH_DOCS_DIR)) {
    fs.mkdirSync(TECH_DOCS_DIR, { recursive: true });
  }

  // 生成 Markdown 内容
  const content = generateDecisionsMarkdown(decisions);

  fs.writeFileSync(DECISIONS_MD, content, 'utf8');
  console.error(`[DecisionLogger] 📄 已更新: ${DECISIONS_MD}`);
}

// 生成 Markdown 决策文档
function generateDecisionsMarkdown(decisions) {
  const lines = [];

  lines.push('# 技术决策记录');
  lines.push('');
  lines.push('> 本文档由决策记录器自动生成和维护');
  lines.push('> ');
  lines.push(`> 最后更新: ${new Date().toLocaleString('zh-CN')}`);
  lines.push('> ');
  lines.push(`> 总决策数: ${decisions.length}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // 按时间倒序排列
  const sorted = [...decisions].reverse();

  // 按日期分组
  const byDate = {};
  for (const decision of sorted) {
    const date = decision.timestamp.split('T')[0];
    if (!byDate[date]) {
      byDate[date] = [];
    }
    byDate[date].push(decision);
  }

  // 生成内容
  for (const [date, items] of Object.entries(byDate)) {
    lines.push(`## ${date}`);
    lines.push('');

    for (const decision of items) {
      const time = decision.timestamp.split('T')[1].substring(0, 8);
      const confidenceIcon = {
        high: '✅',
        medium: '⚠️',
        low: '❓'
      }[decision.confidence] || '⚪';

      lines.push(`### ${confidenceIcon} ${decision.title}`);
      lines.push('');
      lines.push(`**ID**: \`${decision.id}\`  `);
      lines.push(`**时间**: ${date} ${time}  `);
      lines.push(`**文件**: ${decision.context.file}  `);
      lines.push(`**操作**: ${decision.context.operation}  `);
      lines.push('');
    }
  }

  return lines.join('\n');
}

// 主函数
function main() {
  // 从环境变量获取上下文
  const toolName = process.env.TOOL_NAME || '';
  const filePath = process.env.FILE_PATH || '';
  const userMessage = process.env.USER_MESSAGE || '';

  // 只在 Edit/Write 技术文件时运行
  if (!['Edit', 'Write'].includes(toolName)) {
    return;
  }

  if (!isTechnicalFile(filePath)) {
    return;
  }

  // 尝试提取决策
  const decision = extractDecisionFromMessage(userMessage);

  if (decision) {
    // 添加到日志
    const added = addDecision(decision, {
      file: filePath,
      operation: toolName
    });

    if (added) {
      // 更新 Markdown 文档
      updateDecisionsMarkdown();
    }
  }

  return {
    decision,
    logged: !!decision
  };
}

// 执行
const result = main();

module.exports = { main, addDecision, updateDecisionsMarkdown };
