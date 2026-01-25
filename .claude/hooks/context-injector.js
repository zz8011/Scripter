#!/usr/bin/env node
/**
 * 上下文注入器 Hook
 *
 * 智能注入相关上下文文件
 * 根据任务关键词匹配相关文档
 */

const fs = require('fs');
const path = require('path');

// 关键词到文档的映射
const KEYWORD_DOC_MAP = {
  // PRD 相关
  'prd': 'docs/prd/prd-v2.5.md',
  '产品需求': 'docs/prd/prd-v2.5.md',
  '需求文档': 'docs/prd/prd-v2.5.md',
  '功能需求': 'docs/prd/prd-v2.5.md',

  // 技术栈
  '技术栈': 'docs/tech/tech-stack.md',
  'tech stack': 'docs/tech/tech-stack.md',
  '技术选型': 'docs/tech/tech-stack.md',

  // 数据模型
  '数据模型': 'docs/tech/data-model.md',
  'data model': 'docs/tech/data-model.md',
  '数据库': 'docs/tech/data-model.md',
  'schema': 'docs/tech/data-model.md',

  // 设计系统
  '设计系统': 'docs/design/ui-design-system.md',
  'ui design': 'docs/design/ui-design-system.md',
  '设计规范': 'docs/design/ui-design-system.md',
  'design system': 'docs/design/ui-design-system.md',

  // 设计上下文
  'design context': 'docs/design/.claude/design-context.md',
  '设计速查': 'docs/design/.claude/design-context.md',
  '色彩': 'docs/design/.claude/design-context.md',
  '组件': 'docs/design/.claude/design-context.md',

  // 实施计划
  '实施计划': 'docs/plans/plan-sprint-mvp.md',
  'sprint': 'docs/plans/plan-sprint-mvp.md',
  '开发计划': 'docs/plans/plan-sprint-mvp.md',

  // 工作流
  '工作流': 'docs/guides/scientific-dev-workflow.md',
  'workflow': 'docs/guides/scientific-dev-workflow.md',
  '开发流程': 'docs/guides/scientific-dev-workflow.md',

  // 产品定位
  '产品定位': 'docs/product-positioning.md',
  'positioning': 'docs/product-positioning.md',

  // 商业模式
  '商业模式': 'docs/business-model.md',
  'business model': 'docs/business-model.md',

  // 风险分析
  '风险分析': 'docs/risk-analysis.md',
  'risk': 'docs/risk-analysis.md'
};

// 会话类型到默认文档的映射
const SESSION_TYPE_DEFAULT_DOCS = {
  feature_dev: [
    'docs/prd/prd-v2.5.md',
    'docs/tech/tech-stack.md',
    'docs/tech/data-model.md'
  ],
  ui_dev: [
    'docs/design/ui-design-system.md',
    'docs/design/.claude/design-context.md'
  ],
  bug_fix: [
    'docs/tech/tech-stack.md'
  ],
  planning: [
    'docs/prd/prd-v2.5.md',
    'docs/plans/plan-sprint-mvp.md'
  ],
  testing: [
    'docs/tech/tech-stack.md'
  ]
};

// 估算文件的 token 数量
function estimateTokens(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    // 粗略估算：中文约 1.5 字符/token，英文约 4 字符/token
    const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishChars = content.length - chineseChars;
    return Math.ceil(chineseChars / 1.5 + englishChars / 4);
  } catch (e) {
    return 0;
  }
}

// 匹配相关文档
function matchDocuments(userPrompt) {
  if (!userPrompt) return [];

  const prompt = userPrompt.toLowerCase();
  const matchedDocs = [];
  const seen = new Set();

  // 基于关键词匹配
  for (const [keyword, docPath] of Object.entries(KEYWORD_DOC_MAP)) {
    if (prompt.includes(keyword.toLowerCase()) && !seen.has(docPath)) {
      const fullPath = path.join(process.cwd(), docPath);
      if (fs.existsSync(fullPath)) {
        matchedDocs.push({
          path: docPath,
          fullPath,
          reason: `关键词匹配: "${keyword}"`,
          priority: 'high'
        });
        seen.add(docPath);
      }
    }
  }

  return matchedDocs;
}

// 按优先级和 token 数量排序
function prioritizeDocs(docs, maxTokens = 30000) {
  const priorityValue = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
  };

  // 计算每个文档的分数
  const docsWithScore = docs.map(doc => ({
    ...doc,
    tokens: estimateTokens(doc.fullPath),
    score: priorityValue[doc.priority] || 1
  }));

  // 按分数排序
  docsWithScore.sort((a, b) => b.score - a.score);

  // 选择文档直到达到 token 上限
  const selected = [];
  let totalTokens = 0;

  for (const doc of docsWithScore) {
    if (totalTokens + doc.tokens <= maxTokens) {
      selected.push(doc);
      totalTokens += doc.tokens;
    }
  }

  return { selected, totalTokens, skipped: docsWithScore.slice(selected.length) };
}

// 生成注入建议
function generateInjectionSuggestions(matchedDocs, sessionType) {
  console.error('\n========================================');
  console.error('📄 上下文注入建议');
  console.error('========================================\n');

  if (matchedDocs.length === 0) {
    console.error('未找到匹配的文档');
    console.error('💡 建议: 手动读取相关文档（如 PRD、技术栈等）');
    return [];
  }

  // 添加会话类型的默认文档
  const defaultDocs = SESSION_TYPE_DEFAULT_DOCS[sessionType] || [];
  for (const docPath of defaultDocs) {
    const fullPath = path.join(process.cwd(), docPath);
    if (fs.existsSync(fullPath) && !matchedDocs.find(d => d.path === docPath)) {
      matchedDocs.push({
        path: docPath,
        fullPath,
        reason: `会话类型默认文档 (${sessionType})`,
        priority: 'medium'
      });
    }
  }

  // 优先级排序和 token 限制
  const { selected, totalTokens, skipped } = prioritizeDocs(matchedDocs);

  console.error(`📊 匹配到 ${matchedDocs.length} 个文档，建议注入 ${selected.length} 个\n`);

  if (selected.length > 0) {
    console.error('✅ 建议注入的文档:\n');

    for (const doc of selected) {
      const tokens = estimateTokens(doc.fullPath);
      const priorityIcon = {
        critical: '🔴',
        high: '🟠',
        medium: '🟡',
        low: '🟢'
      }[doc.priority] || '⚪';

      console.error(`${priorityIcon} ${doc.path}`);
      console.error(`   原因: ${doc.reason}`);
      console.error(`   预估: ~${tokens} tokens`);
      console.error('');
    }

    console.error(`📊 总计: ~${totalTokens} tokens`);
  }

  if (skipped.length > 0) {
    console.error('\n⏭️  跳过的文档 (token 限制):\n');
    for (const doc of skipped) {
      const tokens = estimateTokens(doc.fullPath);
      console.error(`   - ${doc.path} (~${tokens} tokens)`);
    }
    console.error('\n💡 提示: 可手动读取这些文档的特定章节');
  }

  console.error('\n========================================\n');

  return selected;
}

// 主函数
function main() {
  // 从环境变量获取用户提示和会话类型
  const userPrompt = process.env.USER_PROMPT || '';
  const sessionType = process.env.SESSION_TYPE || 'general';

  // 匹配文档
  const matchedDocs = matchDocuments(userPrompt);

  // 生成建议
  const selectedDocs = generateInjectionSuggestions(matchedDocs, sessionType);

  // 输出读取命令供参考
  if (selectedDocs.length > 0) {
    console.error('📖 建议的读取命令:\n');
    console.error('```');
    for (const doc of selectedDocs.slice(0, 3)) {
      console.error(`Read("${doc.path}")`);
    }
    if (selectedDocs.length > 3) {
      console.error(`# ... 还有 ${selectedDocs.length - 3} 个文档`);
    }
    console.error('```\n');
  }

  return selectedDocs;
}

// 执行
const result = main();

module.exports = { main, matchDocuments, prioritizeDocs };
