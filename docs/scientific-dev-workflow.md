# 剧灵 (Scripter) - 科学开发工作流

> 基于 Claude Code + everything-claude-code 的完整项目开发流程

---

## 核心理念

```
开发 = 计划 + 执行 + 验证 + 改进
     ↓        ↓        ↓        ↓
   /plan    /tdd    /verify  /code-review
```

---

## 一、工作流总览

### 四个核心阶段

```mermaid
计划阶段 → 执行阶段 → 验证阶段 → 改进阶段
   ↓         ↓         ↓         ↓
 /plan     /tdd    /verify  /code-review
 专注      测试      循环      审查
```

### 对应的 everything-claude-code 组件

| 阶段 | 命令 | Agent | Skill |
|------|------|-------|-------|
| **计划** | `/plan` | planner, architect | - |
| **执行** | `/tdd` | - | tdd-workflow, frontend-patterns |
| **验证** | `/verify` | - | verification-loop |
| **改进** | `/code-review` | code-reviewer | - |

---

## 二、详细工作流程

### 阶段 1：计划（Plan）

**目标**：明确要做什么，怎么做

```bash
# 使用场景 1：新功能开发
/plan 实现场景拖拽排序功能

# 使用场景 2：架构决策
/plan 如何设计剧本导出系统的架构

# 使用场景 3：问题修复
/plan 修复 AI 流式响应中断的问题
```

**Claude Code 会自动：**
1. 使用 `planner` agent 分析需求
2. 使用 `architect` agent 设计方案
3. 生成实施计划
4. 询问你确认

**输出示例：**
```
## 实施计划：场景拖拽排序

### 方案选择
- ✅ 使用 @dnd-kit/core（已安装）
- ❌ react-beautiful-dnd（已废弃）
- ❌ 自定义实现（过度工程）

### 实施步骤
1. 配置 DndContext provider
2. 实现场景卡片拖拽句柄
3. 添加拖拽事件处理
4. 实现金色插入指示线
5. 添加状态更新逻辑

### 文件变更
- components/scenes/scene-board.tsx（修改）
- components/scenes/scene-card.tsx（修改）

### 预计时间
- 开发：30 分钟
- 测试：15 分钟
```

---

### 阶段 2：执行（Execute）

**目标**：用 TDD 方式实现功能

```bash
# 启动 TDD 工作流
/tdd 实现场景拖拽排序功能
```

**TDD 循环：**

```
┌─────────────────────────────────────┐
│ 1. RED（编写失败测试）               │
│    - 定义接口                        │
│    - 编写测试用例                    │
│    - 运行测试（应该失败）            │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ 2. GREEN（实现最小代码）             │
│    - 编写最少代码使测试通过          │
│    - 运行测试（应该通过）            │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ 3. REFACTOR（重构优化）              │
│    - 清理代码                        │
│    - 优化性能                        │
│    - 确保测试仍通过                  │
└─────────────────────────────────────┘
```

**Claude Code 会自动调用：**
- `tdd-workflow` skill（TDD 方法论）
- `frontend-patterns` skill（React 模式）
- `coding-standards` skill（代码规范）

---

### 阶段 3：验证（Verify）

**目标**：确保功能正确工作

```bash
# 运行验证循环
/verify
```

**验证内容：**
1. ✅ 所有测试通过
2. ✅ 构建成功（npm run build）
3. ✅ 无 TypeScript 错误
4. ✅ 无 ESLint 警告
5. ✅ 功能实际可用（手动测试）

**Claude Code 会自动：**
- 运行测试套件
- 检查构建状态
- 验证类型安全
- 生成验证报告

---

### 阶段 4：改进（Improve）

**目标**：提升代码质量

```bash
# 运行代码审查
/code-review
```

**Claude Code 会启动 `code-reviewer` agent 检查：**

| 检查项 | 说明 |
|--------|------|
| **代码质量** | 可读性、可维护性、复杂度 |
| **安全性** | XSS、注入、敏感信息泄露 |
| **性能** | 渲染性能、内存泄漏、不必要的重渲染 |
| **最佳实践** | React/Next.js 模式、TypeScript 用法 |
| **一致性** | 与项目风格一致 |

**输出示例：**
```
## 代码审查报告

### 🟢 通过项
- ✅ 组件结构清晰
- ✅ 正确使用 React hooks
- ✅ TypeScript 类型完整

### 🟡 改进建议
- ⚠️ 场景列表应使用 useMemo 缓存
- ⚠️ 拖拽事件处理可提取为自定义 hook

### 🔴 必须修复
- ❌ 缺少错误边界处理
- ❌ 未处理拖拽取消情况
```

---

## 三、典型开发场景

### 场景 A：开发新功能

```bash
# 1. 创建功能分支
git checkout -b feature/scene-drag-drop

# 2. 计划阶段
/plan 实现场景拖拽排序功能

# 3. 执行阶段
/tdd 实现场景拖拽排序功能

# 4. 验证阶段
/verify

# 5. 改进阶段
/code-review

# 6. 提交代码
git add .
git commit -m "feat: 添加场景拖拽排序功能"
```

---

### 场景 B：修复 Bug

```bash
# 1. 创建修复分支
git checkout -b fix/ai-streaming-interrupt

# 2. 分析问题
/plan AI 流式响应在中途意外中断

# 3. 实施修复
# 直接修复（不需要 /tdd，因为是 bug 修复）
# 编辑文件...

# 4. 验证修复
/verify

# 5. 代码审查
/code-review

# 6. 提交修复
git commit -m "fix: 修复 AI 流式响应中断问题"
```

---

### 场景 C：重构代码

```bash
# 1. 创建重构分支
git checkout -b refactor/ai-context-collection

# 2. 计划重构
/plan 重构 AI 上下文收集逻辑，提升性能

# 3. 执行重构
# 注意：重构时应该先有测试覆盖

# 4. 验证重构
/verify

# 5. 深度审查
/code-review

# 6. 提交重构
git commit -m "refactor: 优化 AI 上下文收集性能"
```

---

## 四、团队协作工作流

### 分支策略

```
main（生产）
  ↑
  └── develop（开发）
        ↑
        ├── feature/*（功能分支）
        ├── fix/*（修复分支）
        └── refactor/*（重构分支）
```

### Pull Request 流程

```bash
# 1. 开发完成后
git checkout develop
git pull origin develop
git merge feature/scene-drag-drop

# 2. 推送到远程
git push origin feature/scene-drag-drop

# 3. 创建 PR（在 GitHub 上）

# 4. PR 描述模板
## 功能描述
实现场景拖拽排序功能

## 实施过程
- 使用 /plan 进行方案设计
- 使用 /tdd 进行测试驱动开发
- 使用 /verify 验证功能
- 使用 /code-review 代码审查

## 测试
- [x] 单元测试通过
- [x] 构建成功
- [x] 手动测试通过

## 截图/演示
（添加截图或 GIF）
```

---

## 五、最佳实践

### 1. 命令使用时机

| 命令 | 何时使用 | 何时不使用 |
|------|---------|-----------|
| `/plan` | 新功能、架构决策、复杂问题 | 简单 bug 修复 |
| `/tdd` | 新功能开发、需要测试的功能 | 配置文件修改、样式调整 |
| `/verify` | 完成功能后、提交前 | 每次小改动后 |
| `/code-review` | 完成功能后、PR 前 | 每次小改动后 |

### 2. 上下文管理

```yaml
原则：每个会话专注一个任务

❌ 不好的做法：
# 在一个会话中
/plan 功能 A
/tdd 实现功能 A
/plan 功能 B  # 切换任务，上下文混乱
/tdd 实现功能 B

✅ 好的做法：
# 会话 1：专注功能 A
/plan 功能 A
/tdd 实现功能 A
/verify
/code-review

# 会话 2：专注功能 B
/plan 功能 B
/tdd 实现功能 B
/verify
/code-review
```

### 3. Git 提交规范

```bash
# 提交格式
<type>(<scope>): <subject>

# type 类型
feat     新功能
fix      Bug 修复
refactor 重构
style    样式修改（不影响功能）
docs     文档变更
test     测试相关
chore    构建/工具相关

# 示例
feat(editor): 添加场景拖拽排序
fix(ai): 修复流式响应中断
refactor(api): 优化数据查询性能
docs(readme): 更新安装说明
```

### 4. 渐进式开发

```
大功能 = 小功能的集合

❌ 不好的做法：
/plan 实现完整的剧本编辑系统
# 规模太大，难以完成

✅ 好的做法：
/plan 实现场景拖拽排序
/plan 实现格式检查
/plan 实现导出功能
# 每个小功能独立完成，逐步累积
```

---

## 六、技能（Skills）自动调用

everything-claude-code 的 Skills 会在适当时候自动调用：

| Skill | 自动调用时机 |
|-------|-------------|
| `coding-standards` | 编写代码时 |
| `frontend-patterns` | 开发 React/Next.js 组件时 |
| `backend-patterns` | 开发 API/数据库逻辑时 |
| `tdd-workflow` | 使用 /tdd 命令时 |
| `security-review` | 涉及用户输入、数据传输时 |

---

## 七、常用命令速查

```bash
# === 规划阶段 ===
/plan [功能描述]              # 创建实施计划

# === 执行阶段 ===
/tdd [功能描述]               # 测试驱动开发

# === 验证阶段 ===
/verify                       # 运行验证循环
npm test                      # 运行测试
npm run build                 # 构建验证
npm run lint                  # 代码检查

# === 改进阶段 ===
/code-review                  # 代码审查

# === Git 操作 ===
git status                    # 查看状态
git add .                     # 添加变更
git commit -m "msg"           # 提交
git push                      # 推送
```

---

## 八、故障排查

### /plan 没有反应

```bash
# 检查插件是否启用
cat .claude/settings.local.json

# 确认 everything-claude-code 在 enabledPlugins 中

# 重启 Claude Code
```

### /tdd 测试失败

```bash
# 查看详细错误
npm test -- --verbose

# 检查测试文件
cat components/__tests__/xxx.test.tsx

# 手动运行特定测试
npm test -- scene-board
```

### /verify 报告构建错误

```bash
# 查看完整错误
npm run build

# 修复类型错误
# （根据错误信息修复）

# 重新验证
/verify
```

---

## 九、进阶技巧

### 1. 组合使用 Agent

```python
# 直接调用 planner + architect
Task(subagent_type="general-purpose",
     prompt="使用 planner 和 architect agent 设计...")
```

### 2. 自定义验证循环

在项目根目录创建 `.claude/rules/verification.md`：

```markdown
# 项目特定验证规则

每次 /verify 时必须检查：
1. 所有 TypeScript 类型正确
2. 所有测试通过
3. 构建成功
4. 设计系统一致性（颜色、间距、字体）
5. AI 功能实际可用（如果有 API 调用）
```

### 3. 会话模板

为常见任务创建会话模板：

```
# 新功能开发模板
git checkout -b feature/xxx
/plan [功能]
/tdd [功能]
/verify
/code-review
git commit -m "feat: xxx"

# Bug 修复模板
git checkout -b fix/xxx
# 分析问题...
# 修复...
/verify
/code-review
git commit -m "fix: xxx"
```

---

## 十、资源链接

- **everything-claude-code**: [GitHub](https://github.com/affaan-m/everything-claude-code)
- **Next.js 文档**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **React 文档**: [https://react.dev](https://react.dev)
- **TDD 指南**: [https://jest.dev](https://jest.dev)

---

**让灵感，在代码中苏醒** ✨
