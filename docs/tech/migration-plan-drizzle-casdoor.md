# 技术栈迁移计划：Prisma → Drizzle + NextAuth.js → Casdoor

**项目**: 剧灵 (Scripter)
**日期**: 2026-01-23
**状态**: 待执行

---

## 一、迁移概述

### 1.1 迁移目标

| 组件 | 从 | 到 | 原因 |
|------|----|----|----|
| ORM | Prisma | Drizzle ORM | 更好的性能、类型安全、SQL 透明度 |
| 认证 | NextAuth.js | Casdoor | 统一身份管理、支持多种登录方式 |
| 数据库 | PostgreSQL | PostgreSQL (不变) | 保持不变 |

### 1.2 技术优势对比

#### Drizzle vs Prisma

| 特性 | Prisma | Drizzle |
|------|--------|---------|
| **性能** | 中等 | ⚡ 更快 (无查询解析开销) |
| **类型安全** | ✅ | ✅ 更精确 |
| **SQL 控制** | 隐式 | ✅ 显式、透明 |
| **包大小** | ~3MB | ✅ ~100KB |
| **学习曲线** | 平缓 | 稍陡 (需要 SQL) |
| **迁移** | 自动化 | ✅ SQL 优先、更灵活 |
| **Edge Runtime** | ❌ 不支持 | ✅ 完全支持 |

#### Casdoor vs NextAuth.js

| 特性 | NextAuth.js | Casdoor |
|------|-------------|---------|
| **部署方式** | 应用内集成 | ✅ 独立部署 |
| **管理界面** | ❌ 无 | ✅ 完整 Web UI |
| **多租户** | ⚠️ 有限 | ✅ 原生支持 |
| **OAuth/OIDC** | ✅ 支持 | ✅ 提供者 + 消费者 |
| **SSO** | ⚠️ 需自建 | ✅ 内置 |
| **用户管理** | 应用代码 | ✅ 可视化管理 |
| **协议支持** | OAuth 2.0 | ✅ OAuth 2.0 + OIDC + SAML |
| **国际化** | ⚠️ 有限 | ✅ 多语言支持 |

---

## 二、当前状态评估

### 2.1 数据库现状

**好消息**: 🎉
- ✅ Prisma schema 文件不存在
- ✅ 代码中未使用 Prisma Client
- ✅ 没有生产数据迁移风险
- ✅ 可以从零开始设计 Drizzle schema

### 2.2 认证现状

**好消息**: 🎉
- ✅ NextAuth.js 未完全集成
- ✅ 没有活跃用户会话
- ✅ 可以直接切换到 Casdoor

### 2.3 待实现数据模型

根据 PRD v2.0，需要实现以下实体：

```typescript
// 用户
interface User {
  id: string
  email: string
  name: string?
  subscription: Subscription
  aiQuota: number
  createdAt: Date
  updatedAt: Date
}

// 项目
interface Project {
  id: string
  name: string
  genre: string[]
  targetEpisodes: number
  currentStage: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

// 人物
interface Character {
  id: string
  projectId: string
  name: string
  poem: string?
  // ... 更多字段
}

// 场景
interface Scene {
  id: string
  projectId: string
  episodeNumber: number
  sceneNumber: number
  location: string
  timeOfDay: string
  intExt: string
  content: Json
  duration: number
  status: string
}

// 世界观
interface Worldview {
  id: string
  projectId: string
  era: string?
  geography: string?
  // ... 更多字段
}

// 分镜
interface Storyboard {
  id: string
  projectId: string
  shots: Json
}

// 剧本版本
interface ScriptVersion {
  id: string
  scriptId: string
  projectId: string
  version: number
  label: string?
  isMilestone: boolean
  content: Json
  createdAt: Date
}
```

---

## 三、Drizzle ORM 实施方案

### 3.1 安装依赖

```bash
# 卸载 Prisma
npm uninstall prisma @prisma/client

# 安装 Drizzle
npm install drizzle-orm
npm install -D drizzle-kit

# 安装 PostgreSQL 驱动
npm install postgres
# 或
npm install @neondatabase/serverless
```

### 3.2 Drizzle Schema 定义

**目录结构**:
```
drizzle/
├── schema/
│   ├── user.ts
│   ├── project.ts
│   ├── character.ts
│   ├── scene.ts
│   ├── worldview.ts
│   ├── storyboard.ts
│   ├── script-version.ts
│   └── index.ts
├── migrations/
│   ├── 0001_initial.sql
│   └── meta/
│       └── 0001.json
└── config.ts
```

**示例 Schema - User**:
```typescript
// drizzle/schema/user.ts
import { pgTable, serial, text, timestamp, integer, enum as pgEnum } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const subscriptionEnum = pgEnum('subscription', ['FREE', 'PERSONAL', 'TEAM', 'ENTERPRISE'])

export const users = pgTable('users', {
  id: text('id').primaryKey(), // 使用 Casdoor 的用户 ID
  email: text('email').notNull().unique(),
  name: text('name'),
  subscription: subscriptionEnum('subscription').default('FREE').notNull(),
  aiQuota: integer('ai_quota').default(500).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
}))
```

**示例 Schema - Project**:
```typescript
// drizzle/schema/project.ts
import { pgTable, text, integer, timestamp, json } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './user'

export const projects = pgTable('projects', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  genre: json('genre').$type<string[]>().notNull().default([]),
  targetEpisodes: integer('target_episodes').notNull(),
  currentStage: text('current_stage').notNull().default('worldview'),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  characters: many(characters),
  scenes: many(scenes),
}))
```

### 3.3 Drizzle 配置

```typescript
// drizzle/config.ts
import type { Config } from 'drizzle-kit'

export default {
  schema: './drizzle/schema',
  out: './drizzle/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config
```

### 3.4 数据库客户端

```typescript
// lib/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './drizzle/schema'

const connectionString = process.env.DATABASE_URL!

const client = postgres(connectionString)
export const db = drizzle(client, { schema })
```

### 3.5 迁移工作流

```bash
# 1. 生成迁移
npx drizzle-kit generate

# 2. 应用迁移
npx drizzle-kit migrate

# 3. 开发时自动推送（仅开发环境）
npx drizzle-kit push

# 4. 查看 Studio
npx drizzle-kit studio
```

---

## 四、Casdoor 实施方案

### 4.1 Casdoor 架构

```
┌─────────────────────────────────────────────────────────┐
│                    剧灵前端 (Next.js)                     │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Casdoor SDK (React)                              │   │
│  │  - 登录按钮                                        │   │
│  │  - 用户信息获取                                    │   │
│  │  - Token 管理                                     │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↕ OAuth 2.0
┌─────────────────────────────────────────────────────────┐
│              Casdoor 服务 (独立部署)                      │
│  ┌──────────────┬──────────────┬────────────────────┐   │
│  │ 前端 UI      │ 后端 API     │ 数据库             │   │
│  │ - 登录表单    │ - OAuth      │ - users           │   │
│  │ - 用户管理    │ - OIDC       │ - applications    │   │
│  │ - 权限配置    │ - SAML       │ - organizations   │   │
│  └──────────────┴──────────────┴────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↕ 读取用户信息
┌─────────────────────────────────────────────────────────┐
│              剧灵数据库 (PostgreSQL)                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │ users 表 (只存储 Casdoor user_id 引用)           │   │
│  │ projects, characters, scenes...                  │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Casdoor 部署

#### 方式 A: Docker 部署 (推荐)

```yaml
# docker-compose.casdoor.yml
version: '3'

services:
  casdoor:
    image: casbin/casdoor:latest
    ports:
      - "8000:8000"
    environment:
      - DRIVER=postgres
      - SQL_DATASOURCE=host=postgres;port=5432;user=casdoor;password=casdoor;dbname=casdoor
      - REDIS_DATASOURCE=
      - OPERATOR_ADMIN_USERNAME=admin
      - OPERATOR_ADMIN_PASSWORD=admin
    depends_on:
      - postgres
    networks:
      - casdoor-network

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_USER=casdoor
      - POSTGRES_PASSWORD=casdoor
      - POSTGRES_DB=casdoor
    volumes:
      - casdoor-postgres:/var/lib/postgresql/data
    networks:
      - casdoor-network

volumes:
  casdoor-postgres:

networks:
  casdoor-network:
```

#### 方式 B: 本地开发部署

```bash
# 克隆 Casdoor
git clone https://github.com/casdoor/casdoor.git
cd casdoor

# 配置 conf/app.conf
# 设置数据库连接

# 运行
go run main.go
```

### 4.3 Casdoor 配置

1. **登录 Casdoor 管理后台** (http://localhost:8000)
   - 默认账号: admin / admin

2. **创建组织**
   - Organization: scripter
   - 显示名称: 剧灵

3. **创建应用**
   - Name: scripter-web
   - Organization: scripter
   - Redirect URLs: http://localhost:3000/api/auth/callback
   - Grant types: authorization_code, token, password

4. **获取配置信息**
   - Client ID: xxx
   - Client Secret: xxx
   - Endpoint: http://localhost:8000

### 4.4 Next.js 集成

#### 安装依赖

```bash
npm install casdoor-js-sdk
```

#### 环境变量

```bash
# .env.local
NEXT_PUBLIC_CASDOOR_CLIENT_ID=xxx
NEXT_PUBLIC_CASDOOR_ENDPOINT=http://localhost:8000
CASDOOR_CLIENT_SECRET=xxx
CASDOOR_ORGANIZATION=scripter
CASDOOR_APPLICATION=scripter-web
```

#### Casdoor 配置

```typescript
// lib/casdoor/config.ts
importSdk from 'casdoor-js-sdk'

const config = {
  serverUrl: process.env.NEXT_PUBLIC_CASDOOR_ENDPOINT!,
  clientId: process.env.NEXT_PUBLIC_CASDOOR_CLIENT_ID!,
  appName: process.env.CASDOOR_APPLICATION!,
  organizationName: process.env.CASDOOR_ORGANIZATION!,
  redirectPath: '/api/auth/callback',
}

export const authClient = newSdk(config)
```

#### 登录 API

```typescript
// app/api/auth/login/route.ts
import { authClient } from '@/lib/casdoor/config'

export async function GET(req: Request) {
  const url = authClient.getSigninUrl()
  return Response.redirect(url)
}
```

#### 回调 API

```typescript
// app/api/auth/callback/route.ts
import { authClient } from '@/lib/casdoor/config'
import { db } from '@/lib/db'
import { users } from '@/drizzle/schema'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  // 交换 token
  const token = await authClient.getOAuthToken(code, state)

  // 获取用户信息
  const userInfo = await authClient.getUserInfo(token.accessToken)

  // 创建或更新用户
  await db.insert(users).values({
    id: userInfo.id,
    email: userInfo.email,
    name: userInfo.displayName,
    subscription: 'FREE',
    aiQuota: 500,
  }).onConflictDoUpdate({
    target: users.id,
    set: {
      name: userInfo.displayName,
      updatedAt: new Date(),
    },
  })

  // 设置会话
  // ... 使用 Next.js session 或 JWT

  return Response.redirect('/dashboard')
}
```

#### 登出 API

```typescript
// app/api/auth/logout/route.ts
import { authClient } from '@/lib/casdoor/config'

export async function POST(req: Request) {
  // 清除会话
  // ...

  const url = authClient.getSignoutUrl()
  return Response.redirect(url)
}
```

#### 用户信息 Hook

```typescript
// hooks/use-user.ts
'use client'

import { useQuery } from '@tanstack/react-query'
import { useSession } from './use-session'

export function useUser() {
  const { token } = useSession()

  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetch('/api/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return res.json()
    },
    enabled: !!token,
  })
}
```

---

## 五、完整迁移计划

### 阶段 1: Drizzle ORM 设置 (1天)

**任务清单**:
- [ ] 卸载 Prisma，安装 Drizzle
- [ ] 创建 Drizzle schema 文件
- [ ] 配置 Drizzle Kit
- [ ] 创建数据库连接
- [ ] 生成并运行初始迁移
- [ ] 验证类型安全

**验收标准**:
- ✅ 所有 PRD 定义的实体都已定义
- ✅ TypeScript 类型正确
- ✅ 数据库表已创建
- ✅ 可以通过 Drizzle Client 查询数据

### 阶段 2: Casdoor 部署 (1天)

**任务清单**:
- [ ] Docker 部署 Casdoor
- [ ] 创建组织和应用
- [ ] 配置 OAuth 回调
- [ ] 安装 Casdoor SDK
- [ ] 创建登录/登出 API
- [ ] 实现会话管理

**验收标准**:
- ✅ Casdoor 管理后台可访问
- ✅ 可以通过 Casdoor 登录
- ✅ 用户信息正确同步到数据库
- ✅ 会话管理正常工作

### 阶段 3: 数据访问层重构 (2-3天)

**任务清单**:
- [ ] 创建用户相关的 CRUD 操作
- [ ] 创建项目相关的 CRUD 操作
- [ ] 创建人物、场景等实体的 CRUD
- [ ] 实现事务处理
- [ ] 添加查询优化

**验收标准**:
- ✅ 所有 CRUD 操作都经过类型检查
- ✅ 查询性能符合预期
- ✅ 事务正确处理

### 阶段 4: 前端集成 (2天)

**任务清单**:
- [ ] 更新 API 路由使用 Drizzle
- [ ] 集成 Casdoor 登录组件
- [ ] 更新会话管理
- [ ] 更新权限检查
- [ ] 测试完整用户流程

**验收标准**:
- ✅ 用户可以登录/登出
- ✅ 数据正确显示
- ✅ 权限控制正常
- ✅ 用户体验流畅

### 阶段 5: 测试与优化 (2天)

**任务清单**:
- [ ] 单元测试 (Drizzle queries)
- [ ] 集成测试 (认证流程)
- [ ] 性能测试 (查询优化)
- [ ] 安全测试 (SQL 注入、XSS)
- [ ] 文档更新

**验收标准**:
- ✅ 测试覆盖率 > 80%
- ✅ 性能无退化
- ✅ 安全漏洞修复
- ✅ 文档完整

---

## 六、风险与应对

### 6.1 技术风险

| 风险 | 影响 | 概率 | 应对措施 |
|------|------|------|----------|
| Drizzle 学习曲线 | 中 | 低 | 参考 Drizzle 官方文档，使用 AI 辅助 |
| Casdoor 配置复杂 | 中 | 中 | 使用 Docker 一键部署，参考官方示例 |
| 数据迁移问题 | 高 | 低 | 无生产数据，从零开始 |
| 性能问题 | 中 | 低 | Drizzle 性能更好，可能反而提升 |

### 6.2 运维风险

| 风险 | 影响 | 概率 | 应对措施 |
|------|------|------|----------|
| Casdoor 服务单点 | 高 | 中 | 部署在云服务器，配置高可用 |
| OAuth Token 过期 | 中 | 中 | 实现刷新令牌机制 |
| Session 管理 | 中 | 低 | 使用 Redis 存储 session |

---

## 七、回滚方案

### 7.1 Drizzle → Prisma 回滚

```bash
# 如果需要回滚
git checkout <commit-before-migration>

# 重新安装 Prisma
npm install prisma @prisma/client

# 恢复 Prisma schema
# (如果有备份)
```

### 7.2 Casdoor → NextAuth.js 回滚

```bash
# 如果需要回滚
git checkout <commit-before-migration>

# 重新安装 NextAuth
npm install next-auth

# 恢复 NextAuth 配置
# (如果有备份)
```

---

## 八、时间估算

| 阶段 | 任务 | 工作量 | 负责人 |
|------|------|--------|--------|
| 1 | Drizzle ORM 设置 | 1天 | 后端开发 |
| 2 | Casdoor 部署 | 1天 | DevOps |
| 3 | 数据访问层重构 | 2-3天 | 后端开发 |
| 4 | 前端集成 | 2天 | 前端开发 |
| 5 | 测试与优化 | 2天 | 全员 |
| **总计** | | **8-9天** | |

---

## 九、后续优化

### 9.1 性能优化

- [ ] 实现 Drizzle 连接池
- [ ] 添加查询结果缓存
- [ ] 使用 Drizzle Studio 调试
- [ ] 优化数据库索引

### 9.2 功能增强

- [ ] 实现 RBAC 权限控制
- [ ] 添加多租户支持
- [ ] 集成 SSO (企业版)
- [ ] 实现审计日志

---

## 十、参考资料

### Drizzle ORM
- 官方文档: https://orm.drizzle.team/
- GitHub: https://github.com/drizzle-team/drizzle-orm
- 迁移指南: https://orm.drizzle.team/docs/migrate

### Casdoor
- 官方文档: https://casdoor.org/docs/basic-overview
- GitHub: https://github.com/casdoor/casdoor
- Next.js 集成: https://casdoor.org/docs/integration/nextjs

---

**让灵感，在剧本中苏醒** ✨
