#!/usr/bin/env node
/**
 * Agent 注册表加载器 Hook
 *
 * 在会话开始时加载已注册的 agents
 * 为 Claude 提供可用的 agent 列表和调用方式
 */

const fs = require('fs');
const path = require('path');

const REGISTRY_FILE = path.join(process.cwd(), '.claude', 'agent-registry.json');
const SCHEMA_FILE = path.join(process.cwd(), '.claude', 'agent-registry-schema.json');

// 加载注册表
function loadRegistry() {
  if (!fs.existsSync(REGISTRY_FILE)) {
    console.error(`[AgentRegistry] ⚠️  注册表文件不存在: ${REGISTRY_FILE}`);
    return null;
  }

  try {
    const registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
    console.error(`[AgentRegistry] ✅ 已加载注册表 v${registry.version}`);
    console.error(`[AgentRegistry] 📊 已注册 ${registry.metadata.total_agents} 个 agents`);
    console.error(`[AgentRegistry] 🔄 已定义 ${registry.metadata.total_workflows} 个工作流\n`);
    return registry;
  } catch (e) {
    console.error(`[AgentRegistry] ❌ 无法加载注册表: ${e.message}`);
    return null;
  }
}

// 检测任务类型并推荐 agents
function detectTaskType(userPrompt) {
  if (!userPrompt) return null;

  const prompt = userPrompt.toLowerCase();

  // 任务类型关键词映射
  const taskPatterns = {
    ui_only: {
      keywords: ['ui', '界面', '组件', '样式', '主题', '布局', 'component', 'design', 'layout'],
      workflow: 'ui_only_feature',
      recommended: ['ui-component-agent']
    },
    data_only: {
      keywords: ['数据库', '模型', 'schema', 'prisma', '迁移', '查询', 'database', 'model'],
      workflow: 'data_only_feature',
      recommended: ['data-agent']
    },
    ai_integration: {
      keywords: ['ai', 'glm', 'api', '集成', '流式', '提示词', 'streaming', 'prompt'],
      workflow: 'full_stack_feature',
      recommended: ['ai-integration-agent']
    },
    full_stack: {
      keywords: ['功能', '实现', '开发', '创建', 'feature', 'implement', 'create'],
      workflow: 'full_stack_feature',
      recommended: ['scientific-dev']
    },
    planning: {
      keywords: ['计划', '规划', '设计', 'plan', 'design'],
      workflow: null,
      recommended: ['scientific-dev']
    },
    testing: {
      keywords: ['测试', '验证', 'test', 'verify'],
      workflow: null,
      recommended: ['integration-agent']
    }
  };

  // 匹配任务类型
  let maxScore = 0;
  let detectedType = null;

  for (const [type, config] of Object.entries(taskPatterns)) {
    let score = 0;
    for (const keyword of config.keywords) {
      if (prompt.includes(keyword)) {
        score++;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      detectedType = type;
    }
  }

  return detectedType ? taskPatterns[detectedType] : null;
}

// 显示 agent 列表
function displayAgentList(registry) {
  console.error('========================================');
  console.error('🤖 已注册的 Agents');
  console.error('========================================\n');

  const agents = Object.values(registry.registry);

  // 按类型分组
  const byType = {
    orchestrator: agents.filter(a => a.type === 'orchestrator'),
    specialist: agents.filter(a => a.type === 'specialist'),
    general: agents.filter(a => a.type === 'general')
  };

  // 显示协调器
  if (byType.orchestrator.length > 0) {
    console.error('📋 协调器 (Orchestrators):');
    for (const agent of byType.orchestrator) {
      console.error(`   • ${agent.name} (${agent.id})`);
      console.error(`     ${agent.description}`);
      console.error(`     能力: ${agent.capabilities.join(', ')}`);
      console.error('');
    }
  }

  // 显示专家
  if (byType.specialist.length > 0) {
    console.error('👨‍💻 专家 (Specialists):');
    for (const agent of byType.specialist) {
      console.error(`   • ${agent.name} (${agent.id})`);
      console.error(`     ${agent.description}`);
      if (agent.triggers) {
        console.error(`     触发: ${agent.triggers.join(' | ')}`);
      }
      console.error('');
    }
  }

  console.error('========================================\n');
}

// 显示工作流列表
function displayWorkflowList(registry) {
  console.error('========================================');
  console.error('🔄 可用工作流');
  console.error('========================================\n');

  for (const [id, workflow] of Object.entries(registry.workflows)) {
    console.error(`📌 ${workflow.name} (${id})`);
    console.error(`   协调器: ${workflow.orchestrator}`);

    console.error('   流程:');
    for (const step of workflow.steps) {
      const parallel = step.parallel ? ' [并行]' : '';
      const optional = step.optional ? ' [可选]' : '';
      console.error(`   ${step.phase} → ${step.agents.join(', ')}${parallel}${optional}`);
    }

    console.error('');
  }

  console.error('========================================\n');
}

// 显示使用建议
function displayUsageRecommendations(registry, taskType) {
  console.error('💡 使用建议:\n');

  if (taskType && taskType.workflow) {
    const workflow = registry.workflows[taskType.workflow];
    console.error(`检测到任务类型: ${taskType.workflow}`);
    console.error(`推荐工作流: ${workflow.name}`);
    console.error(`推荐使用以下方式:\n`);

    console.error(`方式 1: 使用工作流（推荐）`);
    console.error(`"使用 ${taskType.workflow} 工作流实现[功能描述]"\n`);

    console.error(`方式 2: 直接调用协调器`);
    console.error(`"使用 ${workflow.orchestrator} agent 实现功能"\n`);

    if (taskType.recommended && taskType.recommended.length > 0) {
      console.error(`方式 3: 调用专家 agent`);
      console.error(`"使用 ${taskType.recommended[0]} 处理[具体任务]"\n`);
    }
  } else {
    console.error(`可用的调用方式:\n`);

    console.error(`方式 1: 使用科学开发工作流（推荐用于大多数开发任务）`);
    console.error(`"使用 scientific-dev agent 实现[功能描述]"\n`);

    console.error(`方式 2: 直接调用专家 agent`);
    console.error(`"使用 [agent-id] 处理[具体任务]"\n`);

    console.error(`方式 3: 使用预定义工作流`);
    const workflowIds = Object.keys(registry.workflows);
    console.error(`"使用 [${workflowIds.join(' | ')}] 工作流"\n`);
  }

  console.error('========================================\n');
}

// 生成 Claude 上下文提示
function generateClaudeContext(registry) {
  const agents = Object.values(registry.registry);

  let context = '\n';
  context += '========================================\n';
  context += '📚 Agent 调用指南\n';
  context += '========================================\n\n';

  context += '## 如何调用 Agent\n\n';
  context += '### 使用 Task 工具调用\n\n';
  context += '```javascript\n';
  context += 'Task({\n';
  context += '  subagent_type: "general-purpose",\n';
  context += '  prompt: "作为 [agent-id] agent，执行..."\n';
  context += '})\n';
  context += '```\n\n';

  context += '### 可用的 Agents\n\n';
  for (const agent of agents) {
    context += `#### ${agent.name} (${agent.id})\n`;
    context += `- **描述**: ${agent.description}\n`;
    context += `- **类型**: ${agent.type}\n`;
    context += `- **能力**: ${agent.capabilities.join(', ')}\n`;
    if (agent.triggers) {
      context += `- **触发**: ${agent.triggers.join(', ')}\n`;
    }
    context += `- **定义文件**: ${agent.definition}\n`;
    context += '\n';
  }

  context += '### 预定义工作流\n\n';
  for (const [id, workflow] of Object.entries(registry.workflows)) {
    context += `#### ${workflow.name} (${id})\n`;
    context += `协调器: ${workflow.orchestrator}\n\n`;
    context += '流程:\n';
    for (const step of workflow.steps) {
      context += `- ${step.phase}: ${step.agents.join(', ')}`;
      if (step.parallel) context += ' [并行]';
      if (step.optional) context += ' [可选]';
      context += '\n';
    }
    context += '\n';
  }

  context += '========================================\n';

  return context;
}

// 主函数
function main() {
  console.error('\n========================================');
  console.error('🔧 Agent 注册系统');
  console.error('========================================\n');

  // 加载注册表
  const registry = loadRegistry();
  if (!registry) {
    console.error('⚠️  注册表加载失败，将使用默认配置\n');
    return;
  }

  // 显示 agent 列表
  displayAgentList(registry);

  // 显示工作流列表
  displayWorkflowList(registry);

  // 从环境变量获取用户提示
  const userPrompt = process.env.USER_PROMPT || '';

  // 检测任务类型
  const taskType = detectTaskType(userPrompt);

  // 显示使用建议
  displayUsageRecommendations(registry, taskType);

  // 生成 Claude 上下文
  const context = generateClaudeContext(registry);
  console.log(context);

  // 返回结果供其他 Hook 使用
  return {
    registry,
    taskType,
    agents: Object.values(registry.registry),
    workflows: registry.workflows
  };
}

// 执行
const result = main();

module.exports = {
  main,
  loadRegistry,
  detectTaskType,
  displayAgentList,
  displayWorkflowList
};
