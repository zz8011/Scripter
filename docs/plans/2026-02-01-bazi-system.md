# 剧灵生辰八字系统实施计划

> **计划日期**: 2026-02-01
> **目标版本**: MVP
> **预计工期**: 3-4小时
> **计划者**: 路路 (总指挥) 🐱

---

## 一、任务分解

### 1.1 核心模块

```
生辰八字系统
├── 八字计算模块 (独立)
│   ├── 公历转农历
│   ├── 计算四柱（年柱、月柱、日柱、时柱）
│   └── 五行分析
├── 性格映射模块 (依赖八字计算)
│   ├── 日主确定
│   ├── 五行性格映射
│   └── 诗号生成
├── 数据模型扩展 (独立)
│   ├── JulingConfig 表扩展
│   └── BaziInfo 类型定义
├── API 路由 (依赖上述模块)
│   ├── 生成八字
│   ├── 获取剧灵信息
│   └── 更新剧灵配置
└── 前端页面 (依赖 API)
    ├── 剧灵诞生页
    ├── 剧灵介绍页
    └── 剧灵设置页
```

### 1.2 任务依赖图

```
[八字计算] ──┬── [性格映射] ──┬── [API路由]
             │                 └── [前端页面]
             └── [数据模型]
```

### 1.3 并行策略

| 批次 | 任务 | 依赖 | 执行者 | 预计时间 |
|------|------|------|--------|----------|
| **批次1** | 八字计算模块 | 无 | doudou | 1h |
| **批次1** | 数据模型扩展 | 无 | lele | 30min |
| **批次2** | 性格映射模块 | 批次1 | doudou | 1h |
| **批次2** | API路由 | 批次1 | keke | 1h |
| **批次3** | 前端页面 | 批次2 | huzi | 1.5h |

---

## 二、详细任务说明

### 任务1: 八字计算模块 (doudou)

**输入**: 用户注册时间 (Date)
**输出**: BaziInfo 对象

**功能点**:
1. `solarToLunar(date)` - 公历转农历
2. `calculateBazi(date)` - 计算四柱
3. `analyzeElements(bazi)` - 五行分析
4. `getDayMaster(bazi)` - 确定日主

**文件位置**: `lib/bazi/calculator.ts`

**验收标准**:
- [ ] 正确计算任意日期的八字
- [ ] 单元测试覆盖主要日期
- [ ] 农历转换准确

---

### 任务2: 数据模型扩展 (lele)

**修改文件**:
1. `lib/db/schema/juling-config.ts` - 扩展字段
2. `lib/types.ts` - 添加 BaziInfo 类型

**新增字段**:
```typescript
bazi: {
  year: { stem, branch, element }
  month: { stem, branch, element }
  day: { stem, branch, element }
  hour: { stem, branch, element }
  elements: { wood, fire, earth, metal, water }
  dayMaster: ElementType
  pattern: string
}
personality: {
  coreTraits: { primary, secondary }
  speechStyle: { tone, formality, quirks }
  collaborationStyle: { initiative, feedback, creativity }
  poem: string
}
```

**验收标准**:
- [ ] 数据库迁移成功
- [ ] 类型定义完整
- [ ] 与现有数据兼容

---

### 任务3: 性格映射模块 (doudou)

**输入**: BaziInfo
**输出**: JulingPersonality

**功能点**:
1. `getCoreTraits(bazi)` - 获取性格特质
2. `getSpeechStyle(bazi)` - 获取说话风格
3. `getCollaborationStyle(bazi)` - 获取合作风格
4. `generatePoem(bazi)` - 生成诗号

**文件位置**: `lib/bazi/personality.ts`

**五行映射表**:
- 木: 温和、成长、创造力
- 火: 热情、活力、启发
- 土: 稳重、可靠、包容
- 金: 精准、正义、结构
- 水: 智慧、灵活、深邃

**验收标准**:
- [ ] 五行性格映射准确
- [ ] 诗号生成有韵味
- [ ] 性格描述符合八字特征

---

### 任务4: API路由 (keke)

**路由**:
1. `POST /api/juling/generate` - 生成剧灵
2. `GET /api/juling/config` - 获取剧灵配置
3. `PUT /api/juling/config` - 更新剧灵配置
4. `POST /api/juling/rename` - 重命名剧灵

**文件位置**:
- `app/api/juling/generate/route.ts`
- `app/api/juling/config/route.ts`
- `app/api/juling/rename/route.ts`

**验收标准**:
- [ ] API 返回格式正确
- [ ] 认证检查完整
- [ ] 错误处理完善

---

### 任务5: 前端页面 (huzi)

**页面**:
1. `/juling/birth` - 剧灵诞生页
   - 展示八字计算过程
   - 显示诞辰证书
   - 输入剧灵名字

2. `/juling/intro` - 剧灵介绍页
   - 展示性格特质
   - 显示诗号
   - 介绍说话风格

3. `/juling/settings` - 剧灵设置页
   - 修改名字
   - 查看八字详情

**组件**:
- `BaziCard` - 八字卡片
- `PersonalityCard` - 性格卡片
- `PoemDisplay` - 诗号展示

**验收标准**:
- [ ] 符合设计系统
- [ ] 响应式布局
- [ ] 动画流畅

---

## 三、接口定义

### BaziInfo
```typescript
interface BaziInfo {
  birthDate: Date
  lunarDate: string
  year: { stem: string, branch: string, element: ElementType }
  month: { stem: string, branch: string, element: ElementType }
  day: { stem: string, branch: string, element: ElementType }
  hour: { stem: string, branch: string, element: ElementType }
  elements: { wood: number, fire: number, earth: number, metal: number, water: number }
  dayMaster: ElementType
  pattern: string
}
```

### JulingPersonality
```typescript
interface JulingPersonality {
  name: string
  birthDate: Date
  bazi: BaziInfo
  coreTraits: { primary: string[], secondary: string[] }
  speechStyle: { tone: string, formality: string, quirks: string[] }
  collaborationStyle: { initiative: string, feedback: string, creativity: string }
  poem: string
}
```

---

## 四、验收标准

### 功能验收
- [ ] 用户注册时自动生成八字
- [ ] 八字计算准确（与标准八字工具对比）
- [ ] 五行性格映射合理
- [ ] 诗号生成有文采
- [ ] 可以修改剧灵名字

### 技术验收
- [ ] 所有单元测试通过
- [ ] API 响应时间 < 500ms
- [ ] 前端首屏加载 < 2s
- [ ] 无 TypeScript 错误

### 设计验收
- [ ] 符合 UI 设计系统
- [ ] 动画流畅自然
- [ ] 移动端适配良好

---

## 五、风险与应对

| 风险 | 等级 | 应对策略 |
|------|------|----------|
| 农历转换库选择 | 中 | 调研 lunar-javascript 和 solarlunar |
| 八字计算准确性 | 高 | 使用标准八字算法，多组测试数据验证 |
| 诗号生成质量 | 中 | 准备模板库 + AI 生成备选 |
| 前端动画性能 | 低 | 使用 CSS 动画，避免复杂计算 |

---

## 六、执行记录

| 时间 | 事件 | 状态 |
|------|------|------|
| 2026-02-01 08:00 | 计划阶段开始 | ✅ |
| | | |

---

**计划完成** 🐱
