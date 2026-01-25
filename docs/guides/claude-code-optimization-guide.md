# Claude Code 优化指南

> 针对 Scripter 大型项目的 Claude Code 性能优化方案

---

## 📊 问题诊断

### 常见症状
- ❌ `/compact` 后丢失重要上下文
- ❌ 对话越长，响应越慢
- ❌ 重复解释项目背景
- ❌ 多次询问相同问题

### 根本原因
```
上下文窗口膨胀 → Token 线性增长 → 处理时间指数增长
自动压缩时机不当 → 关键信息丢失 → 重复询问
```

---

## 🎯 优化策略

### 策略 1: 策略性压缩 (Strategic Compact)

**核心原则**: 在逻辑断点手动压缩，而非依赖自动压缩

#### 何时压缩 ✅
```
┌─────────────────────────────────────────────────────────────┐
│  探索阶段 ───────► 压缩 ───────► 实施阶段                      │
│     (理解代码库)      (保存发现)      (开始编写)                │
│                                                             │
│  里程碑 A ───────► 压缩 ───────► 里程碑 B                     │
│  (完成功能X)        (总结进度)      (开始功能Y)                │
│                                                             │
│  重大决策 ───────► 压缩 ───────► 执行决策                     │
│  (确定技术方案)      (记录决策)      (实施代码)                │
└─────────────────────────────────────────────────────────────┘
```

#### 何时不要压缩 ❌
- 调试进行中
- 多文件编辑中间
- 需要上下文连贯的任务

#### 实施方法
```bash
# 1. 在阶段转换时
"总结当前进度，保存到 docs/progress.md，然后压缩"

# 2. 完成功能后
"功能 X 已完成，更新进度，准备压缩"

# 3. 使用配置的 hook
# 已配置 strategic-compact.js，会在 50 次工具调用后提示
```

---

### 策略 2: 记忆持久化 (Memory Persistence)

**核心原则**: 将关键信息保存到文件，不依赖上下文窗口

#### 记忆类型

| 类型 | 存储位置 | 内容示例 |
|------|---------|---------|
| **项目记忆** | `.claude/memory.json` | 技术栈、架构决策 |
| **会话记录** | `~/.claude/memory/sessions.json` | 工作历史 |
| **进度追踪** | `docs/progress.md` | 功能完成状态 |
| **决策日志** | `docs/tech/decisions.md` | 技术决策历史 |

#### 使用方法
```javascript
// 会话开始时
"请先阅读 .claude/memory.json 和 docs/progress.md"

// 重要决策时
"将这个决策记录到 docs/tech/decisions.md"

// 完成功能时
"更新 docs/progress.md 中的完成状态"
```

---

### 策略 3: 计划文档化 (Plan Documentation)

**核心原则**: 计划写文件，上下文留窗口

#### 模板结构
```markdown
# 功能名称 - 实施计划

## 背景
{{ 为什么做这个功能 }}

## 目标
- [ ] 目标 1
- [ ] 目标 2

## 技术方案
{{ 使用什么技术，为什么 }}

## 实施步骤
1. 步骤 1
2. 步骤 2

## 验收标准
- [ ] 标准 1
- [ ] 标准 2
```

#### 工作流
```
1. /plan 功能描述
   ↓
2. 将计划写入 docs/plans/功能名.md
   ↓
3. /compact (清理上下文)
   ↓
4. 开始实施
   ↓
5. 定期对照计划文档
```

---

### 策略 4: 多会话并行 (Multi-Session)

**核心原则**: 独立功能使用独立会话

#### Git Worktree 方法
```bash
# 功能 A 开发
git worktree add ../scripter-feature-a feature-a
cd ../scripter-feature-a
claude-code  # 会话 1

# 功能 B 开发
git worktree add ../scripter-feature-b feature-b
cd ../scripter-feature-b
claude-code  # 会话 2
```

#### 优势
- ✅ 每个会话上下文清晰
- ✅ 避免相互干扰
- ✅ 并行开发

---

### 策略 5: 上下文注入优化

**核心原则**: 精准提供上下文，避免冗余

#### DO ✅
```
"阅读 docs/design/.claude/design-context.md 了解设计系统"
"阅读 src/components/Button/ 实现，按此风格实现新组件"
```

#### DON'T ❌
```
"这是整个项目的技术栈和架构..." (太长)
"记住我之前的所有要求..." (不明确)
```

---

## 🛠️ 配置文件说明

### 已配置的 Hooks

```json
{
  "hooks": {
    "SessionStart": [
      // 加载项目记忆
      "node .claude/hooks/memory-persistence.js"
    ],
    "SessionEnd": [
      // 记录会话历史
      "node .claude/hooks/session-summary.js"
    ],
    "PreToolUse": [
      // 策略性压缩提示
      "node .claude/hooks/strategic-compact.js"
    ]
  }
}
```

### 环境变量

```json
{
  "env": {
    "COMPACT_THRESHOLD": "50",  // 每 50 次工具调用提示压缩
    "CLAUDE_DEFAULT_MODEL": "claude-opus-4-5-20251101"
  }
}
```

---

## 📈 效果对比

### 优化前
```
会话长度: 2-3 小时
Token 使用: 每小时 50k+
响应速度: 随时间明显变慢
上下文丢失: 频繁
重复解释: 大量
```

### 优化后
```
会话长度: 不限 (可持续工作)
Token 使用: 每小时 10k-20k
响应速度: 稳定
上下文丢失: 最小化
重复解释: 极少
```

---

## 🎓 最佳实践

### 新会话开始
```
1. 阅读 .claude/templates/session-context.md
2. 阅读 docs/progress.md
3. 明确本次会话目标
4. 开始工作
```

### 会话进行中
```
1. 使用 TodoWrite 跟踪任务
2. 完成任务立即标记完成
3. 重要决策记录到文档
4. 注意 strategic-compact 提示
```

### 会话结束时
```
1. 确认所有任务完成
2. 更新进度文档
3. 写下次会话计划
4. 安全关闭
```

---

## 📚 延伸阅读

- [Claude Code 官方成本管理](https://code.claude.com/docs/en/costs)
- [Claude Code 最佳实践](https://www.anthropic.com/engineering/claude-code-best-practices)
- [上下文窗口优化策略](https://sparkco.ai/blog/mastering-claudes-context-window-a-2025-deep-dive)
- [Strategic Compact 原理](https://hyperdev.matsuoka.com/p/how-claude-code-got-better-by-protecting)

---

## 🔄 快速参考

| 命令 | 用途 |
|------|------|
| `/plan` | 创建实施计划 |
| `/compact` | 手动压缩上下文 |
| `/clear` | 清空会话 |
| `/tdd` | 测试驱动开发 |
| `/verify` | 验证完成度 |

---

**最后更新**: 2026-01-24
**维护者**: Scripter 项目组
