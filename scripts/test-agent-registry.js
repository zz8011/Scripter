#!/usr/bin/env node
/**
 * Agent 注册系统测试脚本
 *
 * 验证 Agent 注册表的完整性和功能
 */

const fs = require('fs');
const path = require('path');

const REGISTRY_FILE = path.join(process.cwd(), '.claude', 'agent-registry.json');
const SCHEMA_FILE = path.join(process.cwd(), '.claude', 'agent-registry-schema.json');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

// 测试结果
const results = {
  passed: [],
  failed: [],
  warnings: []
};

// 测试 1: 验证注册表文件存在
function testRegistryExists() {
  console.log('\n📋 测试 1: 验证注册表文件存在');

  if (fs.existsSync(REGISTRY_FILE)) {
    log(colors.green, '  ✅ 注册表文件存在');
    results.passed.push('注册表文件存在');
    return true;
  } else {
    log(colors.red, '  ❌ 注册表文件不存在');
    results.failed.push('注册表文件不存在');
    return false;
  }
}

// 测试 2: 验证 JSON 格式
function testJsonFormat() {
  console.log('\n📋 测试 2: 验证 JSON 格式');

  try {
    const registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
    log(colors.green, '  ✅ 注册表 JSON 格式正确');
    results.passed.push('注册表 JSON 格式正确');
    return registry;
  } catch (e) {
    log(colors.red, `  ❌ JSON 格式错误: ${e.message}`);
    results.failed.push(`JSON 格式错误: ${e.message}`);
    return null;
  }
}

// 测试 3: 验证必需字段
function testRequiredFields(registry) {
  console.log('\n📋 测试 3: 验证必需字段');

  const required = ['version', 'registry', 'metadata'];
  let allPresent = true;

  for (const field of required) {
    if (registry[field]) {
      log(colors.green, `  ✅ 字段 "${field}" 存在`);
      results.passed.push(`字段 "${field}" 存在`);
    } else {
      log(colors.red, `  ❌ 缺少必需字段 "${field}"`);
      results.failed.push(`缺少必需字段 "${field}"`);
      allPresent = false;
    }
  }

  return allPresent;
}

// 测试 4: 验证 Agent 定义
function testAgentDefinitions(registry) {
  console.log('\n📋 测试 4: 验证 Agent 定义');

  const agents = registry.registry;
  let allValid = true;

  for (const [id, agent] of Object.entries(agents)) {
    console.log(`\n  检查 Agent: ${id}`);

    // 必需字段
    const required = ['id', 'name', 'description', 'type', 'definition', 'capabilities'];
    for (const field of required) {
      if (agent[field]) {
        log(colors.green, `    ✅ ${field}: ${agent[field]}`);
      } else {
        log(colors.red, `    ❌ 缺少字段: ${field}`);
        results.failed.push(`Agent ${id} 缺少字段 ${field}`);
        allValid = false;
      }
    }

    // 验证定义文件存在
    const defPath = path.join(process.cwd(), agent.definition);
    if (fs.existsSync(defPath)) {
      log(colors.green, `    ✅ 定义文件存在`);
    } else {
      log(colors.yellow, `    ⚠️  定义文件不存在: ${agent.definition}`);
      results.warnings.push(`Agent ${id} 定义文件不存在`);
    }

    // 验证类型
    const validTypes = ['orchestrator', 'specialist', 'general'];
    if (validTypes.includes(agent.type)) {
      log(colors.green, `    ✅ 类型有效: ${agent.type}`);
    } else {
      log(colors.red, `    ❌ 无效类型: ${agent.type}`);
      results.failed.push(`Agent ${id} 类型无效`);
      allValid = false;
    }
  }

  return allValid;
}

// 测试 5: 验证工作流定义
function testWorkflowDefinitions(registry) {
  console.log('\n📋 测试 5: 验证工作流定义');

  const workflows = registry.workflows;
  const agents = registry.registry;
  let allValid = true;

  for (const [id, workflow] of Object.entries(workflows)) {
    console.log(`\n  检查工作流: ${id}`);

    // 验证协调器存在
    if (agents[workflow.orchestrator]) {
      log(colors.green, `    ✅ 协调器存在: ${workflow.orchestrator}`);
    } else {
      log(colors.red, `    ❌ 协调器不存在: ${workflow.orchestrator}`);
      results.failed.push(`工作流 ${id} 协调器不存在`);
      allValid = false;
    }

    // 验证步骤
    if (workflow.steps && workflow.steps.length > 0) {
      log(colors.green, `    ✅ 步骤定义: ${workflow.steps.length} 个阶段`);

      for (const step of workflow.steps) {
        console.log(`      阶段: ${step.phase}`);

        // 验证 agents 存在
        for (const agentId of step.agents) {
          if (agents[agentId]) {
            log(colors.green, `        ✅ Agent 存在: ${agentId}`);
          } else {
            log(colors.red, `        ❌ Agent 不存在: ${agentId}`);
            results.failed.push(`工作流 ${id} 引用不存在的 agent ${agentId}`);
            allValid = false;
          }
        }
      }
    } else {
      log(colors.red, `    ❌ 缺少步骤定义`);
      results.failed.push(`工作流 ${id} 缺少步骤`);
      allValid = false;
    }
  }

  return allValid;
}

// 测试 6: 验证元数据一致性
function testMetadataConsistency(registry) {
  console.log('\n📋 测试 6: 验证元数据一致性');

  const metadata = registry.metadata;
  const agentCount = Object.keys(registry.registry).length;
  const workflowCount = Object.keys(registry.workflows).length;
  let allValid = true;

  if (metadata.total_agents === agentCount) {
    log(colors.green, `  ✅ Agent 数量一致: ${agentCount}`);
    results.passed.push('Agent 数量一致');
  } else {
    log(colors.yellow, `  ⚠️  Agent 数量不一致: 元数据 ${metadata.total_agents}, 实际 ${agentCount}`);
    results.warnings.push('Agent 数量不一致');
  }

  if (metadata.total_workflows === workflowCount) {
    log(colors.green, `  ✅ 工作流数量一致: ${workflowCount}`);
    results.passed.push('工作流数量一致');
  } else {
    log(colors.yellow, `  ⚠️  工作流数量不一致: 元数据 ${metadata.total_workflows}, 实际 ${workflowCount}`);
    results.warnings.push('工作流数量不一致');
  }

  return allValid;
}

// 测试 7: 验证 Hook 配置
function testHookConfiguration() {
  console.log('\n📋 测试 7: 验证 Hook 配置');

  const settingsFile = path.join(process.cwd(), '.claude', 'settings.local.json');

  if (!fs.existsSync(settingsFile)) {
    log(colors.yellow, '  ⚠️  settings.local.json 不存在');
    results.warnings.push('settings.local.json 不存在');
    return false;
  }

  try {
    const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
    const sessionHooks = settings.hooks?.SessionStart?.[0]?.hooks || [];

    const hasRegistryLoader = sessionHooks.some(hook =>
      hook.command && hook.command.includes('agent-registry-loader.js')
    );

    if (hasRegistryLoader) {
      log(colors.green, '  ✅ agent-registry-loader Hook 已配置');
      results.passed.push('agent-registry-loader Hook 已配置');
      return true;
    } else {
      log(colors.yellow, '  ⚠️  agent-registry-loader Hook 未配置');
      results.warnings.push('agent-registry-loader Hook 未配置');
      return false;
    }
  } catch (e) {
    log(colors.red, `  ❌ 无法读取 settings.local.json: ${e.message}`);
    results.failed.push(`无法读取 settings: ${e.message}`);
    return false;
  }
}

// 生成测试报告
function generateReport() {
  console.log('\n========================================');
  log(colors.cyan, '📊 测试报告');
  console.log('========================================\n');

  console.log(`✅ 通过: ${results.passed.length}`);
  console.log(`❌ 失败: ${results.failed.length}`);
  console.log(`⚠️  警告: ${results.warnings.length}\n`);

  if (results.failed.length > 0) {
    log(colors.red, '失败的测试:\n');
    for (const failure of results.failed) {
      log(colors.red, `  • ${failure}`);
    }
    console.log('');
  }

  if (results.warnings.length > 0) {
    log(colors.yellow, '警告:\n');
    for (const warning of results.warnings) {
      log(colors.yellow, `  • ${warning}`);
    }
    console.log('');
  }

  const allPassed = results.failed.length === 0;
  if (allPassed) {
    log(colors.green, '🎉 所有测试通过！Agent 注册系统可以正常使用。\n');
  } else {
    log(colors.red, '❌ 有测试失败，请修复后重试。\n');
  }

  console.log('========================================\n');

  return allPassed;
}

// 主函数
function main() {
  console.log('\n========================================');
  log(colors.cyan, '🧪 Agent 注册系统测试');
  console.log('========================================');

  // 执行测试
  const registryExists = testRegistryExists();
  if (!registryExists) {
    generateReport();
    process.exit(1);
  }

  const registry = testJsonFormat();
  if (!registry) {
    generateReport();
    process.exit(1);
  }

  testRequiredFields(registry);
  testAgentDefinitions(registry);
  testWorkflowDefinitions(registry);
  testMetadataConsistency(registry);
  testHookConfiguration();

  // 生成报告
  const success = generateReport();
  process.exit(success ? 0 : 1);
}

// 执行
main();
