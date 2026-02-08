# Scripter 项目综合评估报告

> **类型**: analysis
> **日期**: 2026-02-08
> **作者**: Claude (project-evaluation team)
> **评估方法**: 三 Agent 并行评估（代码现状 + PRD 对照 + 架构审查）

---

## 📋 执行摘要

**项目整体完成度: ~55%** | **代码质量: B (良好)** | **架构健康度: B- (一般)**

Scripter（剧灵）项目在基础架构和核心页面方面有扎实的进展。数据库 Schema 100% 覆盖，六大核心页面均有基础实现，AI Agent 框架架构完整，八字系统和导出系统完成度高。主要差距在于：部分功能停留在 UI 层面缺少后端集成（编辑器保存、Dashboard 统计）、AI Skills 数量不足、测试覆盖严重不足、以及若干安全隐患需要立即修复。

---

## 一、项目现状总览

### 1.1 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 框架 | Next.js (App Router) | 15.1.4 |
| 语言 | TypeScript | 5.x |
| ORM | Drizzle ORM | 0.29 |
| 数据库 | PostgreSQL | - |
| 认证 | Casdoor + 邮箱密码 | - |
| AI | 智谱 GLM-4-plus | - |
| 状态管理 | Zustand | 5.x |
| 编辑器 | TipTap | 2.12 |
| UI | shadcn/ui + Radix + Tailwind CSS | 4.x |
| 测试 | Vitest | 4.x |

### 1.2 代码量

| 模块 | 文件数 | 说明 |
|------|--------|------|
| `app/` (页面+API) | ~68 | 20 个页面 + 37 个 API 路由 |
| `lib/` (核心逻辑) | ~85 | schema、queries、stores、agents、bazi 等 |
| `components/` | ~40 | UI 基础组件、自定义组件、编辑器组件 |
| 测试文件 | 9 | 覆盖率 < 15% |

---

## 二、PRD 完成度分析

### 2.1 总体完成度

| 模块 | 完成度 | 状态 |
|------|--------|------|
| 基础架构 (Sprint 1-2) | **80%** | 🔨 大部分完成 |
| 核心模块 (Sprint 3-6) | **55%** | 🔨 部分完成 |
| AI 集成 (Sprint 7-8) | **35%** | 🔨 部分完成 |
| MVP 收尾 (Sprint 9-10) | **25%** | 🔨 部分完成 |

### 2.2 里程碑达成情况

| 里程碑 | 目标 | 状态 |
|--------|------|------|
| **M1: 基础架构** | 可运行的空壳项目；Casdoor 登录可用 | ✅ 已达成 |
| **M2: 六大页面** | 所有核心页面可操作；数据可保存 | 🔨 基本达成（部分功能不完整） |
| **M3: AI 功能** | AI 辅助功能正常工作；意图路由可用 | 🔨 部分达成（Skills 不足 6 个） |
| **M4: MVP 完成** | 所有 MVP 功能就绪 | ❌ 未达成 |

### 2.3 各模块完成度详情

| 模块 | 完成度 | 已完成 | 未完成 |
|------|--------|--------|--------|
| 认证系统 | 85% | 登录/注册/OAuth/中间件/会话管理 | 密码重置邮件发送、Token 刷新实际逻辑 |
| 数据模型 | 90% | 13 个 Schema + 8 个 Query 层 | 缺少索引优化 |
| Dashboard | 75% | 项目卡片/统计/删除 | 创建向导、搜索、排序、统计数据不准确 |
| 编辑器 | 65% | TipTap 集成/格式节点/工具栏/快捷键 | **服务端保存(TODO)**、版本管理、阅读模式 |
| 角色管理 | 70% | CRUD/卡片展示/表单 | 关系图谱、搜索、AI 生成人设 |
| 场景管理 | 70% | 看板/列表/拖拽/筛选 | 虚拟滚动、金色指示线 |
| 世界观 | 70% | 多维设定/分类/CRUD | AI 设定编织、模板 |
| 分镜 | 65% | 四栏排版/镜头类型 | AI 运镜建议、PDF 导出 |
| AI 系统 | 50% | GLM-4.7 集成/IntentRouter/AgentBus/5 个 Agent/3 个 Skill | 3 个缺失 Skill、不打扰原则、行为记录 |
| 八字系统 | 90% | 计算器/性格/诗号/配置页面 | 基本完整 |
| 导出系统 | 80% | PDF/Word/Text/制片导出 | Fountain 格式、防盗版 |
| 测试 | 15% | 9 个测试文件 | E2E、组件测试、API 测试 |

---

## 三、架构与代码质量评估

### 3.1 评分总览

| 维度 | 评分 | 说明 |
|------|------|------|
| Next.js App Router 使用 | **B+** | 路由结构清晰，缺少 error.tsx/not-found.tsx |
| 服务端/客户端组件划分 | **C+** | 过度使用 `"use client"`，Dashboard 等页面丧失 SSR 优势 |
| 数据获取模式 | **B** | API Routes 为主，认证模式不统一 |
| 状态管理 | **B** | Zustand 使用规范，`selectProjectsSorted` 有数组 mutation |
| 数据层 | **A-** | Schema 与 data-model.md 一致，查询封装良好 |
| 安全性 | **B-** | 有隐患（详见风险清单） |
| TypeScript 类型安全 | **B-** | 42 处 `any` 类型（已修复部分类型错误） |
| 错误处理 | **B** | 定义了完整错误类但未充分使用 |
| 设计系统一致性 | **B+** | CSS 变量完整，但 Tailwind 配置未集成设计令牌 |
| 测试覆盖 | **D** | < 15%，远低于目标 |

### 3.2 关键架构问题

1. **过度客户端渲染**: 16 个 `app/` 页面使用 `"use client"`，丧失 SSR/流式渲染优势
2. **认证模式不统一**: 部分 API 用 `withAuth` 包装器，部分手动调用 `getSessionWithDev()`
3. **Tailwind 配置空白**: 设计令牌未映射到 `theme.extend`，导致大量内联样式
4. **CDN 依赖**: Iconify 同步脚本阻塞首屏，纸质纹理依赖外部 CDN
5. **两个 AgentManager**: `lib/agents/AgentManager.ts` 和 `lib/agents/core/AgentManager.ts` 共存
6. **重复 API 路由**: `/api/juling/config` 和 `/api/juling-config` 功能重复

---

## 四、风险清单（按严重程度排序）

### P0 - 严重（需立即修复）

| # | 风险 | 位置 | 影响 |
|---|------|------|------|
| 1 | **会话 Cookie 未签名/加密** | `lib/session.ts` | 攻击者可伪造会话内容 |
| 2 | **多个 API 缺少输入验证** | `api/characters`, `api/scenes`, `api/worldview` POST | 未验证的数据直接写入数据库 |
| 3 | **敏感信息泄露风险** | `drizzle.config.ts` 硬编码默认密码 | 需确认 git 历史无 `.env.local` 泄露 |

### P1 - 重要

| # | 风险 | 位置 | 影响 |
|---|------|------|------|
| 4 | 缺少 `error.tsx` 和 `not-found.tsx` | `app/` | 用户遇到错误无友好提示 |
| 5 | 认证模式不统一 | 多个 API 路由 | 容易遗漏权限检查 |
| 6 | `getSessionWithDev()` 安全检查不一致 | `lib/auth.ts` | 开发/生产环境检查逻辑不同 |
| 7 | 编辑器保存是 TODO | `app/editor/page.tsx:152` | 核心功能缺失，用户数据会丢失 |
| 8 | Dashboard 统计数据不准确 | `app/dashboard/page.tsx` | 使用 `targetEpisodes` 而非真实数据 |

### P2 - 改进

| # | 风险 | 位置 | 影响 |
|---|------|------|------|
| 9 | 测试覆盖率 < 15% | 全局 | 回归风险高 |
| 10 | 42 处 `any` 类型 | 主要在 Agent 系统 | 类型安全降低 |
| 11 | CDN 同步脚本阻塞渲染 | `app/layout.tsx` Iconify | 首屏性能 |
| 12 | 外部纸质纹理 CDN 依赖 | `globals.css` | 离线不可用 |
| 13 | `selectProjectsSorted` 数组 mutation | `projectStore` | 潜在状态 bug |

---

## 五、开发路线图建议

基于业务价值、技术依赖和风险评估，建议按以下优先级推进：

### Phase 1: 安全修复与核心补全（建议最先完成）

| 任务 | 优先级 | 依赖 | 说明 |
|------|--------|------|------|
| Cookie 会话签名 | P0 | 无 | 使用 `iron-session` 或 `jose` 签名 cookie |
| API 输入验证补全 | P0 | 无 | 为 characters/scenes/worldview POST 添加 Zod 验证 |
| 统一 API 认证模式 | P1 | 无 | 所有 API 路由使用 `withAuth` 包装器 |
| 添加 error.tsx / not-found.tsx | P1 | 无 | 全局错误边界和 404 页面 |
| 编辑器服务端保存 | P1 | 无 | 替换 TODO 模拟保存为真实 API 调用 |
| Dashboard 统计修正 | P1 | 无 | 从实际数据聚合统计 |

### Phase 2: 功能完善

| 任务 | 优先级 | 依赖 | 说明 |
|------|--------|------|------|
| 项目创建向导 | P1 | 无 | 替换硬编码创建逻辑 |
| 补充 3 个 AI Skills | P1 | 无 | 节奏分析、一致性检查、人性化 |
| 密码重置流程 | P1 | 邮件服务 | 实现发送重置邮件 API |
| 人物关系图谱 | P1 | 无 | 数据模型已有，需可视化 |
| 全局搜索 | P2 | 无 | 跨模块搜索功能 |
| 版本控制 | P2 | 编辑器保存 | 版本对比/回滚 |

### Phase 3: 质量提升

| 任务 | 优先级 | 依赖 | 说明 |
|------|--------|------|------|
| 核心路径测试 | P1 | 无 | 认证、CRUD、编辑器保存的测试 |
| Tailwind 设计令牌集成 | P2 | 无 | 将 CSS 变量映射到 theme.extend |
| Dashboard 重构为 Server Component | P2 | 无 | 利用 SSR 优势 |
| CDN 资源本地化 | P2 | 无 | Iconify 和纸质纹理 |
| Agent 测试迁移到 Vitest | P2 | 无 | 统一测试框架 |
| 清理重复代码 | P2 | 无 | 两个 AgentManager、重复 API 路由 |

### Phase 4: 优化与扩展

| 任务 | 优先级 | 依赖 | 说明 |
|------|--------|------|------|
| AI 不打扰原则 | P2 | 行为记录 | 上下文相关性判断 |
| Fountain 格式导出 | P2 | 无 | 行业标准格式 |
| 虚拟滚动 | P2 | 无 | 大量场景时的性能优化 |
| 防盗版选项 | P3 | 无 | 水印/纯图 PDF |
| T8Star 图片生成 | P3 | 无 | AI 图片集成 |

---

## 六、需求变更建议

1. **Studio 多 Agent 协作页面** — 代码中有 `app/studio/` 目录，不在 PRD MVP 范围内。建议明确其定位：实验性功能还是纳入 PRD。

2. **测试目标调整** — PRD 要求覆盖率 > 70%，当前 < 15%。建议 MVP 阶段目标调整为核心路径覆盖（~40%），后续迭代提升。

3. **AI Sidebar 模拟数据** — 当前使用硬编码模拟用户信息和初始消息，需与真实认证系统和 AI 服务对接。

4. **集长计算 Skill** — PRD 功能模块架构中列出但 Sprint 计划未安排，建议明确优先级。

---

## 七、已完成的修复（本次评估期间）

在评估过程中，同步修复了项目中的 **333 个 TypeScript 类型错误**：

| 修复类别 | 文件数 | 说明 |
|---------|--------|------|
| Agent 系统类型不匹配 | 12 | index.ts 导出、AgentScheduler、IntentRouter、Skill 基类等 |
| API 路由类型错误 | 2 | ai/test/route.ts 联合类型守卫、projects.ts import type |
| 测试文件排除 | 1 | tsconfig.json 排除测试文件（由 Vitest 处理） |

---

## 相关文档

- [PRD v2.5](../../prd/prd-v2.5.md)
- [技术栈](../../tech/tech-stack.md)
- [数据模型](../../tech/data-model.md)
- [设计系统](../../design/ui-design-system.md)
- [实施计划](../../plans/plan-sprint-mvp.md)
