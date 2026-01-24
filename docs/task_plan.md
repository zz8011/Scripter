# Task Plan: 剧灵 (Scripter) - 短剧剧本开发工具
<!--
  WHAT: 基于 PRD v1.6 的完整开发规划
  WHY: PRD 超过 35000 tokens，需要拆分为可管理的开发阶段
  WHEN: 创建于 2026-01-23，每次会话前重新读取以保持目标同步
-->

## 目标
构建一个全图形化、AI 驱动的短剧剧本创作平台，使用国产模型替代 Vercel AI SDK：
- 文本处理：智谱 GLM-4.7
- 图片处理：T8Star (nano-banana-2)

## 当前阶段
Phase 8

## 阶段规划

### Phase 1: 项目初始化与技术栈配置
- [x] 创建 Next.js 14+ 项目（App Router）
- [x] 配置 shadcn/ui + Tailwind CSS（纸质写作主题）
- [x] 配置智谱 GLM-4.7 API 集成
- [x] 配置 T8Star 图片生成 API
- [x] 设置数据库（Prisma + PostgreSQL）
- [x] 配置认证系统（NextAuth.js）
- **状态:** completed

### Phase 2: 核心布局与导航系统
- [x] 实现三栏式布局（左导航 + 中工作区 + 右AI面板）
- [x] 实现全局 6 项导航菜单（控制台、剧本、人物、场景、世界观、分镜）
- [x] 实现品牌 Logo（剧灵 + scripter.art）
- [x] 实现用户信息头部（头像、用户名、Pro 标识）
- [x] 实现折叠交互（Edge Controls）
- **状态:** completed

### Phase 3: 设计系统应用（重构）
- [x] 更新 globals.css 完整设计系统（纸质纹理、自定义滚动条、浮动光晕动画）
- [x] 创建左侧黑色导航栏（#1A1A1A）包含剧灵Logo、6项导航菜单
- [x] 创建右侧AI面板组件（聊天消息、输入框、打字指示器）
- [x] 创建模态框组件（固定宽度700px、4标签页设置）
- [x] 创建控制台页面（玻璃拟态卡片、统计卡片、项目卡片）
- **状态:** completed

### Phase 4: MVP 六大核心模块同步开发
- [x] **剧本 (Editor)**：TipTap编辑器、A4标准校对模式、段落级拖拽排序、AI润色助手
- [x] **人物 (Characters)**：人物档案卡片流、AI生成人设、人物诗号生成
- [x] **场景 (Scenes)**：看板式管理、环境标签（日/夜/内/外）、状态流转
- [x] **世界观 (Worldview)**：多维设定编辑器、AI设定编织
- [x] **分镜 (Storyboard)**：分镜脚本编辑器、四栏排版、AI运镜建议
- **状态:** completed

### Phase 5: AI 集成与意图路由系统
- [x] 实现 Intention Dispatcher 意图路由
- [x] 实现原子化 Skills（格式修复、集长计算等）
- [x] 实现专家 Agents（观众批判、剧情反转等）
- [x] 集成智谱 GLM-4.7 流式响应
- [x] 实现动态 Context 注入（游标位置、选中文本）
- **状态:** completed

### Phase 6: 拖拽功能与交互优化
- [x] 集成 @dnd-kit/core
- [x] 实现场景列表拖拽
- [x] 实现段落级拖拽（场景标题、动作描述、对话块）
- [x] 实现金色插入指示线动效
- [x] 实现虚拟滚动（处理大量场景）
- **状态:** completed

### Phase 7: 导出与打印系统
- [x] 实现 A4 标准打印样式（@media print）
- [x] 实现 PDF 导出（隐藏侧边栏）
- [x] 实现 Word 导出（保持格式）
- [x] 实现分镜表 Excel 导出
- **状态:** completed

### Phase 8: 测试与优化
- [x] 格式检查准确率测试（目标 >95%）
- [x] AI 辅助功能可用性测试
- [x] 性能优化（渲染、编辑器）
- [x] 响应式设计测试
- **状态:** completed

## 关键问题
1. ~~如何将 Vercel AI SDK 的功能迁移到智谱 GLM-4.7？~~ ✅ 已解决（Phase 1）
2. 如何实现流式响应与 Tool Use 的兼容？
3. T8Star API 的图片生成如何集成到现有工作流？
4. 如何处理 A4 打印时的分页逻辑？
5. 如何确保格式检查的准确性？

## 技术决策
| 决策 | 理由 |
|------|------|
| 使用智谱 GLM-4.7 替代 Vercel AI SDK | 用户要求使用国产模型，降低成本 |
| 使用 T8Star 进行图片生成 | 用户指定的图片生成服务 |
| 使用 TipTap 编辑器 | PRD 中已验证的方案 |
| 使用 @dnd-kit/core 进行拖拽 | 现代化、性能优秀、可访问性友好 |
| 左侧导航栏黑色 #1A1A1A | 遵循设计系统规范 |

## 错误记录
| 错误 | 尝试 | 解决方案 |
|------|------|----------|
| Phase 3 未按原型开发 | 1 | 参考设计系统重构，git hard reset 后重新开发 |
| globals.css 中 'use client' 被拆行 | 1 | 确保 'use client' 在第一行不换行 |

## 备注
- 每次会话开始前重新读取此文件，保持目标同步
- PRD 原文件：D:\Develop\Scripter_claude\docs\prd\2026-01-22-scripter-prd.md
- 技术栈变更记录在 findings.md
- 设计系统参考：D:\Develop\Scripter_claude\docs\design\ref\完整设计系统应用指南.md
- HTML原型参考：D:\Develop\Scripter_claude\docs\design\prototypes\v4\
