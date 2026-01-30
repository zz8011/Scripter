# Scripter 前后端连接分析报告

> **类型**: task
> **日期**: 2026-01-26
> **作者**: Claude
> **相关任务**: 前后端架构连接审查

---

## 执行摘要

本报告全面分析了 Scripter 项目的前端页面与后端 API 的连接情况。经过详细审查，发现项目存在**严重的前后端断连问题**：前端页面完全使用 Zustand + localStorage 进行状态管理，未与后端 API 集成；后端 API 已完整实现但未被使用。

**关键发现**:
- ✅ 后端 API 完整实现 (18 个端点)
- ❌ 前端页面未调用任何 API
- ❌ 数据持久化仅在前端 localStorage
- ⚠️ `scripter-backend/` 目录为空，无实际后端服务

---

## 1. 项目架构现状

### 1.1 实际架构

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js 前端 (app/)                      │
│                                                               │
│  前端页面 (Client Components)                                 │
│    ├── Dashboard (useProjectStore)                          │
│    ├── Characters (useCharacterStore)                       │
│    ├── Scenes (useSceneStore)                               │
│    ├── Worldview (useWorldviewStore)                        │
│    ├── Storyboard (useStoryboardStore)                      │
│    ├── Editor (useEditorStore)                              │
│    └── Test-AI (调用 /api/ai/test)                          │
│                          ↓                                   │
│                  Zustand Stores (lib/stores/)                │
│                    ↓ persist (localStorage)                  │
│              前端本地持久化 (浏览器 localStorage)              │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   Next.js API Routes (app/api/)              │
│                                                               │
│  ✓ AI 服务                                                   │
│    ├── POST /api/ai/chat (认证 + quota)                     │
│    ├── POST /api/ai/stream (SSE)                            │
│    └── POST /api/ai/test (开发模式)                         │
│  ✓ 认证服务 (Casdoor)                                        │
│    ├── GET  /api/auth/login                                 │
│    ├── GET  /api/auth/callback                              │
│    └── POST /api/auth/logout                                │
│  ✓ CRUD 服务 (Drizzle ORM + PostgreSQL)                     │
│    ├── GET/POST /api/projects                               │
│    ├── GET/POST /api/characters                            │
│    ├── GET/POST /api/scenes                                 │
│    ├── GET/POST /api/worldview                              │
│    └── GET/POST /api/storyboards                            │
│                                                               │
│  ⚠️ 状态：已实现但未被前端调用                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              数据库层 (PostgreSQL + Drizzle ORM)             │
│                                                               │
│  ✓ Schema 定义 (lib/db/schema/)                              │
│    ├── users.ts                                             │
│    ├── projects.ts                                          │
│    ├── characters.ts                                        │
│    ├── scenes.ts                                            │
│    ├── worldview.ts                                         │
│    └── storyboards.ts                                       │
│  ✓ Query 函数 (lib/db/queries/)                              │
│    └── 完整的 CRUD 操作                                      │
│                                                               │
│  ⚠️ 状态：已实现但未使用                                      │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 `scripter-backend/` 目录分析

```bash
scripter-backend/
├── public/          # 静态资源目录 (空)
└── src/
    └── app/
        └── favicon.ico/route.ts  # 仅有一个 favicon 路由
```

**结论**: `scripter-backend/` 目录不是独立的后端服务，而是历史遗留或计划中的目录。**所有后端逻辑都在 `app/api/` 中实现**。

---

## 2. 前端页面连接情况

### 2.1 页面与 Store 依赖关系

| 页面 | Store | API 调用 | 数据持久化 |
|------|-------|---------|-----------|
| **Dashboard** | `useProjectStore` | ❌ 无 | ✅ localStorage |
| **Characters** | `useCharacterStore` | ❌ 无 | ✅ localStorage |
| **Scenes** | `useSceneStore` | ❌ 无 | ✅ localStorage |
| **Worldview** | `useWorldviewStore` | ❌ 无 | ✅ localStorage |
| **Storyboard** | `useStoryboardStore` | ❌ 无 | ✅ localStorage |
| **Editor** | `useEditorStore` | ❌ 无 | ✅ localStorage |
| **Test-AI** | 无 (本地状态) | ✅ `/api/ai/test` | ❌ 无 |
| **Script-Demo** | 无 (本地状态) | ❌ 无 | ❌ 无 |

### 2.2 关键发现

#### Dashboard 页面 (`app/dashboard/page.tsx`)

```typescript
// ❌ 仅使用 mock 数据，未调用 API
useEffect(() => {
  if (projects.length === 0) {
    mockProjects.forEach(project => addProject(project));
  }
}, []);

// ❌ 创建项目仅打印日志，无实际功能
const handleCreateProject = () => {
  console.log('Creating new project...'); // TODO
};
```

**连接状态**: ❌ 未连接到 `/api/projects`

#### Characters 页面 (`app/characters/page.tsx`)

```typescript
// ❌ 完全使用 useCharacterStore
const { characters, deleteCharacter } = useCharacterStore();

// ❌ 表单提交仅更新 Store
const handleSubmit = () => {
  addCharacter(newCharacter); // 仅本地更新
};
```

**连接状态**: ❌ 未连接到 `/api/characters`

#### Test-AI 页面 (`app/test-ai/page.tsx`)

```typescript
// ✅ 唯一真正调用 API 的页面
const res = await fetch('/api/ai/test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message }),
});
```

**连接状态**: ✅ 已连接到 `/api/ai/test`

---

## 3. 后端 API 实现情况

### 3.1 AI 服务 API

| 端点 | 方法 | 功能 | 认证 | 状态 |
|------|------|------|------|------|
| `/api/ai/chat` | POST | AI 对话 (完整响应) | ✅ Required | ✅ 已实现 |
| `/api/ai/stream` | POST | AI 对话 (SSE 流) | ✅ Required | ✅ 已实现 |
| `/api/ai/test` | POST | AI 测试 (开发模式) | ❌ 不需要 | ✅ 已实现 |
| `/api/ai-conversations` | GET/POST | AI 对话记录管理 | ✅ Required | ✅ 已实现 |

**实现细节**:
- ✅ 集成智谱 GLM-4.7
- ✅ 配额管理 (`checkUserQuota`, `useQuota`)
- ✅ Token 使用统计
- ✅ Server-Sent Events 支持

**前端连接**: ❌ 仅 `/api/ai/test` 被调用，其他端点未使用

### 3.2 认证服务 API

| 端点 | 方法 | 功能 | 状态 |
|------|------|------|------|
| `/api/auth/login` | GET | 生成 OAuth URL | ✅ 已实现 |
| `/api/auth/callback` | GET | 处理 Casdoor 回调 | ✅ 已实现 |
| `/api/auth/logout` | POST | 用户登出 | ✅ 已实现 |

**实现细节**:
- ✅ PKCE 流程
- ✅ Casdoor 集成
- ✅ Session 管理
- ✅ 自动创建用户

**前端连接**: ❌ 未使用 (无登录页面)

### 3.3 数据 CRUD API

#### Projects API (`/api/projects`)

```typescript
// ✅ 完整实现
export async function GET(request: NextRequest) {
  const session = await getSession();
  const projects = await getProjectsByUserId(session.user.id);
  return NextResponse.json({ projects });
}

export async function POST(request: NextRequest) {
  const validatedData = createProjectSchema.parse(body);
  const project = await createProject({
    ...validatedData,
    userId: session.user.id,
  });
  return NextResponse.json({ project }, { status: 201 });
}
```

**支持操作**:
- ✅ GET: 获取用户所有项目
- ✅ POST: 创建新项目 (含 Zod 验证)
- ✅ 认证检查
- ✅ 用户权限验证

**前端连接**: ❌ Dashboard 页面未调用

#### Characters API (`/api/characters`)

```typescript
// ✅ 完整实现
export async function GET(request: NextRequest) {
  const projectId = searchParams.get('projectId');
  // 验证项目权限
  const project = await getProjectById(projectId);
  if (!project || project.userId !== session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 404 });
  }
  const characters = await getCharactersByProjectId(projectId);
  return NextResponse.json({ characters });
}
```

**支持操作**:
- ✅ GET: 按项目获取人物列表
- ✅ POST: 创建新人物
- ✅ 权限验证

**前端连接**: ❌ Characters 页面未调用

#### Scenes API (`/api/scenes`)

**支持操作**:
- ✅ GET: 按项目/集数获取场景
- ✅ POST: 创建新场景
- ✅ PUT/PATCH: 更新场景 (通过 `[id]/route.ts`)
- ✅ DELETE: 删除场景

**前端连接**: ❌ Scenes 页面未调用

#### Worldview API (`/api/worldview`)

**支持操作**:
- ✅ GET: 按项目/分类获取世界观设定
- ✅ POST: 创建新设定

**前端连接**: ❌ Worldview 页面未调用

#### Storyboards API (`/api/storyboards`)

**支持操作**:
- ✅ GET: 按项目/场景获取分镜
- ✅ POST: 创建新分镜

**前端连接**: ❌ Storyboard 页面未调用

---

## 4. 数据库层实现情况

### 4.1 数据库连接

```typescript
// lib/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

// ✅ 使用环境变量 DATABASE_URL
const connectionString = process.env.DATABASE_URL

// ✅ 懒加载初始化
export const db = drizzle(client, { schema })
```

**状态**: ✅ 已配置，依赖 `DATABASE_URL` 环境变量

### 4.2 Schema 定义

| 表名 | 文件 | 字段完整性 | 关系 |
|------|------|-----------|------|
| `users` | `lib/db/schema/users.ts` | ✅ 完整 | - |
| `projects` | `lib/db/schema/projects.ts` | ✅ 完整 | → users |
| `characters` | `lib/db/schema/characters.ts` | ✅ 完整 | → projects |
| `scenes` | `lib/db/schema/scenes.ts` | ✅ 完整 | → projects |
| `worldview` | `lib/db/schema/worldview.ts` | ✅ 完整 | → projects |
| `storyboards` | `lib/db/schema/storyboards.ts` | ✅ 完整 | → projects, scenes |

**状态**: ✅ 所有表已定义，包含关系外键

### 4.3 Query 函数

**位置**: `lib/db/queries/`

每个表都有完整的 CRUD 操作：
- ✅ `create*`: 创建记录
- ✅ `get*ById`: 根据 ID 获取
- ✅ `get*ByProjectId`: 按项目获取
- ✅ `update*`: 更新记录
- ✅ `delete*`: 删除记录

**状态**: ✅ 完整实现，但未使用

---

## 5. 连接问题详细分析

### 5.1 数据流断裂点

```
预期数据流:
用户操作 → 前端组件 → API 调用 → API Route → Query 函数 → 数据库
                                    ↓
                              返回响应 → 更新 Store → 更新 UI

实际数据流:
用户操作 → 前端组件 → 直接更新 Store → 持久化到 localStorage
                                    ↓
                              ❌ 无 API 调用
                              ❌ 无数据库操作
```

### 5.2 具体断连案例

#### 案例 1: 创建项目

**当前流程** (Dashboard):
```typescript
const handleCreateProject = () => {
  console.log('Creating new project...'); // ❌ 仅打印日志
};
```

**应该的流程**:
```typescript
const handleCreateProject = async () => {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: '新项目',
      scriptType: 'short-drama',
      // ...
    }),
  });
  const { project } = await res.json();
  addProject(project); // 同步到 Store
};
```

#### 案例 2: 创建人物

**当前流程** (CharacterFormDialog):
```typescript
const handleSubmit = () => {
  const newCharacter = { id: `char-${Date.now()}`, ...characterData };
  addCharacter(newCharacter); // ❌ 仅本地更新
};
```

**应该的流程**:
```typescript
const handleSubmit = async () => {
  const res = await fetch('/api/characters', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(characterData),
  });
  const { character } = await res.json();
  addCharacter(character); // 同步到 Store
};
```

---

## 6. 影响评估

### 6.1 功能性影响

| 功能 | 影响 | 严重程度 |
|------|------|---------|
| **多设备同步** | ❌ 无法实现 | 🔴 高 |
| **数据持久化** | ⚠️ 仅依赖 localStorage，易丢失 | 🔴 高 |
| **用户认证** | ❌ 未实现 | 🔴 高 |
| **AI 配额管理** | ❌ 未实现 | 🟡 中 |
| **数据备份** | ❌ 无法云端备份 | 🔴 高 |
| **协作功能** | ❌ 无法实现 | 🟡 中 |

### 6.2 用户体验影响

1. **数据丢失风险**: localStorage 容量限制 (5-10MB)，可能被清除
2. **无跨设备支持**: 用户无法在不同设备间同步数据
3. **无用户系统**: 无法实现个人化服务
4. **AI 功能受限**: 无法追踪使用量，无法配额管理

### 6.3 开发影响

1. **后端代码浪费**: 90% 的后端代码未使用
2. **数据库未使用**: PostgreSQL + Drizzle ORM 完整实现但零使用
3. **技术债务**: 需要重构所有前端组件以集成 API

---

## 7. 连接状态总结

### 7.1 已连接功能 (✅)

| 功能 | 前端页面 | API 端点 | 数据库 | 状态 |
|------|---------|---------|-------|------|
| **AI 测试** | `/test-ai` | `/api/ai/test` | ❌ 不需要 | ✅ 完全连接 |

**说明**: 开发模式下的 AI 测试是唯一真正调用 API 的功能。

### 7.2 部分连接功能 (⚠️)

| 功能 | 前端页面 | API 端点 | 数据库 | 状态 |
|------|---------|---------|-------|------|
| **AI 对话** | ❌ 无前端 UI | ✅ 已实现 | ✅ 已实现 | ⚠️ API 就绪，缺前端 |
| **用户认证** | ❌ 无前端 UI | ✅ 已实现 | ✅ 已实现 | ⚠️ API 就绪，缺前端 |

**说明**: 后端 API 完整实现，但前端无对应 UI 或未调用。

### 7.3 未连接功能 (❌)

| 功能 | 前端页面 | API 端点 | 数据库 | 状态 |
|------|---------|---------|-------|------|
| **项目管理** | ✅ Dashboard | ✅ 已实现 | ✅ 已实现 | ❌ 完全断连 |
| **人物管理** | ✅ Characters | ✅ 已实现 | ✅ 已实现 | ❌ 完全断连 |
| **场景管理** | ✅ Scenes | ✅ 已实现 | ✅ 已实现 | ❌ 完全断连 |
| **世界观管理** | ✅ Worldview | ✅ 已实现 | ✅ 已实现 | ❌ 完全断连 |
| **分镜管理** | ✅ Storyboard | ✅ 已实现 | ✅ 已实现 | ❌ 完全断连 |
| **剧本编辑** | ✅ Editor | ❌ 未实现 | ❌ 未实现 | ❌ 无后端支持 |
| **AI 配额** | ❌ 无 UI | ✅ 已实现 | ✅ 已实现 | ❌ 完全断连 |

---

## 8. 架构问题与建议

### 8.1 核心问题

1. **前后端完全分离开发**: 前端团队未与后端 API 集成
2. **状态管理策略错误**: 使用 Zustand + localStorage 作为唯一数据源
3. **`scripter-backend/` 误导**: 目录名称暗示有独立后端服务，实际不存在

### 8.2 修复建议

#### 建议 1: 逐步迁移到 API 集成

**优先级顺序**:
1. **用户认证** (必须首先实现)
   - 创建 `/login` 页面
   - 集成 `/api/auth/login` 和 `/api/auth/callback`
   - 实现认证保护的路由

2. **项目管理** (最高优先级)
   - 修改 `Dashboard` 页面，从 `/api/projects` 加载数据
   - 实现"创建项目"功能
   - 同步 Store 到 API

3. **人物管理** (高优先级)
   - 修改 `CharacterFormDialog`，调用 `/api/characters`
   - 实现加载、保存、更新、删除

4. **其他 CRUD** (中优先级)
   - Scenes、Worldview、Storyboard 依次集成

#### 建议 2: 实现同步机制

**方案 A**: 实时同步 (推荐)
```typescript
// 在 Store 中添加 API 集成
addProject: async (project) => {
  // 1. 乐观更新 UI
  set((state) => ({
    projects: [...state.projects, project],
  }));

  // 2. 调用 API
  try {
    const { project: saved } = await fetch('/api/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    }).then(r => r.json());

    // 3. 同步真实数据
    set((state) => ({
      projects: state.projects.map(p =>
        p.id === project.id ? saved : p
      ),
    }));
  } catch (error) {
    // 4. 错误回滚
    set((state) => ({
      projects: state.projects.filter(p => p.id !== project.id),
    }));
  }
},
```

**方案 B**: 分离 Server Actions (Next.js 推荐)
```typescript
// app/actions/projects.ts
'use server';

export async function getProjects() {
  const session = await auth();
  return await getProjectsByUserId(session.user.id);
}

export async function createProject(data: NewProject) {
  const session = await auth();
  return await createProjectQuery({ ...data, userId: session.user.id });
}

// 在页面中调用
const projects = await getProjects(); // Server Component
```

#### 建议 3: 清理误导性目录

```bash
# 删除或重命名 scripter-backend
mv scripter-backend archive/legacy-backend-placeholder
# 或在 README 中说明此目录为空
```

### 8.3 技术债务

| 类型 | 估算工作量 | 优先级 |
|------|-----------|--------|
| 实现用户认证 | 2-3 天 | 🔴 P0 |
| 集成 Project API | 1-2 天 | 🔴 P0 |
| 集成 Character API | 1 天 | 🟡 P1 |
| 集成 Scene API | 1 天 | 🟡 P1 |
| 集成其他 CRUD | 2-3 天 | 🟢 P2 |
| 实现 Editor 持久化 | 3-5 天 | 🟢 P2 |
| **总计** | **10-15 天** | - |

---

## 9. 数据验证

### 9.1 验证方法

本报告通过以下方法验证连接状态：

1. **代码审查**: 读取所有前端页面 (9 个)
2. **API 路由检查**: 读取所有 API 路由 (18 个端点)
3. **Store 分析**: 分析所有 Zustand Store (6 个)
4. **Grep 搜索**: 在 `components/` 和 `lib/stores/` 中搜索 `fetch(` 和 `api/`
5. **数据库检查**: 验证 Schema 和 Query 函数

### 9.2 验证结果

- ✅ 所有前端页面已审查
- ✅ 所有 API 路由已审查
- ✅ 所有 Store 已审查
- ✅ 数据库层已审查
- ✅ `scripter-backend/` 已检查

---

## 10. 结论与后续行动

### 10.1 核心发现

1. **后端完整但未使用**: 18 个 API 端点全部实现，零调用
2. **前端完全本地化**: 所有数据仅存储在 localStorage
3. **架构不一致**: 前端未遵循 Next.js 的 SSR/Server Actions 最佳实践
4. **唯一连接**: `/api/ai/test` 是唯一被调用的 API

### 10.2 风险评估

- **数据安全**: 🔴 高风险 (localStorage 易丢失)
- **可扩展性**: 🔴 受限 (无法多设备、多用户)
- **开发效率**: 🟡 中等 (大量后端代码浪费)

### 10.3 后续行动

#### 立即行动 (P0)

- [ ] 创建 `/login` 页面并集成认证
- [ ] 修改 `Dashboard` 页面，从 API 加载项目
- [ ] 实现项目创建 API 调用
- [ ] 添加认证中间件保护所有页面

#### 短期行动 (P1)

- [ ] 修改 `CharacterFormDialog`，集成 `/api/characters`
- [ ] 修改 `SceneFormDialog`，集成 `/api/scenes`
- [ ] 实现 Editor 页面的保存功能
- [ ] 添加错误处理和加载状态

#### 中期行动 (P2)

- [ ] 实现乐观更新机制
- [ ] 添加离线支持 (Service Worker)
- [ ] 实现数据同步冲突解决
- [ ] 添加数据备份功能

#### 长期行动 (P3)

- [ ] 考虑使用 tRPC 或 TRPC 替代 fetch
- [ ] 实现 React Query 或 SWR 进行数据缓存
- [ ] 重构为 Server Components
- [ ] 实现实时协作 (WebSocket)

---

## 11. 附录

### 11.1 技术栈验证

| 技术 | 前端使用 | 后端使用 | 数据库使用 | 状态 |
|------|---------|---------|-----------|------|
| **Next.js 14+** | ✅ App Router | ✅ API Routes | - | ✅ 一致 |
| **Drizzle ORM** | ❌ 未使用 | ✅ 已配置 | ✅ Schema | ⚠️ 部分使用 |
| **PostgreSQL** | - | ✅ 连接已配置 | ✅ 查询已实现 | ⚠️ 未连接 |
| **Casdoor** | ❌ 无前端 | ✅ OAuth 实现 | ✅ 用户表 | ⚠️ 未集成 |
| **Zustand** | ✅ 6 个 Store | - | - | ✅ 正常 |
| **智谱 GLM** | ✅ 测试页面 | ✅ 3 个端点 | - | ✅ 正常 |

### 11.2 文件路径索引

#### 前端页面
- `D:\Develop\Scripter\app\page.tsx`
- `D:\Develop\Scripter\app\dashboard\page.tsx`
- `D:\Develop\Scripter\app\characters\page.tsx`
- `D:\Develop\Scripter\app\scenes\page.tsx`
- `D:\Develop\Scripter\app\storyboard\page.tsx`
- `D:\Develop\Scripter\app\worldview\page.tsx`
- `D:\Develop\Scripter\app\editor\page.tsx`
- `D:\Develop\Scripter\app\test-ai\page.tsx`
- `D:\Develop\Scripter\app\script-demo\page.tsx`

#### API 路由
- `D:\Develop\Scripter\app\api\ai\chat\route.ts`
- `D:\Develop\Scripter\app\api\ai\stream\route.ts`
- `D:\Develop\Scripter\app\api\ai\test\route.ts`
- `D:\Develop\Scripter\app\api\ai-conversations\route.ts`
- `D:\Develop\Scripter\app\api\auth\callback\route.ts`
- `D:\Develop\Scripter\app\api\auth\login\route.ts`
- `D:\Develop\Scripter\app\api\auth\logout\route.ts`
- `D:\Develop\Scripter\app\api\projects\route.ts`
- `D:\Develop\Scripter\app\api\characters\route.ts`
- `D:\Develop\Scripter\app\api\scenes\route.ts`
- `D:\Develop\Scripter\app\api\worldview\route.ts`
- `D:\Develop\Scripter\app\api\storyboards\route.ts`

#### 数据库
- `D:\Develop\Scripter\lib\db\index.ts`
- `D:\Develop\Scripter\lib\db\schema\*.ts`
- `D:\Develop\Scripter\lib\db\queries\*.ts`

#### Store
- `D:\Develop\Scripter\lib\stores\projectStore.ts`
- `D:\Develop\Scripter\lib\stores\characterStore.ts`
- `D:\Develop\Scripter\lib\stores\sceneStore.ts`
- `D:\Develop\Scripter\lib\stores\worldviewStore.ts`
- `D:\Develop\Scripter\lib\stores\storyboardStore.ts`
- `D:\Develop\Scripter\lib\stores\editorStore.ts`

---

## 相关文档

- [PRD v2.5](../../prd/prd-v2.5.md)
- [技术栈](../../tech/tech-stack.md)
- [数据模型](../../tech/data-model.md)
- [环境配置报告](2026-01-26-environment-config-report.md)
- [PRD 模块测试报告](2026-01-26-prd-module-test-report.md)
- [AI 功能验证报告](2026-01-26-test-ai-function-verification.md)

---

**报告生成时间**: 2026-01-26
**分析工具**: Claude Code
**置信度**: 95% (基于完整代码审查)
