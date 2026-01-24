# Multi-Agent 系统设计文档

**项目**: 剧灵 (Scripter)
**日期**: 2026-01-23
**版本**: 1.0

---

## 概述

本文档描述了剧灵项目的Multi-Agent并行开发系统架构，用于加速Next.js项目的初始化和后续开发。

## 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                     剧灵 Multi-Agent 开发系统                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              持久化 Agent 层（可复用）                      │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  🎨 ui-component-agent    │  🤖 ai-integration-agent    │  │
│  │  - shadcn/ui 组件定制     │  - GLM-4.7 流式响应         │  │
│  │  - Tailwind 主题配置      │  - T8Star 图片生成          │  │
│  │  - 响应式布局             │  - 意图路由系统            │  │
│  │                          │  - Tool Use 实现            │  │
│  ├──────────────────────────┼──────────────────────────────┤  │
│  │  💾 data-agent           │  🔌 integration-agent       │  │
│  │  - Prisma Schema 设计    │  - 模块集成                 │  │
│  │  - PostgreSQL 查询优化   │  - API 路由协调             │  │
│  │  - 数据迁移脚本          │  - 状态管理                 │  │
│  └──────────────────────────┴──────────────────────────────┘  │
│                              ↓                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           临时并行 Agent 层（Phase 2 初始化）                 │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  📦 Agent-Init-Frontend    │  🔌 Agent-Init-API          │  │
│  │  - Next.js 14 项目创建     │  - GLM-4.7 客户端配置       │  │
│  │  - shadcn/ui + Tailwind    │  - T8Star 客户端配置        │  │
│  │  - 主题色 + 字体系统       │  - API 测试与验证           │  │
│  │  ├─────────────────────────┼──────────────────────────┤  │
│  │  💾 Agent-Init-Data       │                            │  │
│  │  - Prisma + PostgreSQL    │                            │  │
│  │  - NextAuth.js 配置       │                            │  │
│  │  - 基础 Schema 设计       │                            │  │
│  └──────────────────────────┴──────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 设计原则

1. **职责分离**: 持久化agent专注技术能力，临时agent专注任务执行
2. **依赖管理**: Agent-Init-Frontend必须先完成（其他agent依赖项目结构）
3. **状态共享**: 所有agent写入同一个Next.js项目，通过文件系统协调
4. **错误隔离**: 每个agent独立执行，失败不影响其他agent

---

## 持久化Agent

### Agent 1: ui-component-agent

**文件**: `.claude/agents/ui-component-agent.md`

**职责范围**:
- shadcn/ui 组件的定制与扩展
- Tailwind CSS 主题配置（米色背景系统、金色品牌色）
- 响应式布局实现
- 可访问性（a11y）优化

**核心能力**:
- 主题色快速切换：#F5F1E8（背景）、#C9A962（品牌金）
- 字体系统应用：Noto Serif SC（标题）、Inter + Noto Sans SC（正文）
- 玻璃拟态卡片组件
- A4 标准编辑器样式
- 拖拽排序UI适配

**触发场景**: 需要创建/修改 shadcn/ui 组件、调整主题色或样式、实现响应式布局时

---

### Agent 2: ai-integration-agent

**文件**: `.claude/agents/ai-integration-agent.md`

**职责范围**:
- 智谱 GLM-4.7 API 集成
- T8Star 图片生成 API 集成
- 流式响应处理
- Tool Use 实现
- 意图路由系统（Intention Dispatcher）

**核心能力**:
```
- lib/zhipu/client.ts - GLM-4.7 客户端
- lib/t8star/client.ts - T8Star 客户端
- hooks/useZhipuChat.ts - 流式对话 hook
- lib/ai/intention-dispatcher.ts - 意图路由
- lib/ai/skills/ - 原子化技能（格式修复、集长计算等）
- lib/ai/agents/ - 专家代理（观众批判、剧情反转等）
```

**触发场景**: 需要调用 GLM-4.7 或 T8Star API、实现流式响应、添加新的 AI Skill 或 Agent 时

---

### Agent 3: data-agent

**文件**: `.claude/agents/data-agent.md`

**职责范围**:
- Prisma Schema 设计与维护
- PostgreSQL 查询优化
- 数据库迁移脚本
- NextAuth.js 数据模型

**核心能力**:
- prisma/schema.prisma - 数据模型定义
- 项目、人物、场景、世界观、分镜 表结构
- 用户认证与权限模型
- 数据关系设计（一对多、多对多）
- 查询性能优化

**触发场景**: 需要修改数据模型、创建新表或关系、优化数据库查询时

---

### Agent 4: integration-agent

**文件**: `.claude/agents/integration-agent.md`

**职责范围**:
- 模块间集成协调
- API 路由设计与实现
- 状态管理（Zustand/Jotai）
- 错误处理与日志

**核心能力**:
- app/api/ - API 路由设计
- lib/store/ - 全局状态管理
- 中间件配置（认证、错误处理）
- 模块通信协议
- 集成测试

**触发场景**: 需要集成多个模块、设计 API 接口、处理跨模块状态时

---

## 临时并行Agent

### Phase 2 初始化任务分配

```
                    Agent-Init-Frontend (优先执行)
                         │
                    ┌────┴────┐
                    ↓         ↓
            Agent-Init-API  Agent-Init-Data
                    │         │
                    └────┬────┘
                         ↓
                    项目就绪 ✓
```

### Agent-Init-Frontend

**任务清单**:
```
① 创建 Next.js 14 项目
   - npx create-next-app@latest --typescript --tailwind --app
   - 配置 tsconfig.json 路径别名 (@/components, @/lib, @/app)

② 配置 shadcn/ui
   - npx shadcn-ui@latest init
   - 设置主题变量（米色背景系统）

③ 配置 Tailwind CSS 主题
   - 自定义颜色：background (#F5F1E8)、primary (#C9A962)
   - 配置字体：Noto Serif SC、Inter、Noto Sans SC
   - 8px 网格间距系统

④ 创建基础目录结构
   - app/ (页面路由)
   - components/ (UI组件)
   - lib/ (工具函数)
   - public/ (静态资源)
```

**输出文件**:
```
D:\Develop\Scripter_claude\projects\scripter-nextjs\
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── components.json (shadcn/ui配置)
├── app/
│   ├── layout.tsx (根布局 + 字体配置)
│   └── page.tsx (首页)
└── lib/
    └── utils.ts (cn函数等)
```

---

### Agent-Init-API

**任务清单**:
```
① 配置智谱 GLM-4.7 客户端
   - 创建 lib/zhipu/client.ts
   - 实现 streamChat() 方法
   - 实现 chat() 方法（非流式）
   - 错误处理与重试逻辑

② 配置 T8Star 图片客户端
   - 创建 lib/t8star/client.ts
   - 实现 generateImage() 方法
   - 图片上传与存储逻辑

③ 环境变量配置
   - 创建 .env.local 模板
   - ZHIPU_API_KEY
   - T8STAR_API_KEY

④ API 测试
   - 创建测试脚本验证两个 API 连通性
```

**输出文件**:
```
D:\Develop\Scripter_claude\projects\scripter-nextjs\
├── .env.local.example
├── lib/
│   ├── zhipu/
│   │   ├── client.ts
│   │   └── types.ts
│   └── t8star/
│       ├── client.ts
│       └── types.ts
└── scripts/
    └── test-apis.ts
```

---

### Agent-Init-Data

**任务清单**:
```
① 配置 Prisma + PostgreSQL
   - npm install prisma @prisma/client
   - npx prisma init
   - 配置 DATABASE_URL

② 设计基础数据模型
   - User（用户）
   - Project（项目）
   - Character（人物）
   - Scene（场景）
   - Worldview（世界观）
   - Storyboard（分镜）

③ 配置 NextAuth.js
   - npm install next-auth @auth/prisma-adapter
   - 创建 app/api/auth/[...nextauth]/route.ts
   - 配置 Prisma Adapter

④ 生成初始迁移
   - npx prisma migrate dev --name init
```

**输出文件**:
```
D:\Develop\Scripter_claude\projects\scripter-nextjs\
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── .env.local.example (追加 DATABASE_URL)
├── lib/
│   └── prisma.ts (单例客户端)
└── app/
    └── api/
        └── auth/
            └── [...nextauth]/
                └── route.ts
```

---

## 执行流程

### 时间线

```
0:00 ────────────────────────────────────────── 5:00
      │                                      │
      ├─ Agent-Init-Frontend ────────────────┤
      │                                      │
      └─ Agent-Init-API ─────────────────────┤
                                             │
      └─ Agent-Init-Data ────────────────────┘
```

### 协调点

1. **启动前**:
   - [ ] 确认 `D:\Develop\Scripter_claude\projects\` 目录可写
   - [ ] 确认 Node.js 18+ 已安装
   - [ ] 确认 npm 或 pnpm 可用

2. **执行中**:
   - [ ] Agent-Init-Frontend 先启动
   - [ ] 等待项目创建完成
   - [ ] 并行启动 Agent-Init-API 和 Agent-Init-Data
   - [ ] 监控各 agent 的 `.progress.json`

3. **完成后**:
   - [ ] 验证所有文件已创建
   - [ ] 合并 `.env.local`（去除重复变量）
   - [ ] 运行 `npm run dev` 确认项目启动
   - [ ] 更新 `progress.md`
   - [ ] git commit

---

## 状态同步机制

| 机制 | 实现方式 |
|------|----------|
| **文件锁** | 使用 `.lock` 文件防止写入冲突 |
| **进度追踪** | 每个agent更新 `.progress.json` |
| **错误隔离** | agent失败不影响其他agent，记录到 `.error.log` |
| **结果合并** | 主agent检查所有 `.progress.json` 后合并 `.env.local` |

---

## API配置参考

### 智谱 GLM-4.7

```
API Base: https://open.bigmodel.cn/api/paas/v4
API Key: 348ac438fd6041cda3c6f1799c66103c.1CY7SJdkJB2K9myk
Model: glm-4.7
```

### T8Star

```
API Base: https://ai.t8star.cn
API Key: sk-hw1qk4MMad06RLuwKcatZ7zRl5JdespQexTMRqciwuCYqBTx
Model: nano-banana-2
```

---

## 设计系统规范

### 色彩体系

```
背景色：#F5F1E8（温暖米色）
表面色：#FFFFFF（白色编辑容器）
文字主色：#1A1A1A（深墨黑）
文本副色：#5C5548（深褐）
品牌主色：#C9A962（古典金色）
品牌深色：#A68A45（暗金）
边框色：#D3C9B0（浅褐）
```

### 字体系统

```
UI正文：Inter + Noto Sans SC
品牌标题：Noto Serif SC（思源宋体）
编辑区：Courier Prime + Noto Sans SC（18px，行高 1.6）
```

### 间距系统（8px网格）

```
xs: 4px | sm: 8px | base: 12px | md: 16px | lg: 20px | xl: 24px | 2xl: 32px
```

### 圆角规范

```
sm: 4px | base: 8px | lg: 12px | full: 9999px
```

---

## 文件结构

```
D:\Develop\Scripter_claude\
├── .claude/
│   ├── agents/
│   │   ├── ui-component-agent.md
│   │   ├── ai-integration-agent.md
│   │   ├── data-agent.md
│   │   └── integration-agent.md
│   └── plugin.json
├── projects\
│   └── scripter-nextjs\          ← 3个临时agent共同写入
│       ├── app/
│       ├── components/
│       ├── lib/
│       ├── prisma/
│       ├── .env.local
│       ├── .agent-1-progress.json
│       ├── .agent-2-progress.json
│       └── .agent-3-progress.json
└── docs\
    ├── plans\
    │   └── 2026-01-23-multi-agent-design.md ← 本设计文档
    ├── task_plan.md
    ├── progress.md
    └── findings.md
```

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-01-23 | 初始版本 |
