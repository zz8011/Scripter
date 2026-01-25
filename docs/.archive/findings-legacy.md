# Findings & Decisions - 剧灵 (Scripter) - 归档版本

> ⚠️ **归档文件** - 原始 findings.md 包含敏感 API 密钥，已移除
> 有价值的技术决策已整合到 `tech/decisions.md`
> 设计系统信息已整合到 `design/.claude/design-context.md`

---

## 原 findings.md 内容概览

### 已移除内容（安全原因）
- ❌ 智谱 GLM-4.7 API 密钥
- ❌ T8Star API 密钥

### 已整合内容
- ✅ 技术决策 → `tech/decisions.md`
- ✅ 设计系统规范 → `design/.claude/design-context.md`
- ✅ API 配置说明 → `config/model-config.yaml`

### 保留内容（研究笔记）

## 需求概述
基于 PRD v1.6 构建短剧剧本创作工具，技术栈调整：
- ❌ 不使用 Vercel AI SDK
- ✅ 使用智谱 GLM-4.7 进行文本处理
- ✅ 使用 T8Star (nano-banana-2) 进行图片处理

## 研究发现

### PRD 结构分析
- 总计 35000+ tokens，需要分阶段处理
- 核心模块：控制台、剧本、人物、场景、世界观、分镜
- MVP 阶段需要同步开发六大核心模块
- 关键技术点：TipTap 编辑器、@dnd-kit 拖拽、AI 意图路由

### 迁移注意事项

### 从 Vercel AI SDK 迁移到智谱 GLM-4.7
**需要重构的功能：**
1. `useChat` hook → 自定义 hook
2. 流式响应处理
3. Tool Use 实现
4. 错误处理与重试逻辑

**建议实现方式：**
- 创建 `lib/zhipu/client.ts` - 智谱 API 客户端
- 创建 `hooks/useZhipuChat.ts` - 替代 useChat
- 创建 `lib/ai/intention-dispatcher.ts` - 意图路由系统
- 创建 `lib/ai/skills/` - 原子化技能
- 创建 `lib/ai/agents/` - 专家代理

### 图片生成集成
**T8Star API 调用：**
- 创建 `lib/t8star/client.ts` - T8Star API 客户端
- 创建 `lib/image/generate.ts` - 图片生成服务
- 集成到人物、场景、分镜模块

## 遇到的问题
| 问题 | 解决方案 |
|------|----------|
| PRD 文件过大无法一次性读取 | 创建规划文件系统，分阶段开发 |
| 编辑器需要兼容国际标准与国内规范 | 采用双视图模式：编辑时遵循 Fountain 国际规范，可选中式视图（△符号） |

## 编辑器设计关键发现

### 双视图模式设计
```
编辑模式 (Fountain规范)    中式视图 (中文短剧规范v2.0)
├─ 无△符号                 ├─ 显示△符号（CSS伪元素）
├─ 标准格式                 ├─ 居中对齐
├─ 国际兼容                 ├─ 符合国内习惯
└─ 便于交换格式             └─ 便于打印/阅读
```

### TipTap 自定义节点设计
- **SceneHeadingNode**: 场景标题，支持解析 Fountain 格式（全大写或以"内外"开头）
- **ActionNode**: 动作描述，默认段落类型
- **CharacterNode**: 人物名，居中显示，全大写
- **DialogueNode**: 对白，缩进显示，支持连续对白
- **OSNode**: 内心独白，斜体显示，带（OS）标记
- **PageBreakNode**: 分页符，响应 === 或 *** 标记

### 键盘交互逻辑
- **Tab**: 按循环切换格式（动作 → 人物 → 对白 → 人物...）
- **Enter**: 智能行为
  - 场景标题后 → 动作描述
  - 人物名后 → 对白
  - 对白后：如果上一行是对白 → 继续对白；如果当前行空 → 结束对白块
- **Backspace**: 删除空对白行返回人物名，删除空动作行

## 导出系统设计关键发现

### 二维导出选择矩阵
```
              中文短剧格式v2.0    Fountain国际格式
                    │                │
    PDF ────────────┼────────────────┼────────── ✓✓✓
                    │                │
    Word ───────────┼────────────────┼────────── ✓✓✓
                    │                │
    Text ───────────┼────────────────┼────────── ✓✓
                    │                │
    纯图PDF ─────────┼────────────────┼────────── ───
     (防盗版)        │    ✓✓✓         │
                    │                │
    只读Word ────────┼────────────────┼────────── ───
     (防盗版)        │    ✓✓✓         │
```

### 导出范围类型
- **ALL**: 全部内容
- **PAGE_RANGE**: 页数范围（P1-P10）
- **EPISODE_RANGE**: 集数范围（E1-E10）
- **SCENE_RANGE**: 场数范围（S1-S50）
- **FIRST_N_PAGES**: 前N页（用于样张）
- **FIRST_N_SCENES**: 前N场（用于样张）

### 防盗版技术方案
1. **纯图PDF**:
   - 使用 html2canvas 将每页转为图片
   - 插入到 jsPDF 生成的 PDF 中
   - 文字无法选择复制

2. **只读Word**:
   - 使用 docx.js 生成 Word 文档
   - 修改 settings.xml 添加 documentProtection
   - 或通过后端服务添加密码保护

3. **水印**:
   - 文本水印（项目名称）
   - 可配置透明度、位置、旋转角度
   - 使用 CSS 或 canvas 渲染

4. **样张标记**:
   - 页眉/页脚显示"样张 - 仅供内部参考"
   - 红色粗体文字
   - 可配置位置

## 视觉/浏览器发现
- 待更新（设计稿、竞品分析等）

---

## 相关文档（当前版本）

| 原文件路径 | 新位置 |
|-----------|--------|
| API 配置 | `config/model-config.yaml` |
| 技术决策 | `tech/decisions.md` |
| 设计系统 | `design/.claude/design-context.md` |
| 实施计划 | `plans/plan-sprint-mvp.md` |
| 编辑器设计 | `tech/editor-design.md` |
| 导出系统 | `tech/export-system.md` |

---

**归档日期**: 2026-01-24
**归档原因**: 包含敏感 API 密钥，内容已整合到其他文档
