# Story Bible Schema 迁移说明

> **创建日期**: 2026-02-08
> **迁移文件**: `0001_violet_meggan.sql`
> **状态**: 待执行

## 概述

本次迁移为 Scripter 项目添加了 **Story Bible** 数据结构，这是 AI 架构重构的核心组件。

## 新增表结构

### `story_bibles` 表

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | uuid | 主键 |
| `project_id` | uuid | 项目 ID（唯一，外键关联 projects.id） |
| `world_rules` | jsonb | 世界规则（时代、地理、社会规则、约束条件） |
| `character_profiles` | jsonb | 人物档案数组 |
| `plot_outline` | jsonb | 剧情大纲数组 |
| `creative_intent` | jsonb | 创作意图（类型、基调、主题、目标受众） |
| `last_updated_at` | timestamp | 最后更新时间 |
| `created_at` | timestamp | 创建时间 |

**约束**:
- `project_id` 唯一（一个项目只有一个 Story Bible）
- 外键约束：`project_id` → `projects.id`（级联删除）

## 执行迁移

### 方式 1: 使用 Drizzle Kit（推荐）

确保 PostgreSQL 数据库正在运行，然后执行：

```bash
# 启动数据库（如果使用 Docker）
docker-compose up -d postgres

# 执行迁移
npm run db:push
```

### 方式 2: 手动执行 SQL

如果自动迁移失败，可以手动执行 SQL：

```bash
# 连接到数据库
psql -U scripter_user -d scripter -h localhost

# 执行迁移文件
\i drizzle/0001_violet_meggan.sql
```

### 方式 3: 使用 SQL 客户端

使用 pgAdmin、DBeaver 等工具，直接执行 `0001_violet_meggan.sql` 文件内容。

## 验证迁移

执行以下 SQL 验证表是否创建成功：

```sql
-- 检查表是否存在
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'story_bibles';

-- 检查表结构
\d story_bibles

-- 检查约束
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'story_bibles';
```

预期结果：
- 表 `story_bibles` 存在
- 包含 8 个字段
- 有 1 个唯一约束（project_id）
- 有 1 个外键约束（project_id → projects.id）

## 回滚迁移

如果需要回滚，执行以下 SQL：

```sql
DROP TABLE IF EXISTS story_bibles CASCADE;
```

## 相关文件

- **Schema 定义**: `lib/db/schema/story-bible.ts`
- **查询函数**: `lib/db/queries/story-bible.ts`
- **迁移文件**: `drizzle/0001_violet_meggan.sql`
- **设计文档**: `docs/plans/plan-ai-architecture-v2.md`

## 后续步骤

1. 执行本次迁移
2. 实现 Story Bible 自动聚合机制（Task #4）
3. 在 API 中集成 Story Bible 查询

## 注意事项

- 本次迁移还包含 `password_resets` 表的创建（如果不存在）
- 本次迁移还为 `users` 表添加 `password` 字段（如果不存在）
- 所有操作都使用 `IF NOT EXISTS` 和 `DO $$ BEGIN ... EXCEPTION` 确保幂等性

## 数据示例

创建后的 Story Bible 默认结构：

```json
{
  "worldRules": {
    "era": "",
    "geography": "",
    "socialRules": "",
    "constraints": []
  },
  "characterProfiles": [],
  "plotOutline": [],
  "creativeIntent": {
    "genre": "",
    "tone": "",
    "themes": [],
    "targetAudience": ""
  }
}
```

## 性能考虑

- `project_id` 字段已设置唯一索引，查询性能良好
- JSONB 字段支持高效的部分更新和查询
- 建议在生产环境中监控 JSONB 字段大小，避免单条记录过大

---

**维护者**: Data Specialist
**审核者**: Team Lead
