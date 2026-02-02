# Scripter 团队科学开发工作流程

> 版本: 1.0.0  
> 最后更新: 2026-02-02  
> 适用范围: Scripter 全栈开发团队

---

## 目录

1. [需求分析阶段](#1-需求分析阶段)
2. [架构设计阶段](#2-架构设计阶段)
3. [开发实现阶段](#3-开发实现阶段)
4. [代码审查阶段](#4-代码审查阶段)
5. [测试验证阶段](#5-测试验证阶段)
6. [部署交付阶段](#6-部署交付阶段)
7. [运维监控阶段](#7-运维监控阶段)
8. [流水线滚动开发](#8-流水线滚动开发)
9. [临时任务管理机制](#9-临时任务管理机制)

---

## 1. 需求分析阶段

### 1.1 如何接收和澄清需求

#### 需求接收流程

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  需求提出   │───▶│  初步评估   │───▶│  需求澄清会 │───▶│  需求确认书 │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

#### 需求澄清检查清单

| 检查项 | 说明 | 负责人 |
|--------|------|--------|
| ☐ 业务目标明确 | 需求背后的业务价值是什么？ | Product Owner |
| ☐ 用户场景清晰 | 谁在什么场景下使用？ | 产品经理 |
| ☐ 验收标准定义 | 如何判定需求已完成？ | 开发团队 |
| ☐ 依赖关系梳理 | 有哪些前置/后置依赖？ | Tech Lead |
| ☐ 数据规模确认 | 预计用户量和数据量？ | 架构师 |
| ☐ 安全合规要求 | 涉及敏感数据或法规？ | 安全负责人 |

#### 需求澄清会议模板

```markdown
## 需求澄清会议记录

### 基础信息
- 会议时间: YYYY-MM-DD HH:mm
- 参会人员: [姓名]@[角色]
- 需求来源: [Jira/邮件/口头]

### 需求概述
- 需求标题: 
- 背景说明: 
- 预期效果: 

### 待澄清问题
| 序号 | 问题 | 提出人 | 答复 | 答复人 |
|------|------|--------|------|--------|
| 1 | | | | |

### 技术风险点
1. 
2. 

### 下一步行动
- [ ] 行动项 @负责人 截止日期
```

### 1.2 需求优先级评估方法

#### RICE 评分模型

```typescript
interface RICEScore {
  reach: number;      // 影响用户数/范围 (1-10)
  impact: number;     // 影响力 (0.25-3)
  confidence: number; // 信心度 (百分比)
  effort: number;     // 投入人天
}

const calculateRICE = ({ reach, impact, confidence, effort }: RICEScore): number => {
  return (reach * impact * confidence) / effort;
};
```

#### 优先级矩阵

```
        高影响
           │
    P0     │     P1
  立即执行 │   规划执行
           │
───────────┼───────────
           │
    P2     │     P3
  有空再做 │   暂不处理
           │
        低影响
        低紧急          高紧急
```

#### 优先级定义

| 优先级 | 定义 | 响应时间 | 典型场景 |
|--------|------|----------|----------|
| **P0** | 紧急且重要 | 立即 | 线上故障、安全漏洞 |
| **P1** | 重要不紧急 | 本周 | 核心功能、性能优化 |
| **P2** | 紧急不重要 | 两周内 | 辅助功能、体验优化 |
| **P3** | 不重要不紧急 | 排期 | 技术债务、代码重构 |

### 1.3 技术可行性分析

#### 技术可行性检查清单

```markdown
## 技术可行性分析报告

### 需求概述
- 需求编号: REQ-XXXX
- 需求名称: 

### 技术方案选项

#### 方案 A: [名称]
- 描述: 
- 优点: 
- 缺点: 
- 风险: 
- 预估工作量: X 人天

#### 方案 B: [名称]
- 描述: 
- 优点: 
- 缺点: 
- 风险: 
- 预估工作量: X 人天

### 可行性评估
| 维度 | 评估 | 说明 |
|------|------|------|
| 技术成熟度 | ⭐⭐⭐⭐⭐ | |
| 团队能力 | ⭐⭐⭐⭐⭐ | |
| 时间可行性 | ⭐⭐⭐⭐⭐ | |
| 资源可行性 | ⭐⭐⭐⭐⭐ | |
| 风险可控性 | ⭐⭐⭐⭐⭐ | |

### 推荐方案
[说明推荐理由]

### 待确认事项
1. 
2. 
```

---

## 2. 架构设计阶段

### 2.1 技术选型标准

#### Scripter 技术栈全景

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Scripter 技术栈                             │
├─────────────────────────────────────────────────────────────────────┤
│  前端层                                                              │
│  ├── Framework: Next.js 15 (App Router)                             │
│  ├── Language: TypeScript 5.x                                       │
│  ├── Styling: Tailwind CSS + shadcn/ui                              │
│  ├── State: Zustand + React Query                                   │
│  └── Testing: Vitest + Playwright                                   │
├─────────────────────────────────────────────────────────────────────┤
│  后端层                                                              │
│  ├── Framework: Next.js API Routes / Node.js                        │
│  ├── ORM: Drizzle ORM                                               │
│  ├── Database: PostgreSQL                                           │
│  └── Cache: Redis                                                   │
├─────────────────────────────────────────────────────────────────────┤
│  基础设施                                                            │
│  ├── Container: Docker + Docker Compose                             │
│  ├── CI/CD: GitHub Actions                                          │
│  └── Monitoring: [待补充]                                            │
└─────────────────────────────────────────────────────────────────────┘
```

#### 技术选型决策矩阵

| 技术领域 | 选型 | 备选方案 | 选择理由 |
|----------|------|----------|----------|
| 前端框架 | Next.js | Remix, Nuxt | 生态完善、SSR/SSG支持好 |
| 状态管理 | Zustand | Redux, Jotai | 轻量、TypeScript友好 |
| UI 组件 | shadcn/ui | Ant Design, MUI | 可定制性强、无样式冲突 |
| 测试框架 | Vitest | Jest | 速度快、ESM原生支持 |
| E2E测试 | Playwright | Cypress | 多浏览器、并行执行 |
| ORM | Drizzle | Prisma, TypeORM | 类型安全、性能优越 |

### 2.2 模块化设计原则

#### 项目目录结构规范

```
scripter/
├── app/                          # Next.js App Router
│   ├── (routes)/                 # 路由分组
│   │   ├── dashboard/            # 仪表盘页面
│   │   ├── projects/             # 项目管理
│   │   └── settings/             # 系统设置
│   ├── api/                      # API 路由
│   ├── layout.tsx                # 根布局
│   └── page.tsx                  # 首页
├── components/                   # React 组件
│   ├── ui/                       # 基础 UI 组件 (shadcn)
│   ├── common/                   # 通用业务组件
│   ├── forms/                    # 表单组件
│   └── layouts/                  # 布局组件
├── lib/                          # 工具库
│   ├── db/                       # 数据库相关
│   ├── auth/                     # 认证相关
│   ├── api/                      # API 客户端
│   └── utils/                    # 通用工具
├── hooks/                        # 自定义 Hooks
├── types/                        # TypeScript 类型定义
├── stores/                       # Zustand 状态管理
├── styles/                       # 全局样式
└── tests/                        # 测试文件
    ├── unit/                     # 单元测试
    ├── integration/              # 集成测试
    └── e2e/                      # E2E 测试
```

#### 模块化设计原则

1. **单一职责原则 (SRP)**
   - 每个模块只负责一个功能领域
   - 组件文件不超过 300 行
   - 函数不超过 50 行

2. **依赖倒置原则 (DIP)**
   ```typescript
   // ✅ 正确：依赖抽象
   interface ILogger {
     log(message: string): void;
   }
   
   class Service {
     constructor(private logger: ILogger) {}
   }
   
   // ❌ 错误：依赖具体实现
   class Service {
     private logger = new ConsoleLogger();
   }
   ```

3. **显式导出原则**
   ```typescript
   // components/index.ts
   export { Button } from './button';
   export { Input } from './input';
   export { Card } from './card';
   
   // 使用
   import { Button, Input } from '@/components';
   ```

### 2.3 API 设计规范

#### RESTful API 设计标准

```typescript
// API 路由结构: app/api/projects/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 请求验证 Schema
const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  status: z.enum(['active', 'archived']).default('active'),
});

// GET /api/projects - 获取项目列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const projects = await getProjects({ page, limit });
    
    return NextResponse.json({
      success: true,
      data: projects,
      meta: {
        page,
        limit,
        total: projects.length,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/projects - 创建项目
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createProjectSchema.parse(body);
    
    const project = await createProject(validated);
    
    return NextResponse.json({
      success: true,
      data: project,
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
```

#### API 响应格式规范

```typescript
// 标准响应结构
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    timestamp: string;
  };
}

// HTTP 状态码使用规范
const HttpStatus = {
  OK: 200,              // 成功
  CREATED: 201,         // 创建成功
  NO_CONTENT: 204,      // 删除成功
  BAD_REQUEST: 400,     // 请求参数错误
  UNAUTHORIZED: 401,    // 未认证
  FORBIDDEN: 403,       // 无权限
  NOT_FOUND: 404,       // 资源不存在
  CONFLICT: 409,        // 资源冲突
  UNPROCESSABLE: 422,   // 业务逻辑错误
  INTERNAL_ERROR: 500,  // 服务器内部错误
} as const;
```

---

## 8. 流水线滚动开发

### 8.1 多阶段并行流水线

```
需求池 → [需求分析] → [架构设计] → [开发实现] → [代码审查] → [测试验证] → [部署交付]
                ↓              ↓              ↓              ↓              ↓
            任务A设计      任务B开发      任务C审查      任务D测试      任务E部署
            任务F需求      任务G设计      任务H开发      任务I审查      任务J测试
```

### 8.2 关键机制

| 机制 | 说明 | WIP限制 |
|------|------|---------|
| **WIP限制** | 每个阶段最多同时处理N个任务 | 需求分析: 3, 开发: 5, 测试: 3 |
| **拉动式生产** | 下游完成时从上游拉取新任务 | 自动触发 |
| **快速通道** | 紧急任务可走绿色通道 | P0任务优先 |
| **瓶颈识别** | 可视化看板显示阻塞点 | 超过2天标红 |

### 8.3 流水线看板设计

```markdown
## 每日站会看板

| 阶段 | 进行中 | 待处理 | 已完成今日 | 瓶颈 |
|------|--------|--------|------------|------|
| 需求分析 | 2 | 5 | 3 | - |
| 架构设计 | 1 | 2 | 2 | - |
| 开发实现 | 4 | 8 | 5 | API文档缺失 |
| 代码审查 | 2 | 4 | 3 | 审查者不足 |
| 测试验证 | 2 | 3 | 2 | - |
| 部署交付 | 1 | 2 | 4 | - |
```

---

## 9. 临时任务管理机制

### 9.1 临时任务分级

| 级别 | 定义 | 处理策略 |
|------|------|----------|
| **P0-紧急** | 系统故障、安全漏洞 | 立即中断当前工作，全力处理 |
| **P1-高优** | 业务紧急需求 | 当前任务完成后插入队列 |
| **P2-普通** | 一般需求 | 按原计划排期处理 |

### 9.2 插入策略

```
Capacity Buffer: 预留 20% 时间给临时任务
Swap 机制: 临时任务与低优任务交换位置
并行处理: 简单临时任务可与其他任务并行
```

### 9.3 防打断机制

| 机制 | 说明 |
|------|------|
| **Focus Time** | 每天预留 2 小时无打扰专注时间 |
| **Batch 处理** | 非紧急临时任务集中在下午4-5点处理 |
| **上下文保护** | 被打断时记录状态，方便快速恢复 |

### 9.4 决策树

```
临时任务到达
    │
    ├── 是否 P0? → 是 → 立即中断，全力处理
    │
    ├── 是否 P1? → 是 → 当前任务完成后插入
    │
    └── P2? → 是 → 排期到下一个迭代
```

---

## 附录：快速参考

### 常用命令

```bash
# 开发
npm run dev              # 启动开发服务器
npm run build           # 构建生产版本
npm run test            # 运行所有测试

# 代码质量
npm run lint            # ESLint 检查
npm run format          # Prettier 格式化
npm run type-check      # TypeScript 类型检查

# Docker
docker-compose up -d    # 启动所有服务
docker-compose logs     # 查看日志
```

### 开发节奏

- **每日站会**: 上午 10:00，同步进度和阻塞
- **代码审查**: 下午 2:00-4:00，集中审查 PR
- **Focus Time**: 上午 9:00-11:00，无打扰编码
- **临时任务**: 下午 4:00-5:00，集中处理

---

**文档维护**: 每月第一个周一更新  
**问题反馈**: 联系 Tech Lead 或更新此文档
