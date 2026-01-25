# 并行开发共享上下文

> 本模板用于并行开发时维护多个 Agent 之间的共享上下文
> 使用 `sync-parallel-context.js` 工具自动生成和更新

---

## 📋 任务分配

| Agent ID | 任务描述 | 优先级 | 状态 |
|----------|---------|--------|------|
| {{agent_1_id}} | {{agent_1_task}} | {{agent_1_priority}} | {{agent_1_status}} |
| {{agent_2_id}} | {{agent_2_task}} | {{agent_2_priority}} | {{agent_2_status}} |
| {{agent_3_id}} | {{agent_3_task}} | {{agent_3_priority}} | {{agent_3_status}} |

---

## 🔌 接口定义

### 数据接口

```typescript
// {{interface_name}}
interface {{InterfaceName}} {
  {{property_1}}: {{type_1}};
  {{property_2}}: {{type_2}};
}
```

### 函数签名

```typescript
function {{function_name}}({{params}}): {{return_type}} {
  // {{description}}
}
```

---

## 📊 共享状态

### 数据库状态

```yaml
migration_status: {{migration_status}}
schema_version: {{schema_version}}
last_migration: {{last_migration}}
```

### 分支信息

```yaml
main_branch: {{main_branch}}
feature_branches:
  - {{branch_1}}: {{branch_1_status}}
  - {{branch_2}}: {{branch_2_status}}
```

### 文件依赖

```yaml
shared_files:
  - {{shared_file_1}}
  - {{shared_file_2}}
conflict_risk:
  - {{risky_file_1}}
  - {{risky_file_2}}
```

---

## 🔄 同步检查点

| 时间 | Agent | 事件 | 状态 |
|------|-------|------|------|
| {{checkpoint_1_time}} | {{agent}} | {{event}} | {{status}} |
| {{checkpoint_2_time}} | {{agent}} | {{event}} | {{status}} |

---

## ⚠️ 冲突检测

### 文件冲突

| 文件 | Agent A | Agent B | 解决方案 |
|------|---------|---------|----------|
| {{file_1}} | {{agent_a_action}} | {{agent_b_action}} | {{resolution}} |

### 逻辑冲突

| 描述 | 影响 | 解决方案 |
|------|------|----------|
| {{logic_conflict_1}} | {{impact}} | {{resolution}} |

---

## 📝 变更日志

### {{date}} - {{agent_name}}

- {{change_1}}
- {{change_2}}

---

## 🔗 相关资源

- 计划文件: `{{plan_file_path}}`
- PRD: `docs/prd/prd-v2.5.md`
- 数据模型: `docs/tech/data-model.md`

---

*此文档由 sync-parallel-context.js 自动生成和更新*
