# Scripter 项目文件命名规范

> **版本**: v1.0
> **创建日期**: 2026-01-24
> **状态**: 生效

---

## 📋 命名原则

### 核心原则

| 原则 | 说明 | 示例 |
|------|------|------|
| **语义化** | 文件名应清晰表达内容 | `prd.md` 而非 `doc1.md` |
| **版本化** | 使用统一版本号管理 | `v2.5` 而非 `final-v2` |
| **日期化** | 使用 YYYY-MM-DD 格式 | `2026-01-24` 而非 `Jan24` |
| **小写化** | 全部使用小写字母 | `prd.md` 而非 `PRD.md` |
| **连字符** | 使用连字符分隔单词 | `tech-design.md` 而非 `tech_design.md` |

---

## 📁 目录结构规范

### 项目根目录结构

```
scripter/
├── docs/                          # 📚 项目文档
│   ├── prd/                       # 产品需求文档
│   ├── design/                    # 设计文档
│   ├── tech/                      # 技术文档
│   ├── plans/                     # 开发计划
│   └── guides/                    # 指南文档
├── config/                        # ⚙️ 配置文件
├── src/                           # 💻 源代码
├── .claude/                       # 🤖 Claude Code 配置
│   ├── agents/                    # 自定义 Agent
│   ├── hooks/                     # Hooks 脚本
│   ├── templates/                 # 模板文件
│   └── memory.json                # 记忆持久化
└── scripts/                       # 🔧 脚本工具
```

---

## 📄 文件命名规范

### 1. PRD 文档命名

**格式**: `prd-{version}.md`

| 示例 | 说明 |
|------|------|
| `prd-v2.5.md` | PRD 主文档 v2.5 版本 |
| `prd-changelog.md` | PRD 变更日志 |

**废弃格式**（请避免）:
- ❌ `2026-01-22-scripter-prd-v2.2.md` - 日期冗余
- ❌ `scripter-prd-v2.4.md` - 项目名冗余
- ❌ `prd-final.md` - 非版本化

### 2. 核心文档命名

**格式**: `{type}-{name}.md`

| 类型 | 说明 | 示例 |
|------|------|------|
| **产品定位** | 产品定位声明 | `product-positioning.md` |
| **商业模式** | 商业模式文档 | `business-model.md` |
| **风险分析** | 风险分析文档 | `risk-analysis.md` |

**特殊说明**：
- 核心文档**独立版本管理**（v1.0, v1.1...）
- 变更需要**团队共识**，门槛较高
- PRD/其他文档**引用**核心文档，不重复定义
- 文件名不带版本号（版本在文档内部管理）

### 3. PRD 文档命名

**格式**: `prd-v{major}.{minor}.md`

| 示例 | 说明 |
|------|------|
| `prd-v2.5.md` | PRD 主文档 v2.5 版本（当前） |
| `prd-v2.4-legacy.md` | 历史版本（标记 legacy） |
| `prd-changelog.md` | PRD 变更日志 |

**废弃格式**（请避免）:
- ❌ `2026-01-22-scripter-prd-v2.2.md` - 日期冗余
- ❌ `scripter-prd-v2.4.md` - 项目名冗余
- ❌ `prd-final.md` - 非版本化

### 4. 设计文档命名

**格式**: `{category}-{name}-{version}.md`

| Category | 说明 | 示例 |
|----------|------|------|
| `ui` | UI 设计系统 | `ui-design-system-v4.6.md` |
| `interaction` | 交互设计 | `interaction-ai-partner-v1.0.md` |
| `brand` | 品牌规范 | `brand-identity-v1.0.md` |
| `prototype` | 原型设计 | `prototype-dashboard-v1.0.md` |

### 5. 技术文档命名

**格式**: `{category}-{name}.md` (无版本，Git 管理)

| Category | 说明 | 示例 |
|----------|------|------|
| `tech` | 技术设计 | `tech-architecture.md` |
| `api` | API 规范 | `api-spec.md` |
| `db` | 数据库设计 | `db-schema.md` |
| `component` | 组件规范 | `component-conventions.md` |
| `decisions` | 技术决策 | `tech-decisions.md` |

### 6. 计划文档命名

**格式**: `plan-{date}-{name}.md`

| 示例 | 说明 |
|------|------|
| `plan-2026-01-24-sprint-1.md` | 2026-01-24 的 Sprint 1 计划 |
| `plan-2026-01-24-mvp.md` | MVP 实施计划 |

**计划文档按日期管理，不保留历史版本**（使用 Git）

### 7. 配置文件命名

**格式**: `{purpose}-config.{ext}`

| 示例 | 说明 |
|------|------|
| `dev-config.yaml` | 开发环境配置 |
| `model-config.yaml` | AI 模型配置 |
| `agents-config.yaml` | Agent 配置 |

### 8. Claude Code 配置命名

**格式**: `{type}-{name}.{ext}`

| Type | 说明 | 示例 |
|------|------|------|
| `agent` | Agent 定义 | `agent-frontend.md` |
| `hook` | Hook 脚本 | `hook-memory-persistence.js` |
| `template` | 模板文件 | `template-session-context.md` |

### 9. 脚本文件命名

**格式**: `{action}-{target}.ps1` (PowerShell) 或 `.sh` (Bash)

| 示例 | 说明 |
|------|------|
| `setup-dev-env.ps1` | 开发环境设置脚本 |
| `cleanup-worktree.ps1` | 清理工作树脚本 |

---

## 📌 版本号规范

### 语义化版本 (Semantic Versioning)

**格式**: `v{major}.{minor}.{patch}`

| 版本 | 示例 | 说明 |
|------|------|------|
| **Major** | v2.0 → v3.0 | 重大变更、架构调整 |
| **Minor** | v2.4 → v2.5 | 新功能、重要更新 |
| **Patch** | v2.5.0 → v2.5.1 | Bug 修复、小改动 |

### PRD 版本管理

PRD 文档采用 `v{major}.{minor}` 格式（无 patch）：

```
v1.0 → v2.0 → v2.1 → v2.2 → v2.3 → v2.4 → v2.5
 ↑      ↑      ↑      ↑      ↑      ↑      ↑
初始   重大   小更新  小更新  小更新  小更新  小更新
```

### 设计系统版本

设计文档使用独立版本号：

```
ui-design-system-v4.6.md
                   ^^^^
                   主版本.次版本
```

---

## 🔄 迁移计划

### 需要重命名的文件

| 原文件名 | 新文件名 | 操作 |
|---------|---------|------|
| `docs/prd/2026-01-22-scripter-prd-v2.2.md` | `docs/prd/prd-v2.2-legacy.md` | 重命名+标记 |
| `docs/prd/2026-01-23-scripter-prd-v2.4.md` | `docs/prd/prd-v2.4-legacy.md` | 重命名+标记 |
| `docs/prd/2026-01-22-scripter-prd-v2.md` | `docs/prd/prd-v2.1-legacy.md` | 重命名+标记 |
| `docs/prd/2026-01-22-scripter-prd.md` | `docs/prd/prd-v1.0-legacy.md` | 重命名+标记 |
| `docs/prd/2026-01-22-scripter-prd-old.md` | `docs/prd/prd-archive.md` | 归档 |
| `docs/implementation-plan-v2.md` | `docs/plans/plan-sprint-mvp.md` | 移动+重命名 |

### 新建文件

| 文件名 | 用途 |
|--------|------|
| `docs/prd/prd-v2.5.md` | 最新 PRD |
| `docs/prd/prd-changelog.md` | PRD 变更日志 |
| `docs/file-naming-convention.md` | 本文档 |

---

## 📝 文档模板

### PRD 头部模板

```markdown
# Scripter 产品需求文档

> **版本**: v{major}.{minor}
> **创建日期**: YYYY-MM-DD
> **更新日期**: YYYY-MM-DD
> **状态**: {draft|review|approved|deprecated}

---

## 文档导航

| 文档 | 版本 | 说明 |
|------|------|------|
| **PRD v{current}（本文档）** | v{major}.{minor} | {当前版本说明} |
| [PRD v{previous}](prd-v{previous}.md) | v{previous} | {上一版本说明} |
| [PRD Changelog](prd-changelog.md) | - | 完整变更历史 |

---

## 版本历史

| 版本 | 日期 | 变更摘要 |
|------|------|---------|
| v{major}.{minor} | YYYY-MM-DD | {变更描述} |
| v{previous} | YYYY-MM-DD | {变更描述} |
```

### 设计文档头部模板

```markdown
# {文档标题}

> **版本**: v{major}.{minor}.{patch}
> **创建日期**: YYYY-MM-DD
> **更新日期**: YYYY-MM-DD
> **状态**: {draft|review|approved|deprecated}

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| v{major}.{minor}.{patch} | YYYY-MM-DD | {变更描述} |
```

---

## 🎯 执行清单

### Phase 1: 创建新文档
- [ ] 创建 `docs/prd/prd-v2.5.md`
- [ ] 创建 `docs/prd/prd-changelog.md`
- [ ] 创建 `docs/file-naming-convention.md`

### Phase 2: 重命名现有文档
- [ ] 重命名所有 PRD 文件（添加 legacy 标记）
- [ ] 移动计划文档到 `docs/plans/`
- [ ] 归档过时文档

### Phase 3: 更新引用
- [ ] 更新 `README.md` 中的文档链接
- [ ] 更新 `scientific-dev-workflow.md` 引用
- [ ] 更新所有文档内的相互引用

### Phase 4: 清理
- [ ] 删除冗余文档
- [ ] 统一文档头部格式

---

## 📚 相关文档

- [科学开发工作流](scientific-dev-workflow.md)
- [项目 README](../README.md)
- [技术决策历史](tech/decisions.md)

---

**最后更新**: 2026-01-24
**维护者**: Scripter Team
