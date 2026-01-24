# 剧灵功能 Agent 系统设计

**项目**: 剧灵 (Scripter)
**日期**: 2026-01-23
**版本**: 1.0

---

## 概述

本文档描述剧灵项目的六大功能 Agent 设计。每个 Agent 是用户与特定功能模块交互的核心界面，具备独立的 Skill 集合和专业领域知识。

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        剧灵功能 Agent 系统                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      中央协调层 (Orchestrator)                     │   │
│  │                    - 意图路由 (Intention Dispatcher)               │   │
│  │                    - 上下文管理 (Context Manager)                  │   │
│  │                    - 项目元数据同步 (Project Metadata Sync)        │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                 ↓                                       │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┬────────────┐   │
│  │Dashboard │Editor    │Character │Scene     │Worldview  │Storyboard  │   │
│  │  Agent   │ Agent    │  Agent   │ Agent    │  Agent    │   Agent    │   │
│  └──────────┴──────────┴──────────┴──────────┴──────────┴────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Function 5: Worldview Agent (世界观 Agent)

### 5.1 Agent 身份与专长

```typescript
interface WorldviewAgent {
  id: "worldview-agent"
  name: "世界观架构师"
  version: "1.0.0"

  expertise: {
    core_domains: [
      "历史考据与时代重构",
      "地理环境与空间设计",
      "社会结构与权力体系",
      "文化符号与宗教信仰",
      "经济系统与技术水平",
      "神秘元素与超自然规则"
    ]

    research_capabilities: [
      "跨时代历史资料检索",
      "文化人类学研究方法",
      "比较神话学分析",
      "历史语言学考据",
      "物质文化史研究",
      "社会制度史比较"
    ]

    theoretical_framework: [
      "斯宾格勒文明形态学",
      "汤因比历史挑战-回应模型",
      "布罗代尔长时段理论",
      "沃勒斯坦世界体系理论",
      "列维-斯特劳斯结构主义神话学",
      "坎贝尔单一神话理论"
    ]
  }

  philosophy: """
  世界观不是背景板，而是故事的参与者。

  每个时代有其精神气质（Zeitgeist），每种地理有其文化形态，
  每个社会有其隐形规则。世界观 Agent 的使命是构建一个
  自洽、鲜活、有历史厚度的世界，让人物在其中行动时，
  他们的选择、冲突、命运都显得必然且真实。

  世界观的核心矛盾是：人与世界的关系。
  - 人顺应世界 → 传统/宿命
  - 人挑战世界 → 革命/悲剧
  - 人创造世界 → 英雄/神话
  """
}
```

### 5.2 核心能力矩阵

| 维度 | 能力 | 输入 | 输出 |
|------|------|------|------|
| **时代重构** | 历史考据、时代精神捕捉 | 年代/地域/主题 | 政治制度、社会阶层、日常生活的完整图景 |
| **地理设计** | 空间拓扑、环境心理 | 地理类型、故事需求 | 地图、空间关系、环境对人的影响 |
| **社会架构** | 权力结构、阶层流动 | 社会类型、冲突需求 | 阶层图谱、权力网络、上升/下降通道 |
| **符号系统** | 文化编码、象征体系 | 主题、人物设定 | 符号词典、仪式系统、禁忌体系 |
| **经济/技术** | 物质基础、生产力水平 | 时代、生产方式 | 技术树、经济网络、资源分布 |
| **神秘元素** | 魔法/超自然规则 | 类型设定 | 能力体系、代价机制、世界观边界 |

### 5.3 Skill 技能集

#### Skill 5.1: buildWorldview (构建世界观)

**功能**: 从零开始构建完整世界观

**输入**:
```typescript
interface BuildWorldviewInput {
  projectType: {
    medium: "movie" | "tv_drama" | "short_drama"
    genre: string[]  // 如 ["权谋", "动作", "悬疑"]
  }

  coreConflict: string  // 故事核心冲突
  targetEra?: {
    period: string  // 如 "民国末期"
    realWorldReference?: string  // 如 "湘西地区"
  }

  fantasyLevel: "realistic" | "low_fantasy" | "high_fantasy"

  mysteriousElements?: {
    hasMagic: boolean
    magicSystem?: string  // 如 "赶尸秘术"
    magicRules?: string[]
  }

  userPrompts?: string[]  // 用户自定义要求
}
```

**输出**:
```typescript
interface BuildWorldviewOutput {
  worldview: Worldview

  rationale: {
    era: string  // 为什么选择这个时代
    geography: string  // 为什么这个地理环境
    socialClass: string  // 为什么这种社会结构
    mystery: string  // 为什么引入神秘元素
  }

  dramaticFunctions: {
    howSupportsPlot: string[]  // 如何推动剧情
    howConstraintsCharacters: string[]  // 如何限制人物
    whatThematicResonance: string[]  // 主题共鸣
  }

  consistencyChecks: {
    internalLogic: boolean
    historicalPlausibility: boolean
    thematicCoherence: boolean
  }
}
```

**示例对话**:
```
用户: 我想写一个民国末期的短剧，主角是赶尸传人，核心冲突是
     传统与现代化的冲突。帮我构建世界观。

Worldview Agent: 分析您的需求...

  建议世界观框架：

  【时代背景】民国末期 (1945-1949)
  - 历史定位：旧秩序崩溃，新秩序未定的真空期
  - 精神气质：焦虑、迷茫、寻根、变革
  - 社会矛盾：军阀割据 vs 中央集权
              传统礼教 vs 西学东渐
              神秘信仰 vs 科学理性

  【地理环境】湘西山区
  - 空间特征：群山环抱、雾气缭绕、交通闭塞
  - 文化意义：汉瑶苗多民族混居地
              巫蛊文化发源地
              匪患横生的三不管地带
  - 戏剧功能：天然屏障 vs 外部世界的象征

  【神秘元素】赶尸秘术
  - 存在合理性：死亡观念 + 归乡文化 + 山区地理
  - 社会功能：客死他乡者的最后尊严
  - 权力结构：传人享有特殊社会地位
  - 规则限制：只能在夜间、需特殊符咒、代价巨大

  【社会阶层】(从高到低)
  1. 军阀/地方势力 - 掌握暴力
  2. 赶尸传人 - 掌握神秘知识
  3. 土匪 - 掌握山区地利
  4. 平民/商贩 - 经济力量
  5. 被赶尸者 - 最边缘

  【核心矛盾映射】
  - 传统(赶尸) vs 现代(公路建设/政府取缔)
  - 个人信仰 vs 社会变革
  - 山区封闭 vs 外部世界侵入

  是否需要我展开某个部分？
```

---

#### Skill 5.2: researchEra (时代考据)

**功能**: 深度考据特定时代的历史细节

**输入**:
```typescript
interface ResearchEraInput {
  era: string  // 如 "维多利亚时代伦敦"
  focusAreas: string[]  // 如 ["政治制度", "日常生活", "时尚"]

  researchDepth: "basic" | "detailed" | "academic"

  specificQuestions?: string[]  // 具体考据问题
}
```

**输出**:
```typescript
interface ResearchEraOutput {
  eraProfile: {
    timeSpan: string  // 时间跨度
    politicalSystem: string
    economicLevel: string
    technologicalLevel: string
    dominantIdeology: string
  }

  dailyLife: {
    urbanLife: string
    ruralLife: string
    food: string
    clothing: string
    housing: string
    transportation: string
  }

  socialStructure: {
    classes: SocialClass[]
    mobility: string  // 阶层流动方式
    powerCenters: string[]
  }

  culturalCodes: {
    values: string[]  // 核心价值观
    taboos: string[]  // 禁忌
    rituals: string[]  // 仪式
    symbols: Symbol[]  // 符号系统
  }

  sources: {
    primary: string[]  // 一手资料
    secondary: string[]  // 学术研究
    visual: string[]  // 视觉参考
  }
}
```

**示例对话**:
```
用户: 帮我考据一下北宋汴京的市民生活。

Worldview Agent: 【北宋汴京市民生活考据】

  基本档案：
  - 时间：960-1127年，巅峰期在仁宗、神宗朝
  - 人口：约100-150万（当时世界最大城市）
  - 地位：政治中心 + 商业中心 + 文化中心

  市民生活特征：

  【居住】
  - 坊市制崩溃：住宅区(坊)与商业区(市)界限消失
  - 夜市兴起：取消宵禁，三更半夜不闭市
  - 垂直建筑：出现多层酒楼、瓦舍（娱乐场所）
  - 典型住宅：前店后宅、天井院落

  【饮食】
  - 主食：米饭（南方）、面食（北方）
  - 外卖发达：叫"逐时施行索唤"
  - 茶文化盛行：茶馆遍地，茶艺成风
  - 酒文化：72家正店，上千脚店

  【娱乐】
  - 瓦舍勾栏：综合娱乐城，有杂剧、说书、杂技
  - 节日繁多：元旦、元宵、端午、七夕、中秋、重阳
  - 旅游文化：金明池、琼林苑定期开放
  - 体育活动：蹴鞠（足球）、相扑（摔跤）

  【服饰】
  - 男性：襕衫（读书人）、短褐（平民）
  - 女性：褙子（外衣）、抹胸（内衣）、裙子
  - 禁止：百姓不得用绫罗、金饰
  - 奢侈风气：中后期突破禁令

  【交通】
  - 水路：汴河为主，连接江淮
  - 陆路：马、驴、轿、车
  - 街道：御街宽200步，两侧有排水沟

  【社会流动】
  - 科举：平民上升主渠道
  - 商业：商人地位提高但仍受歧视
  - 娼优：卖艺不卖身，有社会地位

  【价值观】
  - 崇文：重文轻武，文人地位最高
  - 重商：商业发达，商人致富
  - 享乐："人生得意须尽欢"
  - 雅致：追求生活品味

  【视觉参考推荐】
  - 《清明上河图》：张择端
  - 《东京梦华录》：孟元老
  - 《水浒传》：前半部分

  需要深入某个方面吗？
```

---

#### Skill 5.3: checkConsistency (一致性检查)

**功能**: 检查剧本内容与世界观设定的一致性

**输入**:
```typescript
interface CheckConsistencyInput {
  worldview: Worldview
  scriptContent: ScriptContent
  checkLevel: "basic" | "strict" | "academic"
}
```

**输出**:
```typescript
interface CheckConsistencyOutput {
  consistencyReport: {
    overallScore: number  // 0-100

    issues: ConsistencyIssue[]

    byCategory: {
      historical: ConsistencyCategory
      geographical: ConsistencyCategory
      social: ConsistencyCategory
      technological: ConsistencyCategory
      cultural: ConsistencyCategory
      supernatural: ConsistencyCategory
    }
  }

  suggestions: {
    fixes: SuggestedFix[]
    alternatives: Alternative[]
  }
}
```

**示例对话**:
```
用户: 检查一下第5场是否与世界观设定冲突。

Worldview Agent: 【第5场一致性分析】

  场景概要：雾姝在客栈使用电话联系厉君

  检测到的问题：

  🔴 严重 - 历史时代错误
  - 世界观设定：民国末期 (1945-1949)
  - 问题：湘西偏远山区电话普及率极低
  - 事实：1949年湖南全省电话用户不足5000户，
         且主要集中在长沙等大城市

  🟡 中等 - 地理逻辑问题
  - 世界观设定：深山密林、交通闭塞
  - 问题：客栈有电话线路不合常理
  - 解释：山区架设线路成本高、维护难

  🟢 轻微 - 社会阶层问题
  - 世界观设定：赶尸传人受敬畏但边缘化
  - 问题：雾姝能随意使用电话需解释
  - 建议：需要展示她如何获得这种特权

  修复方案：

  方案A：符合时代的替代
  - 改为：雾姝通过商队传信
  - 优点：符合世界观、增加戏剧张力
  - 缺点：信息传递变慢

  方案B：特殊解释
  - 解释：这家客栈是土匪头子的据点，
          他们有军用电话（抢来的）
  - 优点：保留电话、增加世界观深度
  - 缺点：需要铺垫

  方案C：调整世界观
  - 修改：设定该地区有特殊通讯网络
         （如军阀私设、用于控制山区）
  - 优点：合理化电话的存在
  - 缺点：需要修改多处设定

  建议选择：方案B
  理由：最符合戏剧性需求，同时加深世界观
```

---

#### Skill 5.4: organizeWorldview (结构化整理)

**功能**: 将零散的世界观设定整理为结构化文档

**输入**:
```typescript
interface OrganizeWorldviewInput {
  rawMaterials: {
    notes: string[]
    referenceImages: string[]
    researchNotes: string[]
    userBrainstorm: string[]
  }

  organizeLevel: "basic" | "detailed" | "encyclopedic"
}
```

**输出**:
```typescript
interface OrganizeWorldviewOutput {
  worldview: Worldview

  visualAssets: {
    maps: MapAsset[]
    timelines: TimelineAsset[]
    relationshipDiagrams: DiagramAsset[]
  }

  narrativeSummary: {
    oneSentence: string
    oneParagraph: string
    fullDescription: string
  }

  quickReference: {
    keyTerms: TermDefinition[]
    commonErrors: CommonError[]
    qaPairs: QAPair[]
  }
}
```

**示例输出 - Worldview JSON 结构**:
```json
{
  "worldview": {
    "id": "wv_20250123_001",
    "projectId": "proj_001",
    "name": "我送君归去世界观",
    "version": 1,
    "updatedAt": "2026-01-23T10:00:00Z",

    "era": {
      "period": "民国末期",
      "yearRange": "1945-1949",
      "historicalContext": "旧秩序崩溃，新秩序未定",
      "zeitgeist": "焦虑、变革、寻根",
      "politicalSystem": "军阀割据 - 中央集权（名义上）",
      "economicLevel": "农业为主，初步工业化",
      "technologicalLevel": "前工业时代",
      "dominantIdeology": "传统礼教 vs 科学理性"
    },

    "geography": {
      "primaryLocation": "湘西山区",
      "characteristics": [
        "群山环抱",
        "雾气缭绕",
        "交通闭塞",
        "汉瑶苗混居"
      ],
      "climate": "亚热带湿润",
      "seasons": ["春雾", "夏热", "秋爽", "冬寒"],
      "spatialLayout": {
        "center": "龙门镇",
        "periphery": ["赶尸村", "土匪寨", "苗族寨"],
        "wilderness": "原始森林",
        "boundaries": "外界公路"
      },
      "dramaticFunction": "天然屏障 vs 外部世界的象征"
    },

    "socialStructure": {
      "classes": [
        {
          "name": "军阀/地方势力",
          "power": "暴力",
          "population": 5,
          "lifestyle": "奢华、独断"
        },
        {
          "name": "赶尸传人",
          "power": "神秘知识",
          "population": 1,
          "lifestyle": "边缘、受敬畏"
        },
        {
          "name": "土匪",
          "power": "地利",
          "population": 10,
          "lifestyle": "掠夺、自由"
        },
        {
          "name": "平民/商贩",
          "power": "经济",
          "population": 60,
          "lifestyle": "维生、恐惧"
        },
        {
          "name": "被赶尸者",
          "power": "无",
          "population": 24,
          "lifestyle": "工具、遗忘"
        }
      ],
      "mobility": "几乎冻结 - 唯一途径是掌握暴力或神秘知识",
      "powerCenters": ["镇公所", "赶尸堂", "土匪寨"],
      "socialContract": "恐惧维持秩序"
    },

    "mystery": {
      "hasSupernatural": true,
      "name": "赶尸秘术",
      "nature": "半宗教半技术",
      "origins": "苗族巫蛊 + 道家符箓 + 汉族归乡文化",
      "rules": [
        "只能在夜间操作",
        "需要摄魂铃引路",
        "死者需不久前死亡",
        "传人需承担业障"
      ],
      "costs": [
        "身体透支",
        "社会孤立",
        "精神压力",
        "寿命折损"
      ],
      "socialFunction": "客死他乡者的归乡服务",
      "powerDynamics": "传人享有特殊地位但被恐惧"
    },

    "culture": {
      "values": [
        "归乡 = 最终尊严",
        "生死有界",
        "神秘知识 = 危险力量",
        "传统 > 现代"
      ],
      "taboos": [
        "夜间不得见赶尸",
        "不得与传人直视",
        "不得询问死者姓名"
      ],
      "rituals": [
        "起尸仪式",
        "引魂铃",
        "归乡祭"
      ],
      "symbols": [
        {
          "sign": "摄魂铃",
          "meaning": "生死沟通、神秘力量",
          "usage": "赶尸、驱邪、召集"
        },
        {
          "sign": "符箓",
          "meaning": "控制超自然",
          "usage": "保护、命令"
        },
        {
          "sign": "雾",
          "meaning": "生死界限、神秘",
          "usage": "环境、氛围"
        }
      ]
    },

    "economy": {
      "basis": "农业 + 山货贸易",
      "currency": "银元 + 物物交换",
      "keyResources": ["山货", "药材", "鸦片"],
      "tradeRoutes": ["古商道", "水路"],
      "wealthDistribution": "极度不均"
    },

    "technology": {
      "level": "前工业",
      "available": [
        "冷兵器",
        "土枪（极少）",
        "马车",
        "油灯"
      ],
      "absent": [
        "电力",
        "电话（极少数）",
        "汽车（几乎没有）",
        "现代医疗"
      ]
    },

    "conflictDrivers": {
      "internal": [
        "传统 vs 现代",
        "神秘 vs 理性",
        "封闭 vs 开放"
      ],
      "external": [
        "政府取缔赶尸",
        "公路建设",
        "新思想传播"
      ]
    },

    "references": {
      "images": [
        {
          "type": "location",
          "url": "...",
          "description": "湘西山区参考"
        }
      ],
      "texts": [
        {
          "type": "history",
          "title": "湘西文化史",
          "relevance": "时代背景"
        }
      ],
      "media": [
        {
          "type": "film",
          "title": "湘西赶尸记",
          "relevance": "视觉参考"
        }
      ]
    },

    "meta": {
      "createdAt": "2026-01-23T08:00:00Z",
      "version": 1,
      "lastModifiedBy": "worldview-agent",
      "completeness": 0.85
    }
  }
}
```

---

#### Skill 5.5: supportWriting (辅助创作)

**功能**: 在剧本创作中提供世界观相关建议

**输入**:
```typescript
interface SupportWritingInput {
  context: {
    currentScene: Scene
    charactersPresent: string[]
    plotPoint: string
  }

  need: {
    settingDetails?: boolean
    characterMotivation?: boolean
    conflictOpportunities?: boolean
    thematicDepth?: boolean
  }
}
```

**输出**:
```typescript
interface SupportWritingOutput {
  suggestions: {
    settingDetails?: SettingDetail[]
    characterMotivations?: MotivationSuggestion[]
    conflicts?: ConflictOpportunity[]
    themes?: ThematicConnection[]
  }

  warnings: {
    consistencyIssues?: string[]
    missedOpportunities?: string[]
  }
}
```

**示例对话**:
```
用户: 第8场，雾姝和厉君在山洞躲避土匪追杀。
     我需要一些环境细节建议。

Worldview Agent: 【山洞场景世界观增强】

  基础环境设定：
  - 湘西喀斯特地貌，天然溶洞众多
  - 洞内常年恒温，冬暖夏凉
  - 可能有过往赶尸留下的痕迹

  感官细节建议：

  【视觉】
  - 洞口藤蔓遮蔽，仅透进几缕光线
  - 钟乳石滴水，在地面形成小水洼
  - 墙壁可能有赶尸符箓的残留痕迹
  - 角落有腐烂的稻草（曾有人躲藏）

  【听觉】
  - 滴水声的回响（暗示洞穴深度）
  - 远处传来土匪的喊声（外部威胁）
  - 洞内特有的寂静（两人独处）
  - 可能的蝙蝠振翅声

  【嗅觉】
  - 潮湿泥土味
  - 腐烂植被味
  - 也许还有淡淡的香火味（赶尸仪式残留）

  【触觉】
  - 洞壁湿滑
  - 空气湿度大
  - 地面不平

  【世界观深度】：

  1. 赶尸传人的视角
     - 这个洞穴可能是传人传统的避难所
     - 墙上符箓是祖先留下的保护咒
     - 她知道这里的秘密通道

  2. 厉君的视角
     - 对神秘事物的恐惧/好奇
     - 对雾姝能力的敬畏
     - 外部世界人对此类空间的陌生

  3. 戏剧功能
     - 封闭空间强制两人互动
     - 外部威胁（土匪）vs 内部秘密（洞穴历史）
     - 雾姝展示能力/知识的时机
     - 可能发现改变局势的线索

  4. 主题强化
     - 洞穴 = 边缘空间（符合两人社会地位）
     - 黑暗 = 不确定的未来
     - 符箓 = 传统的力量

  需要我展开某个方面吗？
```

---

### 5.4 与戏剧理论的深度整合

#### 世界观即冲突 (Worldview as Conflict)

基于 **马克思历史唯物主义** + **布迪厄场域理论**：

```
世界观的核心是各种"场域"(Field)的权力斗争：

┌─────────────────────────────────────────────────────────────┐
│                      世界观权力场域                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  【政治场域】                                              │
│    军阀 ↔ 地方绅士 ↔ 中央政府 ↔ 革命党                     │
│                                                             │
│  【经济场域】                                              │
│    商人 ↔ 高利贷者 ↔ 地主 ↔ 贫民                           │
│                                                             │
│  【文化场域】                                              │
│    赶尸传人 ↔ 新知识分子 ↔ 传统儒生 ↔ 洋派                 │
│                                                             │
│  【神秘场域】                                              │
│    赶尸秘术 ↔ 科学理性 ↔ 巫蛊迷信 ↔ 道家符箓               │
│                                                             │
└─────────────────────────────────────────────────────────────┘

人物 = 在这些场域中占据特定位置的个体
行动 = 试图改变/维持位置的策略
冲突 = 不同位置/策略的碰撞
```

#### 时代精神 (Zeitgeist) 捕捉

基于 **斯宾格勒《西方的没落》文化形态学**：

| 时代 | 精神气质 | 核心隐喻 | 典型冲突 |
|------|----------|----------|----------|
| **盛唐** | 扩张、自信 | "世界的中心" | 华夷之辨 |
| **晚明** | 颓废、内省 | "落日余晖" | 情欲 vs 礼教 |
| **民国** | 焦虑、断裂 | "十字路口" | 传统 vs 现代 |
| **文革** | 狂热、破坏 | "世界重造" | 忠诚 vs 人性 |
| **改革初** | 希望、迷茫 | "摸着石头过河" | 理想 vs 现实 |

#### 神话结构嵌入

基于 **坎贝尔单一神话** + **列维-斯特劳斯神话结构**：

```typescript
interface MythicWorldview {
  // 世界观必须能承载英雄旅程
  heroJourney: {
    ordinaryWorld: string      // 平凡世界（日常）
    callToAdventure: string    // 冒险召唤（打破平衡）
    threshold: string          // 跨越门槛（进入非凡）
    challenges: string[]       // 试炼盟友敌人
    ordeal: string             // 严峻考验
    reward: string             // 奖赏
    return: string             // 回归之路
  }

  // 世界观必须有其"深层结构"
  deepStructure: {
    binaryOppositions: [       // 根本二元对立
      string,  // 如 "生 vs 死"
      string   // 如 "传统 vs 现代"
    ]
    mediatingTerms: string[]   // 中介项（如赶尸）
    resolution: string         // 如何（试图）解决
  }
}
```

---

### 5.5 JSON 数据结构总结

```typescript
// 核心世界观结构
interface Worldview {
  id: string
  projectId: string
  name: string
  version: number
  updatedAt: DateTime

  // 六大核心维度
  era: Era                    // 时代
  geography: Geography        // 地理
  socialStructure: SocialStructure  // 社会
  mystery: Mystery            // 神秘元素
  culture: Culture            // 文化
  economy: Economy            // 经济

  // 元数据
  references: Reference[]     // 参考资料
  meta: WorldviewMeta
}

// 时代维度
interface Era {
  period: string              // 时期名称
  yearRange: string           // 年份范围
  historicalContext: string   // 历史语境
  zeitgeist: string           // 时代精神
  politicalSystem: string     // 政治制度
  economicLevel: string       // 经济水平
  technologicalLevel: string  // 技术水平
  dominantIdeology: string    // 主导意识形态
}

// 地理维度
interface Geography {
  primaryLocation: string     // 主要地点
  characteristics: string[]   // 地理特征
  climate: string             // 气候
  seasons: string[]           // 季节
  spatialLayout: {            // 空间布局
    center: string
    periphery: string[]
    wilderness: string
    boundaries: string
  }
  dramaticFunction: string    // 戏剧功能
}

// 社会结构维度
interface SocialStructure {
  classes: SocialClass[]       // 社会阶层
  mobility: string            // 流动性
  powerCenters: string[]      // 权力中心
  socialContract: string      // 社会契约
}

interface SocialClass {
  name: string
  power: string               // 权力来源
  population: number          // 人口占比
  lifestyle: string           // 生活方式
}

// 神秘元素维度
interface Mystery {
  hasSupernatural: boolean
  name?: string               // 名称
  nature: string              // 性质
  origins: string             // 起源
  rules: string[]             // 规则
  costs: string[]             // 代价
  socialFunction: string      // 社会功能
  powerDynamics: string       // 权力关系
}

// 文化维度
interface Culture {
  values: string[]            // 价值观
  taboos: string[]            // 禁忌
  rituals: string[]           // 仪式
  symbols: Symbol[]           // 符号系统
}

interface Symbol {
  sign: string                // 能指
  meaning: string             // 所指
  usage: string               // 用法
}

// 经济维度
interface Economy {
  basis: string               // 基础
  currency: string            // 货币
  keyResources: string[]      // 关键资源
  tradeRoutes: string[]       // 贸易路线
  wealthDistribution: string  // 财富分配
}

// 参考资料
interface Reference {
  type: "image" | "text" | "media"
  url?: string
  title?: string
  description?: string
  relevance: string
}

// 元数据
interface WorldviewMeta {
  createdAt: DateTime
  version: number
  lastModifiedBy: string      // agent-id
  completeness: number        // 0-1
}
```

---

### 5.6 用户交互示例

#### 完整对话流程示例

```
【对话开始】

用户: 我想新建一个世界观设定。

Worldview Agent: 您好！我是世界观架构师。我可以帮您：

  1. 从零构建完整世界观
  2. 考据特定历史时代
  3. 检查剧本与世界观的一致性
  4. 整理零散设定为结构化文档
  5. 提供世界观相关的创作建议

  您想做什么？

用户: 帮我构建一个世界观。

Worldview Agent: 好的，我需要了解一些信息：

  【基础信息】
  1. 这是什么类型的项目？
     - 电影 / 长剧 / 短剧
  2. 故事类型是什么？
     - 如：权谋、动作、爱情、悬疑...
  3. 故事的核心冲突是什么？

  【时代设定】
  4. 有特定的时代背景吗？
     - 真实历史时代（如：民国末期）
     - 虚构时代（如：赛博朋克未来）
     - 纯架空（如：完全幻想世界）

  【世界观类型】
  5. 真实程度？
     - 纯写实（无超自然元素）
     - 低魔（少量神秘元素）
     - 高魔（魔法普遍）

  6. 有神秘/超自然元素吗？
     - 如：魔法、异能、神话生物...

  请告诉我这些信息，我会为您构建世界观。

用户:
  1. 短剧
  2. 权谋 + 动作
  3. 传统与现代化的冲突
  4. 民国末期
  5. 低魔
  6. 有，赶尸秘术

Worldview Agent: [执行 Skill 5.1: buildWorldview]

  [输出完整世界观设定，见上文 Skill 5.1 示例]

  世界观初稿已完成。您可以：

  1. 深入考据某个时代细节
  2. 检查与已有剧本的一致性
  3. 调整某个维度的设定
  4. 获取创作建议

  接下来想做什么？

用户: 帮我考据一下民国末期的通讯方式。

Worldview Agent: [执行 Skill 5.2: researchEra]

  [输出考据结果，类似上文 Skill 5.2 示例，
   但聚焦于"通讯方式"：电话、电报、信件等]

  需要深入其他方面吗？

用户: 不用了，保存这个设定。

Worldview Agent: 已保存世界观设定到项目。

  设定文件：worldview_20250123_001.json
  完整度：85%

  建议下一步：
  - 可以开始创建人物（人物 Agent）
  - 可以开始设计场景（场景 Agent）
  - 可以开始剧本创作（编剧 Agent）

  人物和场景会自动引用这个世界观设定，
  确保全剧的一致性。

【对话结束】
```

---

## Function 6: Storyboard Agent (分镜 Agent)

### 6.1 Agent 身份与专长

```typescript
interface StoryboardAgent {
  id: "storyboard-agent"
  name: "分镜师"
  version: "1.0.0"

  expertise: {
    core_domains: [
      "电影摄影语言",
      "镜头设计与运动",
      "灯光设计",
      "场面调度 (Mise-en-scène)",
      "剪辑节奏",
      "声音设计"
    ]

    technical_knowledge: [
      "镜头类型与焦段",
      "机位运动",
      "构图法则",
      "灯光技术",
      "收音与音效",
      "后期特效"
    ]

    artistic_sensibilities: [
      "视觉叙事",
      "情绪渲染",
      "节奏控制",
      "风格统一",
      "类型化表达"
    ]
  }

  philosophy: """
  分镜不是技术图解，而是视觉化的情感表达。

  每个镜头都应该有其叙事目的——
  推进剧情、揭示人物、营造氛围、传达主题。

  好的分镜让文字"活"起来，
  让观众通过镜头"体验"故事，
  而不仅仅是"观看"故事。
  """
}
```

### 6.2 核心能力矩阵

| 维度 | 能力 | 输入 | 输出 |
|------|------|------|------|
| **镜头设计** | 机位、焦段、运动 | 场景内容+情绪 | 分镜表 |
| **构图** | 取景、平衡、深度 | 主体+环境 | 构图方案 |
| **灯光** | 光质、方向、色温 | 氛围需求 | 灯光图 |
| **场面调度** | 主体+摄影机运动 | 动作设计 | 调度图 |
| **声音** | 对白+音效+音乐 | 情绪曲线 | 声音表 |

### 6.3 Skill 技能集

#### Skill 6.1: designShots (镜头设计)

**输入**:
```typescript
interface DesignShotsInput {
  sceneContent: string
  emotionalTone: string
  practicalConstraints?: {
    location: string
    equipment: string[]
    budget: "low" | "medium" | "high"
  }
}
```

**输出**:
```typescript
interface DesignShotsOutput {
  shots: Shot[]

  rationale: {
    visualStyle: string
    pacing: string
    coverage: string
  }
}
```

**示例输出**:
```json
{
  "shots": [
    {
      "shotNumber": 1,
      "type": "建立镜头 (Establishing Shot)",
      "size": "远景 (Long Shot)",
      "angle": "平视",
      "movement": "缓慢推近",
      "duration": 3,
      "description": "月黑风高，雾气如潮水般在密林中翻涌。",
      "purpose": "建立环境，营造神秘氛围",
      "technical": {
        "focalLength": "24mm",
        "aperture": "f/8",
        "equipment": "轨道 + 摄影稳定器"
      }
    },
    {
      "shotNumber": 2,
      "type": "细节镜头",
      "size": "特写",
      "angle": "仰视",
      "movement": "固定",
      "duration": 2,
      "description": "雾姝的手部特写，紧握摄魂铃。",
      "purpose": "突出人物的决心与神秘感",
      "technical": {
        "focalLength": "85mm",
        "aperture": "f/2.8",
        "lighting": "轮廓光"
      }
    }
  ]
}
```

---

#### Skill 6.2: suggestMovements (运镜建议)

**基于**：《电影镜头语言》+《视觉叙事》

**示例对话**:
```
用户: 第3场雾姝和土匪对峙，有什么运镜建议？

Storyboard Agent: 【第3场运镜方案】

  场景分析：对峙戏 + 权力反转

  方案A：经典对峙剪辑
  ┌─────────────────────────────────────┐
  │ 1. 中景 - 双人同框                  │
  │    固定机位，建立空间关系           │
  │                                     │
  │ 2. 反打镜头                         │
  │    雾姝（仰拍）- 土匪（俯拍）       │
  │    暗示权力不平等                   │
  │                                     │
  │ 3. 慢推近                           │
  │    随着对话升级，逐渐推进           │
  │    增加紧张感                       │
  │                                     │
  │ 4. 突发动作 - 快速剪辑              │
  │    冲突爆发瞬间，节奏突变           │
  └─────────────────────────────────────┘

  方案B：一镜到底（高难度）
  ┌─────────────────────────────────────┐
  │ 运动轨迹：                          │
  │ 从土匪身后开始 → 绕到雾姝正面       │
  │ → 跟随雾姝动作 → 上升俯拍           │
  │                                     │
  │ 优势：沉浸感、连续紧张感             │
  │ 劣势：技术难度高、需要精确调度      │
  └─────────────────────────────────────┘

  方案C：主观视角（心理投射）
  ┌─────────────────────────────────────┐
  │ 1. 土匪 POV                         │
  │    看向雾姝 - 略带俯视（他的傲慢）  │
  │                                     │
  │ 2. 雾姝 POV                         │
  │    看向土匪 - 仰视（但眼神坚定）    │
  │                                     │
  │ 3. 客观中景                         │
  │    真实的权力对比                   │
  │                                     │
  │ 优势：心理深度、角色代入            │
  └─────────────────────────────────────┘

  建议选择：方案A（经典对峙剪辑）
  理由：短剧节奏快，方案A清晰高效，
       适合快速反转剧情。
```

---

#### Skill 6.3: designLighting (灯光设计)

**基于**：《电影灯光艺术》+《用光写作》

```typescript
interface LightingDesign {
  mood: string  // 情绪基调

  scheme: {
    keyLight: LightSource
    fillLight: LightSource
    backLight: LightSource
    practicals: PracticalLight[]
  }

  colorPalette: {
    dominant: string  // 主色调
    accent: string    // 强调色
    contrast: string  // 对比色
  }

  motivation: string  // 灯光动机（光源逻辑）
}
```

**示例**:
```
场景：山洞内，雾姝和厉君躲避

灯光方案：

【动机】月光透过洞口 + 壁上微弱火把

【光位布局】
      月光(背光)
         ↓
    [雾姝] --(侧光)-- [厉君]
                    ↑
              火把(暖色、微弱)

【光质】
- 月光：冷色、硬光、强对比
- 火把：暖色、柔光、弱补光

【情绪功能】
- 冷暖对比 = 人物关系的微妙
- 强对比 = 不确定性、危险
- 动态火光 = 时间流逝、紧张

【技术参数】
- 月光：5600K，硬光，从洞口射入
- 火把：3200K，柔光（加 diffusion），侧逆光
- 辅助：白色反光板，轻微补光
```

---

### 6.4 分镜表 JSON 结构

```typescript
interface Storyboard {
  id: string
  sceneId: string

  shots: Shot[]

  techSummary: {
    totalDuration: number
    cameraMoves: number
    lightingChanges: number
    equipmentNeeded: Equipment[]
  }

  visualStyle: {
    colorGrading: string
    aspectRatio: string  // 16:9 or 9:16
    frameRate: number    // 24/30/60
  }
}

interface Shot {
  shotNumber: number
  type: ShotType
  size: ShotSize
  angle: ShotAngle
  movement: CameraMovement
  duration: number  // seconds

  description: string
  purpose: string
  dialogue?: string

  technical: {
    focalLength?: string
    aperture?: string
    lighting?: LightingSetup
    equipment?: string[]
  }

  audio?: {
    dialogue: boolean
    music?: string
    sfx?: string[]
  }
}

type ShotType =
  | "establishing"     // 建立镜头
  | "master"           // 主镜头
  | "close-up"         // 特写
  | "extreme-close-up" // 大特写
  | "medium"           // 中景
  | "long"             // 远景
  | "extreme-long"     // 大远景
  | "over-the-shoulder"  // 过肩镜头
  | "point-of-view"    // 主观镜头
  | "insert"           // 插入镜头

type ShotSize = "ELS" | "LS" | "MS" | "CU" | "ECU"
type ShotAngle = "high" | "eye-level" | "low" | "dutch"
type CameraMovement =
  | "static"           // 固定
  | "pan"              // 摇
  | "tilt"             // 仰俯
  | "dolly"            // 推拉
  | "tracking"         // 跟踪
  | "crane"            // 升降
  | "handheld"         // 手持
  | "steadicam"        // 稳定器
```

---

## 跨 Agent 协作机制

### 1. 数据共享协议

```typescript
// 所有 Agent 共享的项目元数据
interface ProjectMetadata {
  id: string
  name: string

  type: {
    medium: "movie" | "tv_drama" | "short_drama"
    orientation: "landscape" | "portrait"
    genre: string[]
  }

  // 引用其他 Agent 的数据
  worldviewId?: string      // Worldview Agent
  characterIds: string[]    // Character Agent
  sceneIds: string[]        // Scene Agent

  // 全局约束
  constraints: {
    pacing: PacingConstraints
    format: string
    standards: string[]
  }
}
```

### 2. Agent 通信示例

```
【场景】：用户在编辑器中写一段雾姝的台词

Editor Agent: 我需要为雾姝写一句台词。
            当前情境：她正在向厉君解释赶尸。
            情绪：平静但坚定。

Character Agent: [收到请求]
             分析雾姝的心理状态：
             - coreDesire: 保护死者尊严
             - coreFear: 被误解为妖术
             - 当前关系：初识，信任度低

             建议台词方向：
             "这不是妖术，是让落叶归根的路。"
             或
             "人死后，魂还在。我只是引路人。"

Worldview Agent: [收到上下文]
              补充世界观细节：
              - 赶尸的社会功能：归乡服务
              - 时代精神：传统尊严
              - 符号：路引、摄魂铃

              建议加入关键词："路引"、"归乡"

Editor Agent: [整合建议]
              生成台词：
              "魂兮归来，路引在此。"
              "这不是妖术，是让落叶归根的路。"

Scene Agent: [收到场景上下文]
           补充场景视觉：
           - 时间：夜
           - 光线：篝火微光
           - 环境：山洞，滴水声

           建议加入动作说明：
           （雾姝从怀中取出符箓，火光映照下）
           （她的声音平静，没有犹豫）

【最终输出】
△ 雾姝从怀中取出符箓，火光映照下她的侧脸。
雾姝：魂兮归来，路引在此。
      （停顿，看向厉君）
      这不是妖术，是让落叶归根的路。
```

### 3. 协作优先级

```
┌─────────────────────────────────────────────────────┐
│               Agent 协作优先级矩阵                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Worldview Agent                                    │
│  ├─ 基础设定 (所有其他 Agent 依赖)                  │
│  └─ 一致性检查 (最高优先级)                         │
│                                                     │
│  Character Agent                                    │
│  ├─ 人物动机 (驱动剧情)                             │
│  ├─ 对白生成 (Editor Agent 依赖)                   │
│  └─ 人物一致性 (Scene Agent 依赖)                  │
│                                                     │
│  Scene Agent                                        │
│  ├─ 场景视觉 (Storyboard Agent 依赖)               │
│  ├─ 情绪氛围 (所有 Agent 参考)                     │
│  └─ 节奏控制 (Editor Agent 参考)                   │
│                                                     │
│  Editor Agent                                       │
│  ├─ 剧本创作 (核心输出)                             │
│  ├─ 格式规范 (输出标准)                             │
│  └─ 依赖所有其他 Agent 的上下文                    │
│                                                     │
│  Storyboard Agent                                   │
│  ├─ 视觉化 (后期输出)                               │
│  └─ 依赖 Editor + Scene 的内容                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 总结

六大功能 Agent 各司其职，通过统一的 JSON 数据格式和中央协调层进行协作：

| Agent | 核心职责 | 主要输出 | 依赖 |
|-------|----------|----------|------|
| **Dashboard Agent** | 快速入口、灵感引导 | 项目卡片、创作建议 | 无 |
| **Editor Agent** | 剧本创作、格式规范 | TipTap JSON | 所有 Agent |
| **Character Agent** | 人物建模、行为算法 | 人物档案、心理分析 | Worldview |
| **Scene Agent** | 场景视觉、感官体验 | 场景卡片、参考图 | Worldview |
| **Worldview Agent** | 世界构建、时代考据 | 世界观 JSON | 无 |
| **Storyboard Agent** | 分镜设计、运镜建议 | 分镜表、技术方案 | Editor + Scene |

---

**让灵感，在剧本中苏醒** ✨
