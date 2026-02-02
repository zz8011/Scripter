# AgentBus.ts 代码审查报告

**审查工具**: OpenAI Codex CLI  
**审查文件**: `lib/agents/core/AgentBus.ts`  
**审查时间**: 2026-02-02  
**审查模型**: gpt-5.2-codex

---

## 代码质量评分

**7/10**

整体结构清晰、易读，但在去重、资源管理、性能与并发安全方面仍有明显风险。

---

## 发现的问题和改进建议

### 1. 消息总线架构设计

**问题**: 当前仅基于 `EventEmitter`，`agents` 只用于注册与广播，`send()` 不校验目标是否注册，也不与 agent 实例交互，导致"注册"形同虚设。

**改进建议**: 
- 在 `send()` 中验证 `to` 是否存在
- 在 `register()` 时建立可选的 direct handler 或 adapter 接口用于可靠投递

---

### 2. 订阅/发布机制

**问题**: `subscribe()` 允许未注册 agent 订阅，但 `unregister()` 只删 map，不清理 listeners，容易造成内存泄漏和幽灵订阅。

**改进建议**: 
- 在 `unregister()` 中调用 `removeAllListeners('message:${agentId}')`
- 可选返回移除的监听器数量

---

### 3. CRITICAL 消息去重逻辑

**问题**: 
- 去重基于 `message.id`，而 `send(to,type,payload)` 每次都会新生成 id，导致重发同一消息无法去重
- 去重集是全局且永久增长，无上限

**改进建议**: 
- 使用"内容签名 + TTL + LRU" 或 "(id + to + type)" 去重
- 加上最大容量或过期清理机制

---

### 4. 潜在性能问题

**问题**:
- `EventEmitter` 默认最大监听者为 10，`maxAgents` 100 时可能触发 warning
- `broadcast()` 逐个同步 `emit`，在高并发或慢 listener 时会阻塞主线程
- `messageHistory` 无上限，长时间运行会无界增长

**改进建议**: 
- 调用 `setMaxListeners(maxAgents)`
- 考虑异步队列或 `setImmediate`/microtask
- 为 `messageHistory` 设置容量上限

---

### 5. 线程安全性

**问题**: 如果在 Node 单线程环境下运行还可以，但一旦跨 worker 或共享实例，`Map/Set` 无锁写入不安全。

**改进建议**: 
- 保证单线程使用
- 或在 worker 间通过消息通道而不是共享实例

---

### 6. 异常隔离

**问题**: `emit` 触发的 listener 抛错会直接冒泡并中断当前 `send`。

**改进建议**: 
- 对单个 listener 隔离或包装 try/catch
- 避免影响整个总线

---

## 最佳实践建议

1. **采用"可配置的队列 + backpressure"模型**，至少提供 `sendAsync()` 和 `broadcastAsync()`

2. **为消息定义稳定的去重 key**（如 `hash(type+from+to+payload)`）并配合 LRU/TTL

3. **在 `register()`/`unregister()` 中提供生命周期钩子**，确保订阅自动清理

4. **使用更严格的类型**（`payload` 与 `agent` 避免 `any`），降低运行时错误概率

5. **为关键路径添加轻量的指标**（投递耗时、listener 数、丢弃/去重数量）

---

## 审查详情

| 项目 | 内容 |
|------|------|
| 工具版本 | OpenAI Codex v0.93.0 |
| 工作目录 | D:\Develop\Scripter |
| Tokens Used | 4,823 |

---

*报告由 Codex CLI 自动生成*
