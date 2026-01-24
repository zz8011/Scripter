# 剧灵剧本编辑器设计方案

**项目**: 剧灵 (Scripter) - 短剧剧本创作工具
**设计日期**: 2026-01-23
**版本**: 1.0
**状态**: 设计阶段

---

## 一、概述

### 1.1 目标

为剧灵平台开发专业的剧本编辑器，支持**中文短剧剧本格式规范 v2.0**，提供流畅的创作体验和智能 AI 辅助功能。

### 1.2 核心需求

- 剧本专用格式支持（场景标题、对话、动作描述、OS独白）
- 基础编辑操作（撤销/重做、复制粘贴、查找替换）
- AI 集成（润色、续写、改写、格式修复）
- 辅助工具（字数统计、预计时长、格式校验）

### 1.3 设计原则

遵循 **剧灵设计系统规范** (`docs/design/ref/`)：
- 色彩：纸质主题 (#F5F1E8 背景、#C9A962 金色点缀)
- 字体：Courier Prime（编辑器专用）
- 图标：Lucide Icons 统一系统
- 交互：极简、无干扰、沉浸式

---

## 二、技术架构

### 2.1 技术选型

| 组件 | 技术选择 | 理由 |
|------|---------|------|
| 编辑器核心 | **TipTap** (基于 ProseMirror) | 强大的节点扩展系统，现代化 API |
| UI 框架 | React + shadcn/ui | 与项目现有技术栈一致 |
| 样式 | Tailwind CSS | 遵循设计系统 CSS 变量 |
| 状态管理 | Zustand | 轻量级，与现有 AI 系统集成 |

### 2.2 目录结构

```
lib/editor/
├── extensions/              # TipTap 扩展
│   ├── nodes/              # 自定义节点
│   │   ├── scene-heading.ts      # 场景标题
│   │   ├── dialogue.ts           # 对话块
│   │   ├── action.ts             # 动作描述
│   │   ├── os-monologue.ts       # OS独白
│   │   └── special-mark.ts       # 特殊标记
│   ├── marks/              # 自定义标记
│   │   └── emphasis.ts           # 情绪标注
│   └── index.ts            # 扩展导出
├── plugins/                # 编辑器插件
│   ├── ai-integration.ts        # AI 集成
│   ├── format-toolbar.ts        # 格式工具栏
│   ├── bubble-menu.ts           # 气泡菜单
│   └── shortcuts.ts             # 快捷键
├── components/             # React 组件
│   ├── script-editor.tsx        # 主编辑器
│   ├── bubble-menu.tsx          # 气泡菜单组件
│   ├── format-toolbar.tsx       # 格式工具栏
│   ├── status-bar.tsx           # 状态栏
│   └── command-palette.tsx      # 命令面板
├── hooks/                  # React Hooks
│   ├── use-script-stats.ts      # 统计信息
│   ├── use-auto-save.ts         # 自动保存
│   └── use-format-validator.ts  # 格式校验
├── utils/                  # 工具函数
│   ├── parser.ts                # 剧本解析器
│   ├── validator.ts             # 格式校验器
│   └── serializer.ts            # 序列化工具
└── types.ts                # TypeScript 类型定义
```

---

## 三、TipTap 扩展节点系统

### 3.1 SceneHeading（场景标题）

**功能**: 表示剧本中的场景标题

**数据结构**:
```typescript
interface SceneHeadingAttrs {
  episode: number;           // 集数
  scene: number;             // 场景序号
  time: '日' | '夜' | '黄昏' | '清晨' | '傍晚' | '午夜';
  location: '内' | '外' | '内外';
  place: string;             // 地点（2-8字）
  characters: string[];      // 人物列表
}
```

**渲染样式**:
```css
.scene-heading {
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 600;
  font-size: 16px;
  color: #1A1A1A;
  background: #FAF7F0;
  padding: 12px 16px;
  margin: 16px 0;
  border-left: 4px solid #C9A962;
  border-radius: 4px;
}
```

**格式示例**:
```
**场1-12 日/内 龙门客栈大堂 主要人物：风十三、柳如烟**
```

### 3.2 Dialogue（对话节点）

**功能**: 表示角色对话或 OS 独白

**数据结构**:
```typescript
interface DialogueAttrs {
  character: string;         // 角色名
  emotion?: string;          // 情绪标注（可选）
  isOS: boolean;             // 是否为OS独白
}
```

**渲染样式**:
```css
.dialogue {
  font-family: 'Courier Prime', 'Noto Sans SC', monospace;
  font-size: 18px;
  line-height: 1.5;
  padding-left: 24px;
  margin: 8px 0;
}

.dialogue-character {
  font-weight: 600;
  color: #1A1A1A;
}

.dialogue-os {
  color: #C9A962;
  font-weight: 600;
}
```

**格式示例**:
```
风十三：这地方，果然不简单。

风十三（冷笑）：想拦我？没那么容易。

风十三(OS)：这女人，到底是什么来头？
```

### 3.3 Action（动作描述）

**功能**: 表示场景动作描述

**渲染样式**:
```css
.action {
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #5C5548;
  padding-left: 12px;
  margin: 8px 0;
}

.action-prefix {
  color: #C9A962;
  font-weight: 600;
}
```

**格式示例**:
```
△风十三推开客栈大门，风沙扑面而来。客栈内一片死寂，只有烛火摇曳。
```

### 3.4 SpecialMark（特殊标记）

**功能**: 字幕、闪回、旁白等特殊标记

**数据结构**:
```typescript
interface SpecialMarkAttrs {
  type: 'subtitle' | 'flashback' | 'flashback_end' | 'narrator';
  content?: string;
}
```

**格式示例**:
```
【字幕：三年后】

【闪回】
△（回忆画面）
【闪回结束】

旁白：命运的车轮，在这一刻开始转动。
```

### 3.5 命令菜单

输入 `/` 触发快捷命令：

| 命令 | 功能 | 图标 |
|------|------|------|
| `/场景` | 插入场景标题 | `lucide:map-pin` |
| `/对话` | 插入对话块 | `lucide:message-square` |
| `/动作` | 插入动作描述 | `lucide:triangle` |
| `/OS` | 插入OS独白 | `lucide:sparkles` |
| `/字幕` | 插入字幕标记 | `lucide:badge-info` |
| `/闪回` | 插入闪回标记 | `lucide:history` |

---

## 四、AI 集成系统

### 4.1 BubbleMenu（气泡菜单）

**触发条件**: 用户选中文字时显示

**位置**: 选中文字正上方，居中对齐

**UI 设计**:
```tsx
<div className="glass-card rounded-full px-3 py-2 flex items-center gap-2 shadow-lg border-[#C9A962]/30">
  <Button variant="text" size="sm">
    <iconify-icon icon="lucide:sparkles" class="text-[#C9A962]" />
    <span>AI 润色</span>
  </Button>
  <Button variant="text" size="sm">
    <iconify-icon icon="lucide:pen-line" class="text-[#C9A962]" />
    <span>续写</span>
  </Button>
  <Button variant="text" size="sm">
    <iconify-icon icon="lucide:refresh-cw" class="text-[#C9A962]" />
    <span>改写</span>
  </Button>
  <div className="w-px h-4 bg-[#D3C9B0]"></div>
  <Button variant="text" size="sm">
    <iconify-icon icon="lucide:sparkles" class="text-[#C9A962] animate-pulse" />
    <span>更多</span>
  </Button>
</div>
```

### 4.2 AI 操作类型

| 操作 | 描述 | 意图类型 |
|------|------|----------|
| AI 润色 | 优化语言表达 | `polish` |
| AI 续写 | 智能续写内容 | `continue` |
| AI 改写 | 改变风格/视角 | `rewrite` |
| 格式修复 | 修复格式问题 | `format_fix` |
| 观众批判 | 模拟观众反馈 | `audience_critique` |
| 剧情反转 | 生成反转建议 | `plot_twist` |

### 4.3 交互流程

```
用户选中文字
    ↓
显示 BubbleMenu（淡入动画 200ms）
    ↓
用户点击操作（如"AI 润色"）
    ↓
显示加载状态（sparkles 图标旋转）
    ↓
发送请求到 AI 系统（注入上下文）
    ↓
流式返回结果，实时更新编辑器
    ↓
完成，显示 Toast 通知
```

### 4.4 上下文注入

每次 AI 请求自动注入：
- 当前场景信息（场景标题、地点、人物）
- 相关人物小传
- 世界观设定
- 剧情上下文（前后3场内容）

### 4.5 与右侧 AI 面板联动

- 同步显示对话历史
- 显示 AI 思考过程
- 提供"接受"、"拒绝"、"重新生成"按钮

---

## 五、UI 组件设计

### 5.1 ScriptEditor（主编辑器）

**布局**: 三栏结构
- 左侧：导航（可折叠）
- 中间：编辑区（主）
- 右侧：AI 面板（可折叠）

**编辑区样式**:
```css
.editor-container {
  background: #FFFFFF;
  min-height: 100%;
}

.editor-content {
  font-family: 'Courier Prime', 'Noto Sans SC', monospace;
  font-size: 18px;
  line-height: 1.5;
  color: #1A1A1A;
  padding: 40px 60px;
  max-width: 900px;
  margin: 0 auto;
}

.ProseMirror:focus {
  outline: none;
}
```

### 5.2 FormatToolbar（格式工具栏）

**位置**: 编辑器顶部

**按钮样式**:
```tsx
<Button variant="outline" size="sm" className="gap-2">
  <iconify-icon icon="lucide:map-pin" />
  场景
</Button>
```

**完整按钮列表**:
- 场景（`lucide:map-pin`）
- 对话（`lucide:message-square`）
- 动作（`lucide:triangle`）
- OS（`lucide:sparkles`）
- 字幕（`lucide:badge-info`）
- 分隔线
- 撤销（`lucide:undo`）
- 重做（`lucide:redo`）

### 5.3 StatusBar（状态栏）

**位置**: 编辑器底部

**显示内容**:
```tsx
<div className="flex items-center gap-6 text-sm">
  <div className="flex items-center gap-2">
    <iconify-icon icon="lucide:type" class="text-[#8B7355]" />
    <span>字数：</span>
    <span className="font-semibold">12,450</span>
  </div>
  <div className="flex items-center gap-2">
    <iconify-icon icon="lucide:map-pin" class="text-[#8B7355]" />
    <span>场景：</span>
    <span className="font-semibold">场1-12</span>
  </div>
  <div className="flex items-center gap-2">
    <iconify-icon icon="lucide:clock" class="text-[#8B7355]" />
    <span>预计时长：</span>
    <span className="font-semibold">约8分钟</span>
  </div>
</div>
```

**格式符合率**:
```tsx
<div className="flex items-center gap-3">
  <span className="text-xs text-[#8B7355]">格式符合率</span>
  <div className="w-24 h-2 bg-[#D3C9B0] rounded-full overflow-hidden">
    <div className="h-full bg-[#7FA870]" style="width: 95%"></div>
  </div>
  <span className="text-xs font-bold text-[#7FA870]">95%</span>
</div>
```

### 5.4 快捷键系统

| 快捷键 | 功能 |
|--------|------|
| `Ctrl/Cmd + S` | 保存剧本 |
| `Ctrl/Cmd + Z` | 撤销 |
| `Ctrl/Cmd + Shift + Z` | 重做 |
| `Ctrl/Cmd + /` | 触发命令菜单 |
| `Ctrl/Cmd + K` | 快速插入场景 |
| `Ctrl/Cmd + D` | 快速插入对话 |
| `Ctrl/Cmd + Enter` | AI 续写 |
| `Ctrl/Cmd + Shift + F` | 格式修复 |

---

## 六、数据流与持久化

### 6.1 数据模型

```typescript
interface ScriptDocument {
  id: string;
  projectId: string;
  episodeId?: string;
  title: string;
  content: JSON;              // TipTap JSON 格式
  version: number;
  wordCount: number;
  estimatedDuration: number;  // 秒
  formatScore: number;        // 0-100
  createdAt: DateTime;
  updatedAt: DateTime;
  lastSavedAt: DateTime;
}
```

### 6.2 保存策略

1. **本地自动保存**: 每 30 秒保存到 localStorage
2. **手动保存**: 保存按钮触发后端保存
3. **版本历史**: 每次保存创建快照

### 6.3 与现有系统集成

- 复用 `lib/ai/` 中的意图路由系统
- 与场景看板双向同步
- 支持 Markdown 导入/导出（兼容 v2.0 格式）

### 6.4 数据流图

```
用户编辑
    ↓
TipTap 状态更新
    ↓
计算统计信息（字数、场景数、时长）
    ↓
触发防抖保存（30s）
    ↓
保存到 localStorage
    ↓
后台同步到服务器
```

---

## 七、格式校验系统

### 7.1 校验规则

基于 **中文短剧剧本格式规范 v2.0**：

| 检查项 | 规则 | 错误提示 |
|--------|------|----------|
| 场景标题 | `**场X-Y 时间/内外 地点 人物：**` | 场景编号格式错误 |
| 对话冒号 | 中文全角（：） | 使用了英文冒号 |
| OS 格式 | `(OS)` 大写英文括号 | OS 格式不规范 |
| 动作描述 | △ 前缀，无空格 | 缺少 △ 符号 |
| 标点符号 | 中文全角 | 使用了英文标点 |

### 7.2 校验反馈

1. **实时校验**: 编辑时即时检查
2. **状态栏显示**: 格式符合率百分比
3. **问题列表**: 右侧面板显示所有问题
4. **快速定位**: 点击问题跳转到对应位置
5. **一键修复**: 自动修复常见问题

---

## 八、错误处理

### 8.1 错误类型

| 错误类型 | 处理方式 |
|----------|----------|
| 保存失败 | Toast 通知 + 本地缓存 + 重试按钮 |
| AI 请求失败 | 错误提示 + 重新生成选项 |
| 格式校验错误 | 高亮显示 + 问题列表 + 一键修复 |
| 协作冲突 | 冲突警告 + 版本对比 + 合并选项 |
| 网络断开 | 离线提示 + 本地编辑 |

### 8.2 用户体验

- 所有操作都有加载状态反馈
- 错误信息清晰友好
- 提供恢复/重试选项
- 关键操作前确认

---

## 九、性能优化

### 9.1 优化策略

1. **虚拟滚动**: 处理大型剧本（>100 场）
2. **懒加载**: 按需加载场景内容
3. **防抖保存**: 避免频繁保存请求
4. **缓存策略**: 本地缓存 + 远程同步
5. **代码分割**: 按需加载编辑器模块

### 9.2 性能指标

- 首屏加载 < 2s
- 输入延迟 < 50ms
- AI 响应开始 < 1s
- 保存完成 < 500ms

---

## 十、实现计划

### Phase 1: 基础编辑器（2-3天）
- [ ] TipTap 基础配置
- [ ] 自定义节点实现
- [ ] 基础 UI 组件（工具栏、状态栏）
- [ ] 样式系统实现

### Phase 2: 格式系统（2天）
- [ ] 命令菜单
- [ ] 格式校验器
- [ ] 快捷键系统
- [ ] Markdown 导入/导出

### Phase 3: AI 集成（2-3天）
- [ ] BubbleMenu 组件
- [ ] AI 操作对接
- [ ] 流式响应
- [ ] 右侧面板联动

### Phase 4: 数据持久化（1-2天）
- [ ] 自动保存
- [ ] 版本历史
- [ ] 与场景看板同步
- [ ] 离线支持

### Phase 5: 优化与测试（2天）
- [ ] 性能优化
- [ ] 格式校验完善
- [ ] 错误处理
- [ ] 用户体验测试

**预计总工期**: 9-12 天

---

## 十一、参考文档

- [中文短剧剧本格式规范 v2.0](../../script-format-v2.md)
- [完整设计系统应用指南](../design/ref/完整设计系统应用指南.md)
- [TipTap 官方文档](https://tiptap.dev/docs)
- [项目 PRD](../prd/2026-01-22-scripter-prd.md)

---

**设计者**: Claude Assistant
**审核状态**: 待审核
**下一步**: 创建实现计划文档
