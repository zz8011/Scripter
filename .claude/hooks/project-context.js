#!/usr/bin/env node
/**
 * 项目上下文提示 Hook
 *
 * 在会话开始时提示读取项目级 CLAUDE.md
 * 确保 Claude 了解项目特定的开发规范
 */

const fs = require('fs');
const path = require('path');

const PROJECT_CLAUDE_MD = path.join(process.cwd(), 'CLAUDE.md');
const PRD_PATH = path.join(process.cwd(), 'docs', 'prd', 'prd-v2.5.md');

// 检查项目配置文件是否存在
function checkProjectContext() {
  console.error('\n========================================');
  console.error('📋 Scripter 项目配置检查');
  console.error('========================================\n');

  if (fs.existsSync(PROJECT_CLAUDE_MD)) {
    const stats = fs.statSync(PROJECT_CLAUDE_MD);
    const mtime = new Date(stats.mtime).toLocaleDateString('zh-CN');
    console.error(`✅ 项目级 CLAUDE.md 存在 (更新于: ${mtime})`);
    console.error(`   路径: ${PROJECT_CLAUDE_MD}`);
    console.error(`\n⚠️  重要: 请在会话开始时优先阅读此文件以了解:`);
    console.error(`   - PRD v2.5 作为核心指导文档的原则`);
    console.error(`   - 文档引用关系和单一真相来源模式`);
    console.error(`   - 开发工作流 (科学开发工作流)`);
    console.error(`   - UI 设计规范`);
    console.error(`   - 技术栈决策`);
  } else {
    console.error(`⚠️  项目级 CLAUDE.md 不存在`);
    console.error(`   预期路径: ${PROJECT_CLAUDE_MD}`);
  }

  console.error('');

  if (fs.existsSync(PRD_PATH)) {
    const stats = fs.statSync(PRD_PATH);
    const mtime = new Date(stats.mtime).toLocaleDateString('zh-CN');
    console.error(`✅ PRD v2.5 存在 (更新于: ${mtime})`);
    console.error(`   路径: ${PRD_PATH}`);
  } else {
    console.error(`⚠️  PRD v2.5 不存在`);
    console.error(`   预期路径: ${PRD_PATH}`);
  }

  console.error('\n========================================\n');

  // 返回建议的读取顺序
  return {
    shouldReadClaudeMd: fs.existsSync(PROJECT_CLAUDE_MD),
    shouldReadPRD: fs.existsSync(PRD_PATH)
  };
}

// 执行检查
const result = checkProjectContext();

// 输出建议
if (result.shouldReadClaudeMd || result.shouldReadPRD) {
  console.error('💡 建议的会话开始流程:\n');

  if (result.shouldReadClaudeMd) {
    console.error('   1. 读取项目级 CLAUDE.md');
    console.error('      "请阅读 CLAUDE.md 了解项目规范"');
  }

  if (result.shouldReadPRD) {
    console.error('   2. 如有具体开发任务，读取 PRD 相关章节');
    console.error('      "请阅读 docs/prd/prd-v2.5.md 中关于[功能]的部分"');
  }

  console.error('');
}

module.exports = { checkProjectContext };
