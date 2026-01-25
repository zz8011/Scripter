# Scripter 配置文件说明

> 配置文件版本：v2.0 | 更新日期：2026-01-24

---

## 📁 配置文件概览

```
config/
├── dev-config.yaml       # 主开发配置
├── model-config.yaml     # AI 模型配置
├── agents-config.yaml    # Claude Code Agent 配置
└── README.md            # 本文件
```

---

## 📋 配置文件详解

### 1. dev-config.yaml（开发配置）

**用途**：剧灵应用的整体开发配置

**主要部分**：

| 部分 | 说明 |
|------|------|
| `project` | 项目基本信息 |
| `tech_stack` | 技术栈（Next.js、Drizzle、PostgreSQL 等）|
| `development` | 开发环境配置（端口、数据库、环境变量）|
| `build` | 构建配置 |
| `testing` | 测试配置（覆盖率要求）|
| `code_quality` | 代码规范（TypeScript、ESLint、Prettier）|
| `git` | Git 工作流配置 |
| `claude_code` | Claude Code 配置（并行开发、上下文管理）|
| `deployment` | 部署配置（Vercel）|
| `performance` | 性能目标 |
| `security` | 安全配置（CSP、CORS）|
| `features` | 功能开关 |

**常用修改**：

```yaml
# 修改开发端口
development.server.port: 3000

# 切换数据库
development.database.url: "postgresql://..."

# 启用/禁用功能
features.ai_features.enabled: true
features.collaboration.enabled: false
```

---

### 2. model-config.yaml（AI 模型配置）

**用途**：配置 AI 模型和 API

**主要部分**：

| 部分 | 说明 |
|------|------|
| `providers` | AI 提供商（智谱、T8Star）|
| `feature_models` | 功能特定的模型配置 |
| `context_management` | 上下文和 Token 管理 |
| `prompts` | 系统提示词模板 |
| `error_handling` | 重试和错误处理 |
| `cost_control` | 成本控制 |
| `cache` | 缓存配置 |
| `monitoring` | 监控和日志 |

**模型配置**：

```yaml
# 智谱 GLM-4.7
providers.zhipu:
  models.primary: "glm-4-plus"    # 最强模型
  models.fast: "glm-4-air"        # 快速模型
  models.flash: "glm-4-flash"     # 极速模型

# Token 限制
tokens:
  max_input: 128000
  recommended_input: 8000
  recommended_output: 4096

# 成本参考
costs:
  input_per_million: 12.0  # ¥12/百万 tokens
  output_per_million: 12.0
```

**功能模型映射**：

| 功能 | 模型 | Temperature |
|------|------|-------------|
| 剧本生成 | glm-4-plus | 0.8 |
| 对话优化 | glm-4-plus | 0.7 |
| 场景创作 | glm-4-plus | 0.8 |
| 角色分析 | glm-4-air | 0.6 |
| 快速响应 | glm-4-flash | 0.7 |

---

### 3. agents-config.yaml（Agent 配置）

**用途**：配置用于开发剧灵应用的 Claude Code Agents

**主要部分**：

| 部分 | 说明 |
|------|------|
| `agents` | 开发 Agent 定义 |
| `workflows` | Agent 协作流程 |
| `parallel` | 并行执行配置 |
| `skills` | 技能映射 |
| `context_strategy` | 上下文策略 |
| `output_standards` | 输出规范 |

**开发 Agents**：

| Agent | 专长 | 主要职责 |
|-------|------|---------|
| `frontend` | Next.js + React | UI 组件、状态管理 |
| `backend` | API + Drizzle | API 端点、数据库 |
| `ai_integration` | GLM-4.7 + T8Star | AI 集成、流式响应 |
| `database` | 数据建模 | Schema、迁移 |
| `testing` | Jest + Testing | 单元测试、集成测试 |
| `devops` | 部署、CI/CD | Vercel、GitHub Actions |

**协作流程**：

```yaml
# 新功能开发
feature_development:
  1. frontend → 创建 UI
  2. backend → 实现 API
  3. ai_integration → 集成 AI
  4. testing → 编写测试
  5. code_reviewer → 审查代码

# Bug 修复
bug_fix:
  1. systematic-debugging → 诊断
  2. frontend/backend → 修复
  3. testing → 验证
```

---

## 🚀 快速开始

### 1. 首次使用

```bash
# 1. 复制环境变量模板
cp .env.example .env.local

# 2. 配置必需的环境变量
# - DATABASE_URL
# - ZHIPU_API_KEY
# - T8STAR_API_KEY
# - CASDOOR_*

# 3. 安装依赖
pnpm install

# 4. 启动开发服务器
pnpm dev
```

### 2. 修改配置

```bash
# 编辑配置文件
vim config/dev-config.yaml
vim config/model-config.yaml
vim config/agents-config.yaml

# 重启开发服务器使配置生效
pnpm dev
```

### 3. 使用 Claude Code

```bash
# 启动 Claude Code
claude-code

# 加载配置
"请阅读 config/dev-config.yaml 了解项目配置"
"请阅读 config/agents-config.yaml 了解可用 Agent"
```

---

## 🔧 常用配置修改

### 修改开发端口

```yaml
# config/dev-config.yaml
development.server.port: 3001
```

### 切换 AI 模型

```yaml
# config/model-config.yaml
feature_models.script_generation.model: "glm-4-air"  # 使用更快模型
```

### 启用功能

```yaml
# config/dev-config.yaml
features.collaboration.enabled: true
```

### 调整 Token 预算

```yaml
# config/model-config.yaml
context_management.token_budget.total: 200000  # 增加预算
```

---

## 📊 配置优先级

```
环境变量 > config/dev-config.yaml > 默认值
```

环境变量会覆盖配置文件中的设置。

---

## 🔐 敏感信息

所有敏感信息（API Key、密码等）都应存储在环境变量中，**不要**提交到 Git。

**必需的环境变量**：

```bash
# 数据库
DATABASE_URL=postgresql://...

# AI API
ZHIPU_API_KEY=your_key_here
T8STAR_API_KEY=your_key_here

# 认证
CASDOOR_ENDPOINT=http://localhost:8000
CASDOOR_CLIENT_ID=your_client_id
CASDOOR_CLIENT_SECRET=your_client_secret
```

---

## 📚 相关文档

- **开发工作流**：`docs/scientific-dev-workflow.md`
- **技术设计**：`docs/tech/tech-design.md`
- **API 规范**：`docs/tech/api-spec.md`
- **并行开发**：`docs/parallel-development-guide.md`

---

## 🆘 故障排查

### 配置未生效

```bash
# 检查文件是否存在
ls -la config/

# 检查 YAML 语法
# 使用在线工具：https://www.yamllint.com/

# 重启开发服务器
pnpm dev
```

### API 调用失败

```bash
# 检查环境变量
echo $ZHIPU_API_KEY
echo $T8STAR_API_KEY

# 查看 AI 使用日志
cat logs/ai-usage.log
```

### Agent 未响应

```bash
# 检查 Agent 配置
cat config/agents-config.yaml

# 查看 Claude Code 日志
# Claude Code → View → Toggle Developer Tools
```

---

**最后更新**：2026-01-24
**版本**：v2.0
