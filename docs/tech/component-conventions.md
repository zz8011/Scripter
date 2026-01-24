# 组件使用约定

> 确保组件一致性，避免重复造轮子

---

## 组件组织规则

### 文件结构

```
components/
├── ui/              # shadcn/ui 基础组件（不修改）
│   ├── button.tsx
│   ├── modal.tsx
│   └── index.ts
├── layout/          # 布局组件
│   ├── main-layout.tsx
│   ├── sidebar.tsx
│   └── index.ts
├── editor/          # 编辑器组件
│   ├── script-editor.tsx
│   ├── toolbar.tsx
│   └── index.ts
├── dashboard/       # 控制台组件
│   ├── stats-card.tsx
│   ├── project-card.tsx
│   └── index.ts
├── characters/      # 人物组件
│   ├── character-card.tsx
│   └── index.ts
├── scenes/          # 场景组件
│   ├── scene-board.tsx
│   └── index.ts
├── worldview/       # 世界观组件
│   └── index.ts
├── storyboard/      # 分镜组件
│   └── index.ts
└── shared/          # 共享组件
    ├── loading.tsx
    ├── error.tsx
    └── index.ts
```

---

## 命名规范

### 组件命名

```tsx
// ✅ 好的命名：清晰、具体
<ProjectCard />
<SceneBoard />
<AIChatPanel />
<CharacterModal />
<StatsCard />

// ❌ 不好的命名：太通用
<Card />           /* 应该是 ProjectCard, SceneCard 等 */
<Board />          /* 应该是 SceneBoard */
<Panel />          /* 应该是 AIChatPanel 或其他 */
<Modal />          /* 应该是具体的 modal 类型 */
```

### 文件命名

```
✅ 好的命名
project-card.tsx
scene-board.tsx
ai-chat-panel.tsx

❌ 不好的命名
Card.tsx          /* 太通用 */
Board.tsx         /* 太通用 */
panel.tsx         /* 小写开头 */
```

---

## Props 设计规范

### 基本 Props 结构

```tsx
// ✅ 好的 Props 设计
interface ProjectCardProps {
  // 必需数据
  project: Project;

  // 事件处理（on 前缀）
  onClick?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;

  // 样式变体（可选）
  variant?: 'default' | 'compact' | 'detailed';

  // 布尔标志（is/has 前缀）
  isActive?: boolean;
  isLoading?: boolean;

  // 子元素
  children?: React.ReactNode;

  // 类名扩展
  className?: string;
}

// ❌ 不好的 Props 设计
interface CardProps {
  data: any;              /* 类型不明确 */
  callback?: Function;    /* 不清晰 */
  flag?: boolean;         /* 不明确是什flag */
  style?: any;            /* 应该用 className */
}
```

### Props 命名约定

```tsx
// 事件处理：on + 动作名
onClick
onEdit
onDelete
onSubmit
onCancel

// 布尔标志：is/has + 状态
isLoading
isActive
isDisabled
hasError

// 变体：variant
variant="default" | "compact" | "detailed"

// 尺寸：size
size="sm" | "md" | "lg"
```

---

## 通用组件使用指南

### Button 组件

```tsx
import { Button } from '@/components/ui/button';

// 主要操作（品牌金色）
<Button variant="brand">创建项目</Button>

// 次要操作
<Button variant="outline">取消</Button>

// 危险操作
<Button variant="destructive">删除</Button>

// 幽灵按钮
<Button variant="ghost">关闭</Button>

// 不同尺寸
<Button size="sm">小按钮</Button>
<Button size="default">默认</Button>
<Button size="lg">大按钮</Button>
```

### Modal 组件

```tsx
import { Modal } from '@/components/ui/modal';

// ✅ 正确使用
function Example() {
  const [open, setOpen] = useState(false);

  return (
    <Modal isOpen={open} onClose={setOpen} title="标题">
      {/* 内容 */}
    </Modal>
  );
}

// ⚠️ 注意：模态框宽度固定为 700px
// 不要使用 width 属性调整
```

### Card 组件

```tsx
// ✅ 正确：使用玻璃拟态效果
<div className="glass-card p-6">
  {/* 内容 */}
</div>

// CSS
.glass-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
}

// ✅ 正确：金色悬停边框
<div className="gold-hover-border p-6">
  {/* 内容 */}
</div>

// CSS
.gold-hover-border {
  border: 1px solid #D3C9B0;
  transition: border-color 0.3s ease;
}

.gold-hover-border:hover {
  border-color: #C9A962;
}
```

---

## 数据流规范

### 状态提升原则

```tsx
// ✅ 正确：状态在父组件管理
function Parent() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <>
      <List items={items} selected={selected} onSelect={setSelected} />
      <Detail id={selected} />
    </>
  );
}

interface ListProps {
  items: Item[];
  selected: string | null;
  onSelect: (id: string) => void;
}

interface DetailProps {
  id: string | null;
}

// ❌ 错误：状态分散在子组件
function Child() {
  const [selected, setSelected] = useState();  /* 应该提升到父组件 */
}
```

### 何时使用状态

```tsx
// ✅ 使用 useState 的场景
- 表单输入值
- UI 开关状态（展开/收起）
- 选中项
- 加载状态
- 错误状态

// ✅ 使用 useRef 的场景
- DOM 元素引用
- 不触发重新渲染的值
- 定时器 ID

// ✅ 使用 useMemo 的场景
- 昂贵计算结果
- 复杂对象/数组的创建
- 避免子组件不必要的渲染

// ✅ 使用 useCallback 的场景
- 传递给优化子组件的函数
- 作为其他 Hook 的依赖
```

### API 调用规范

```tsx
// ✅ 正确：API 调用封装在 lib/api
// lib/api/projects.ts
export async function getProject(id: string) {
  const response = await fetch(`/api/projects/${id}`);
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
}

export async function createProject(data: CreateProjectInput) {
  const response = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create');
  return response.json();
}

// 组件中使用
function ProjectList() {
  const { data, error, isLoading } = useSWR('/api/projects', fetcher);
  // 或使用 React Query
}

// ❌ 错误：直接在组件中调用 fetch
function Component() {
  useEffect(() => {
    fetch('/api/projects/1');  /* 应该封装到 lib/api */
  }, []);
}
```

---

## 组件组合模式

### Container/Presentational 模式

```tsx
// Container 组件：处理数据逻辑
function ProjectListContainer() {
  const { projects, isLoading } = useProjects();

  if (isLoading) return <Loading />;
  if (!projects) return <Error />;

  return <ProjectList projects={projects} />;
}

// Presentational 组件：只负责展示
interface ProjectListProps {
  projects: Project[];
}

function ProjectList({ projects }: ProjectListProps) {
  return (
    <div className="grid gap-4">
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

### Compound Components 模式

```tsx
// ✅ 复杂组件使用组合模式
function SceneBoard() {
  return (
    <SceneBoard.Container>
      <SceneBoard.Column status="pending" title="待写">
        {pendingScenes.map(scene => (
          <SceneBoard.Card key={scene.id} scene={scene} />
        ))}
      </SceneBoard.Column>
      <SceneBoard.Column status="writing" title="写作中">
        {writingScenes.map(scene => (
          <SceneBoard.Card key={scene.id} scene={scene} />
        ))}
      </SceneBoard.Column>
      <SceneBoard.Column status="completed" title="已完成">
        {completedScenes.map(scene => (
          <SceneBoard.Card key={scene.id} scene={scene} />
        ))}
      </SceneBoard.Column>
    </SceneBoard.Container>
  );
}
```

---

## 样式约定

### Tailwind 类名顺序

```tsx
// ✅ 好的顺序：布局 → 间距 → 视觉 → 其他
<div className="
  flex items-center justify-between    /* 布局 */
  p-4 gap-4                            /* 间距 */
  bg-white border border-gray-200      /* 视觉 */
  rounded-lg shadow-md                 /* 其他效果"
>

// ✅ 响应式：从移动端到桌面端
<div className="
  flex flex-col                         /* 移动：列布局 */
  md:flex-row                           /* 桌面：行布局 */
  gap-4 md:gap-8                        /* 响应式间距 */
">
```

### 条件样式

```tsx
// ✅ 使用 clsx 或 cn 工具
import { cn } from '@/lib/utils';

<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  isLoading && 'loading-classes'
)} />

// ✅ 或使用模板字符串
<div className={`base ${isActive ? 'active' : ''}`} />
```

### 避免内联样式

```tsx
// ✅ 好：使用 Tailwind 类名
<div className="p-4 bg-white" />

// ⚠️ 避免内联样式（除非动态值）
<div style={{ padding: '16px' }}>  {/* 应该用 className */}

// ✅ 动态值可以接受
<div style={{ width: `${progress}%` }}>
```

---

## 类型定义规范

### 组件 Props 类型

```tsx
// ✅ 明确定义 Props 类型
interface ProjectCardProps {
  project: Project;
  onEdit?: (id: string) => void;
  variant?: 'default' | 'compact';
}

export function ProjectCard({ project, onEdit, variant = 'default' }: ProjectCardProps) {
  // ...
}

// ❌ 避免使用 any
function Card({ data }: { data: any }) {  /* 类型不明确 */
```

### 导出类型

```tsx
// ✅ 组件和类型一起导出
export function ProjectCard(props: ProjectCardProps) { }
export type { ProjectCardProps };

// ✅ 或使用命名空间
export namespace ProjectCard {
  export interface Props { }
  export interface Styles { }
}
```

---

## 性能优化约定

### 何时使用 memo

```tsx
// ✅ 使用 React.memo 的场景
- 纯展示组件，props 不经常变化
- 被频繁重新渲染的父组件包裹
- 渲染成本昂贵的组件

export const ProjectCard = React.memo(function ProjectCard({ project }) {
  // ...
});
```

### 何时使用 useMemo

```tsx
// ✅ 使用 useMemo 的场景
const filteredProjects = useMemo(() => {
  return projects.filter(p => p.status === 'active');
}, [projects]);

// ❌ 不必要的 useMemo
const value = useMemo(() => 'hello', []);  /* 简单值不需要 */
```

### 何时使用 useCallback

```tsx
// ✅ 使用 useCallback 的场景
const handleDelete = useCallback((id: string) => {
  deleteProject(id);
}, [deleteProject]);  // deleteProject 稳定时才需要

// ❌ 不必要的 useCallback
const handleClick = useCallback(() => {  /* 简单函数不需要 */
  console.log('clicked');
}, []);
```

---

## 文档注释规范

```tsx
/**
 * 项目卡片组件
 *
 * @param project - 项目数据
 * @param onEdit - 编辑回调（可选）
 * @param onDelete - 删除回调（可选）
 * @param variant - 卡片变体：default | compact
 *
 * @example
 * ```tsx
 * <ProjectCard
 *   project={project}
 *   onEdit={(id) => router.push(`/projects/${id}`)}
 *   variant="default"
 * />
 * ```
 */
export function ProjectCard({ project, onEdit, variant = 'default' }: ProjectCardProps) {
  // ...
}
```

---

## 常见错误

### ❌ 避免

```tsx
// 1. 硬编码样式值
<div style={{ color: '#C9A962' }}>  /* 应该用 CSS variable */

// 2. 重复逻辑
{items.map(item => (
  <div key={item.id} className={`p-4 ${item.active ? 'bg-gold' : ''}`}>  /* 提取为组件 */
))}

// 3. 过早优化
const memoizedValue = useMemo(() => simpleValue, []);  /* 不需要 */

// 4. 忽略错误处理
const { data } = useSWR('/api/projects');  /* 没有 error 处理 */

// 5. 不一致的命名
function projectCard() {}  // 应该是 ProjectCard
const USER_DATA = ...     // 应该是 userData
```

---

## 检查清单

在创建新组件前，确认：

- [ ] 检查是否已有类似组件可复用
- [ ] 遵循命名规范
- [ ] Props 类型明确
- [ ] 使用正确的样式（Tailwind + CSS Variables）
- [ ] 响应式设计考虑
- [ ] 可访问性（键盘导航、ARIA）
- [ ] 性能考虑（memo、useMemo）
- [ ] 添加必要注释

---

**统一规范，提升效率** ✨
