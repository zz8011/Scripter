# 剧本编辑器实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为剧灵平台开发专业的 TipTap 剧本编辑器，支持中文短剧剧本格式规范 v2.0

**Architecture:** 使用 TipTap (基于 ProseMirror) 作为富文本编辑核心，扩展自定义节点支持剧本格式。React 组件负责 UI 交互，Zustand 管理编辑器状态，与现有 AI 系统集成。

**Tech Stack:** Next.js 16, React 19, TipTap, TypeScript, Tailwind CSS, shadcn/ui, Lucide React, Prisma

---

## 前置准备

### Task 0: 安装依赖

**Files:**
- Modify: `projects/scripter-nextjs/package.json`

**Step 1: 安装 TipTap 核心包**

```bash
cd projects/scripter-nextjs
npm install @tiptap/react @tiptap/starter-kit @tiptap/pm @tiptap/core
```

**Expected:** package.json 新增依赖
```json
{
  "dependencies": {
    "@tiptap/react": "^2.12.2",
    "@tiptap/starter-kit": "^2.12.2",
    "@tiptap/pm": "^2.12.2",
    "@tiptap/core": "^2.12.2",
    "@tiptap/extension-placeholder": "^2.12.2",
    "@tiptap/extension-character-count": "^2.12.2",
    "lowlight": "^3.2.0"
  }
}
```

**Step 2: 安装类型定义和字体**

```bash
npm install @types/lowlight
```

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat(editor): install TipTap dependencies"
```

---

## Phase 1: 基础编辑器框架

### Task 1: 创建类型定义文件

**Files:**
- Create: `projects/scripter-nextjs/lib/editor/types.ts`

**Step 1: Write the types file**

```typescript
/**
 * 剧本编辑器类型定义
 * 遵循中文短剧剧本格式规范 v2.0
 */

// ============================================================
// 场景标题相关类型
// ============================================================

export interface SceneHeadingAttrs {
  episode: number;
  scene: number;
  time: TimeOfDay;
  location: LocationType;
  place: string;
  characters: string[];
}

export type TimeOfDay =
  | '日'
  | '夜'
  | '黄昏'
  | '清晨'
  | '傍晚'
  | '午夜';

export type LocationType = '内' | '外' | '内外';

// ============================================================
// 对话相关类型
// ============================================================

export interface DialogueAttrs {
  character: string;
  emotion?: string;
  isOS: boolean;
}

// ============================================================
// 特殊标记类型
// ============================================================

export interface SpecialMarkAttrs {
  type: 'subtitle' | 'flashback' | 'flashback_end' | 'narrator';
  content?: string;
}

// ============================================================
// 编辑器状态类型
// ============================================================

export interface EditorState {
  content: string;
  selection: Selection | null;
  cursorPosition: number;
}

export interface Selection {
  start: number;
  end: number;
  text: string;
  lineNumber: number;
  columnNumber: number;
}

export interface SelectionChangeEvent {
  oldSelection: Selection | null;
  newSelection: Selection | null;
}

// ============================================================
// 上下文类型
// ============================================================

export interface SceneInfo {
  sceneNumber: string;
  type: 'INT' | 'EXT' | 'INT/EXT';
  title: string;
  time?: string;
}

export interface CharacterInfo {
  name: string;
  description?: string;
}

export interface EditorContext {
  selectedText: string;
  textBeforeCursor: string;
  textAfterCursor: string;
  selection: Selection | null;
  currentScene: SceneInfo | null;
  relatedCharacters: CharacterInfo[];
  timestamp: number;
  windowSize: number;
}

export interface ContextCollectorOptions {
  windowSize?: number;
  maxContextLength?: number;
  includeSceneInfo?: boolean;
  includeCharacterInfo?: boolean;
  enableCache?: boolean;
  cacheExpiry?: number;
}

// ============================================================
// 统计信息类型
// ============================================================

export interface ScriptStats {
  wordCount: number;
  characterCount: number;
  sceneCount: number;
  dialogueCount: number;
  estimatedDuration: number; // 秒
  formatScore: number; // 0-100
}

// ============================================================
// AI 操作类型
// ============================================================

export type AIOperationType =
  | 'polish'
  | 'continue'
  | 'rewrite'
  | 'format_fix'
  | 'audience_critique'
  | 'plot_twist';

export interface AIOperation {
  type: AIOperationType;
  selectedText: string;
  context: EditorContext;
}

// ============================================================
// 格式校验类型
// ============================================================

export interface FormatIssue {
  type: FormatIssueType;
  message: string;
  line: number;
  column: number;
  severity: 'error' | 'warning';
  suggestion?: string;
}

export type FormatIssueType =
  | 'scene_heading_format'
  | 'dialogue_colon'
  | 'os_format'
  | 'action_prefix'
  | 'punctuation';

export interface FormatValidationResult {
  issues: FormatIssue[];
  score: number; // 0-100
  valid: boolean;
}
```

**Step 2: Commit**

```bash
git add lib/editor/types.ts
git commit -m "feat(editor): add TypeScript type definitions"
```

---

### Task 2: 创建基础编辑器组件

**Files:**
- Create: `projects/scripter-nextjs/components/editor/script-editor.tsx`
- Create: `projects/scripter-nextjs/components/editor/editor-toolbar.tsx`
- Create: `projects/scripter-nextjs/components/editor/status-bar.tsx`

**Step 1: Create script-editor component**

```typescript
'use client';

/**
 * 剧本编辑器主组件
 * 基于 TipTap 构建，支持中文短剧剧本格式规范 v2.0
 */

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import EditorToolbar from './editor-toolbar';
import StatusBar from './status-bar';

interface ScriptEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  onSave?: () => void;
  className?: string;
}

export default function ScriptEditor({
  content = '',
  onChange,
  onSave,
  className,
}: ScriptEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Placeholder.configure({
        placeholder: '开始创作你的剧本...',
      }),
      CharacterCount,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-none max-w-none',
          'font-[Courier_Prime,Noto_Sans_SC,monospace]',
          'text-[18px] leading-[1.5]',
          'text-[#1A1A1A]',
          'min-h-[800px]',
          'outline-none',
          'px-[60px] py-10'
        ),
      },
    },
  });

  // 处理保存快捷键
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      onSave?.();
    }
  }, [onSave]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 顶部工具栏 */}
      <EditorToolbar editor={editor} onSave={onSave} />

      {/* 编辑器内容区 */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      {/* 底部状态栏 */}
      <StatusBar editor={editor} />
    </div>
  );
}
```

**Step 2: Create editor-toolbar component**

```typescript
'use client';

/**
 * 编辑器工具栏组件
 * 提供格式插入按钮和基础操作
 */

import { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  MessageSquare,
  Triangle,
  Sparkles,
  BadgeInfo,
  Undo,
  Redo,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditorToolbarProps {
  editor: Editor;
  onSave?: () => void;
}

export default function EditorToolbar({ editor, onSave }: EditorToolbarProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-[#D3C9B0]">
      {/* 格式插入按钮 */}
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => insertSceneHeading(editor)}
      >
        <MapPin className="w-4 h-4" />
        场景
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => insertDialogue(editor)}
      >
        <MessageSquare className="w-4 h-4" />
        对话
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => insertAction(editor)}
      >
        <Triangle className="w-4 h-4" />
        动作
      </Button>

      <div className="w-px h-6 bg-[#D3C9B0] mx-1" />

      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => insertOS(editor)}
      >
        <Sparkles className="w-4 h-4" />
        OS
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => insertSubtitle(editor)}
      >
        <BadgeInfo className="w-4 h-4" />
        字幕
      </Button>

      <div className="flex-1" />

      {/* 撤销/重做 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo className="w-4 h-4" />
      </Button>

      {/* 保存按钮 */}
      <Button
        size="sm"
        className="bg-[#C9A962] hover:bg-[#D4B978] text-[#1A1A1A]"
        onClick={onSave}
      >
        保存
      </Button>
    </div>
  );
}

// 临时插入函数（后续将使用自定义节点）
function insertSceneHeading(editor: Editor) {
  editor.chain().focus().insertContent('**场1-1 日/内 地点 主要人物：**').run();
}

function insertDialogue(editor: Editor) {
  editor.chain().focus().insertContent('角色名：对话内容').run();
}

function insertAction(editor: Editor) {
  editor.chain().focus().insertContent('△动作描述').run();
}

function insertOS(editor: Editor) {
  editor.chain().focus().insertContent('角色名(OS)：内心独白').run();
}

function insertSubtitle(editor: Editor) {
  editor.chain().focus().insertContent('【字幕：内容】').run();
}
```

**Step 3: Create status-bar component**

```typescript
'use client';

/**
 * 编辑器状态栏组件
 * 显示字数、场景数、预计时长等信息
 */

import { Editor } from '@tiptap/react';
import { useEditorState } from '@tiptap/react';
import { Type, MapPin, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StatusBarProps {
  editor: Editor;
}

export default function StatusBar({ editor }: StatusBarProps) {
  const [stats, setStats] = useState({
    wordCount: 0,
    sceneCount: 0,
    estimatedDuration: 0,
  });

  useEffect(() => {
    const updateStats = () => {
      const text = editor.getText();
      const wordCount = text.length;

      // 计算场景数（粗略计算）
      const sceneMatches = text.match(/场\d+-\d+/g);
      const sceneCount = sceneMatches?.length || 0;

      // 估算时长：按每分钟200字计算
      const estimatedDuration = Math.ceil(wordCount / 200);

      setStats({
        wordCount,
        sceneCount,
        estimatedDuration,
      });
    };

    updateStats();
    editor.on('update', updateStats);

    return () => {
      editor.off('update', updateStats);
    };
  }, [editor]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}分钟`;
  };

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-[#FAF7F0] border-t border-[#D3C9B0] text-sm">
      <div className="flex items-center gap-6">
        {/* 字数 */}
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-[#8B7355]" />
          <span className="text-[#5C5548]">字数：</span>
          <span className="font-semibold text-[#1A1A1A]">
            {stats.wordCount.toLocaleString()}
          </span>
        </div>

        {/* 场景数 */}
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#8B7355]" />
          <span className="text-[#5C5548]">场景：</span>
          <span className="font-semibold text-[#1A1A1A]">
            {stats.sceneCount > 0 ? `场1-${stats.sceneCount}` : '-'}
          </span>
        </div>

        {/* 预计时长 */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#8B7355]" />
          <span className="text-[#5C5548]">预计时长：</span>
          <span className="font-semibold text-[#1A1A1A]">
            约{formatDuration(stats.estimatedDuration)}
          </span>
        </div>
      </div>

      {/* 格式符合率（暂时显示固定值） */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-[#8B7355]">格式符合率</span>
        <div className="w-24 h-2 bg-[#D3C9B0] rounded-full overflow-hidden">
          <div className="h-full bg-[#7FA870]" style={{ width: '95%' }} />
        </div>
        <span className="text-xs font-bold text-[#7FA870]">95%</span>
      </div>
    </div>
  );
}
```

**Step 4: Update globals.css for Courier Prime font**

Add to `projects/scripter-nextjs/app/globals.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');
```

**Step 5: Commit**

```bash
git add components/editor/ app/globals.css
git commit -m "feat(editor): add base editor components with toolbar and status bar"
```

---

### Task 3: 创建编辑器页面

**Files:**
- Create: `projects/scripter-nextjs/app/scripts/[id]/page.tsx`
- Create: `projects/scripter-nextjs/app/scripts/[id]/layout.tsx`

**Step 1: Create the editor page**

```typescript
'use client';

/**
 * 剧本编辑器页面
 * 沉浸式编辑环境
 */

import { useState } from 'react';
import ScriptEditor from '@/components/editor/script-editor';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function ScriptEditorPage({ params }: { params: { id: string } }) {
  const [content, setContent] = useState('');

  const handleSave = () => {
    // TODO: 实现保存逻辑
    console.log('Saving script...', content);
  };

  return (
    <div className="flex h-screen bg-[#F5F1E8]">
      {/* 主编辑区 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部导航栏 */}
        <header className="flex items-center gap-4 px-6 py-4 bg-white border-b border-[#D3C9B0]">
          <Link href="/scripts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>

          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#1A1A1A]">
              未命名剧本
            </h1>
            <p className="text-xs text-[#8B7355]">
              第1集 · 场景1-1
            </p>
          </div>

          <Button
            onClick={handleSave}
            className="bg-[#C9A962] hover:bg-[#D4B978] text-[#1A1A1A]"
          >
            <Save className="w-4 h-4 mr-2" />
            保存
          </Button>
        </header>

        {/* 编辑器 */}
        <ScriptEditor
          content={content}
          onChange={setContent}
          onSave={handleSave}
          className="flex-1"
        />
      </main>
    </div>
  );
}
```

**Step 2: Create layout**

```typescript
import { ReactNode } from 'react';

export default function ScriptEditorLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
```

**Step 3: Commit**

```bash
git add app/scripts/[id]/
git commit -m "feat(editor): add script editor page with immersive layout"
```

---

## Phase 2: TipTap 自定义节点

### Task 4: 创建场景标题节点

**Files:**
- Create: `projects/scripter-nextjs/lib/editor/extensions/nodes/scene-heading.ts`

**Step 1: Create SceneHeading extension**

```typescript
/**
 * 场景标题节点
 * 格式：**场X-Y 时间/内外 地点 主要人物：A、B**
 */

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { SceneHeadingAttrs } from '../../types';
import SceneHeadingComponent from './scene-heading-component';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    sceneHeading: {
      insertSceneHeading: (attrs: SceneHeadingAttrs) => ReturnType;
    };
  }
}

export const SceneHeading = Node.create<SceneHeadingAttrs>({
  name: 'sceneHeading',

  group: 'block',

  content: 'inline*',

  defining: true,

  addAttributes() {
    return {
      episode: {
        default: 1,
        parseHTML: (element) => parseInt(element.getAttribute('data-episode') || '1', 10),
        renderHTML: (attributes) => ({
          'data-episode': attributes.episode,
        }),
      },
      scene: {
        default: 1,
        parseHTML: (element) => parseInt(element.getAttribute('data-scene') || '1', 10),
        renderHTML: (attributes) => ({
          'data-scene': attributes.scene,
        }),
      },
      time: {
        default: '日',
        parseHTML: (element) => element.getAttribute('data-time') || '日',
        renderHTML: (attributes) => ({
          'data-time': attributes.time,
        }),
      },
      location: {
        default: '内',
        parseHTML: (element) => element.getAttribute('data-location') || '内',
        renderHTML: (attributes) => ({
          'data-location': attributes.location,
        }),
      },
      place: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-place') || '',
        renderHTML: (attributes) => ({
          'data-place': attributes.place,
        }),
      },
      characters: {
        default: [],
        parseHTML: (element) => {
          const chars = element.getAttribute('data-characters');
          return chars ? JSON.parse(chars) : [];
        },
        renderHTML: (attributes) => ({
          'data-characters': JSON.stringify(attributes.characters),
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="scene-heading"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({
      'data-type': 'scene-heading',
      class: 'scene-heading',
    }, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SceneHeadingComponent);
  },

  addCommands() {
    return {
      insertSceneHeading:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs,
          });
        },
    };
  },
});

// 场景标题的显示文本
export function formatSceneHeading(attrs: SceneHeadingAttrs): string {
  const { episode, scene, time, location, place, characters } = attrs;
  const chars = characters.length > 0 ? ` 主要人物：${characters.join('、')}` : '';
  return `**场${episode}-${scene} ${time}/${location} ${place}${chars}**`;
}
```

**Step 2: Create React component for the node**

```typescript
/**
 * 场景标题节点 React 组件
 */

import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { MapPin } from 'lucide-react';
import { SceneHeadingAttrs, formatSceneHeading } from '../nodes/scene-heading';

interface SceneHeadingComponentProps {
  node: {
    attrs: SceneHeadingAttrs;
  };
}

export default function SceneHeadingComponent({ node }: SceneHeadingComponentProps) {
  const { attrs } = node;
  const displayText = formatSceneHeading(attrs);

  return (
    <NodeViewWrapper className="scene-heading-wrapper">
      <div className="flex items-center gap-3 my-4">
        <MapPin className="w-5 h-5 text-[#C9A962] flex-shrink-0" />
        <div
          contentEditable={false}
          className="flex-1 font-['Noto_Sans_SC'] font-semibold text-base text-[#1A1A1A] bg-[#FAF7F0] px-4 py-3 border-l-4 border-[#C9A962] rounded"
        >
          {displayText}
        </div>
      </div>
      <NodeViewContent className="contents" />
    </NodeViewWrapper>
  );
}
```

**Step 3: Commit**

```bash
git add lib/editor/extensions/nodes/scene-heading.ts
git commit -m "feat(editor): add SceneHeading custom node extension"
```

---

### Task 5: 创建对话节点

**Files:**
- Create: `projects/scripter-nextjs/lib/editor/extensions/nodes/dialogue.ts`

**Step 1: Create Dialogue extension**

```typescript
/**
 * 对话节点
 * 格式：角色名：对话内容
 * 或：角色名（情绪）：对话内容
 * 或：角色名(OS)：内心独白
 */

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { DialogueAttrs } from '../../types';
import DialogueComponent from './dialogue-component';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    dialogue: {
      insertDialogue: (attrs: DialogueAttrs) => ReturnType;
    };
  }
}

export const Dialogue = Node.create<DialogueAttrs>({
  name: 'dialogue',

  group: 'block',

  content: 'paragraph*',

  defining: true,

  addAttributes() {
    return {
      character: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-character') || '',
        renderHTML: (attributes) => ({
          'data-character': attributes.character,
        }),
      },
      emotion: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-emotion'),
        renderHTML: (attributes) => {
          if (!attributes.emotion) return {};
          return { 'data-emotion': attributes.emotion };
        },
      },
      isOS: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-os') === 'true',
        renderHTML: (attributes) => ({
          'data-os': attributes.isOS,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="dialogue"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({
      'data-type': 'dialogue',
      class: 'dialogue',
    }, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DialogueComponent);
  },

  addCommands() {
    return {
      insertDialogue:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs,
            content: [{ type: 'paragraph' }],
          });
        },
    };
  },
});
```

**Step 2: Create React component**

```typescript
/**
 * 对话节点 React 组件
 */

import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { MessageSquare } from 'lucide-react';
import { DialogueAttrs } from '../nodes/dialogue';

interface DialogueComponentProps {
  node: {
    attrs: DialogueAttrs;
  };
}

export default function DialogueComponent({ node }: DialogueComponentProps) {
  const { character, emotion, isOS } = node.attrs;

  const formatCharacterName = () => {
    let name = character;
    if (emotion) {
      name += `(${emotion})`;
    }
    if (isOS) {
      name += '(OS)';
    }
    return name;
  };

  return (
    <NodeViewWrapper className="dialogue-wrapper">
      <div className="flex items-start gap-3 my-2 pl-6">
        <MessageSquare className="w-4 h-4 text-[#5C5548] mt-1 flex-shrink-0" />
        <div className="flex-1">
          <div
            contentEditable={false}
            className="font-['Courier_Prime'] font-semibold text-[18px] text-[#1A1A1A] mb-1"
          >
            {formatCharacterName()}：
          </div>
          <NodeViewContent className="dialogue-content" />
        </div>
      </div>
    </NodeViewWrapper>
  );
}
```

**Step 3: Commit**

```bash
git add lib/editor/extensions/nodes/dialogue.ts
git commit -m "feat(editor): add Dialogue custom node extension"
```

---

### Task 6: 创建动作描述节点

**Files:**
- Create: `projects/scripter-nextjs/lib/editor/extensions/nodes/action.ts`

**Step 1: Create Action extension**

```typescript
/**
 * 动作描述节点
 * 格式：△动作描述内容
 */

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ActionComponent from './action-component';

export const Action = Node.create({
  name: 'action',

  group: 'block',

  content: 'inline*',

  defining: true,

  parseHTML() {
    return [
      {
        tag: 'div[data-type="action"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({
      'data-type': 'action',
      class: 'action',
    }, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ActionComponent);
  },

  addCommands() {
    return {
      insertAction:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
          });
        },
    };
  },
});
```

**Step 2: Create React component**

```typescript
/**
 * 动作描述节点 React 组件
 */

import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { Triangle } from 'lucide-react';

export default function ActionComponent() {
  return (
    <NodeViewWrapper className="action-wrapper">
      <div className="flex items-start gap-2 my-2 pl-3">
        <Triangle className="w-3 h-3 text-[#C9A962] mt-1.5 flex-shrink-0 fill-current" />
        <div className="flex-1 font-['Noto_Sans_SC'] text-base text-[#5C5548] leading-relaxed">
          <NodeViewContent className="action-content" />
        </div>
      </div>
    </NodeViewWrapper>
  );
}
```

**Step 3: Commit**

```bash
git add lib/editor/extensions/nodes/action.ts
git commit -m "feat(editor): add Action custom node extension"
```

---

### Task 7: 创建扩展导出文件

**Files:**
- Create: `projects/scripter-nextjs/lib/editor/extensions/index.ts`

**Step 1: Create the extensions index file**

```typescript
/**
 * 编辑器扩展导出
 * 集成所有自定义节点和扩展
 */

import { SceneHeading } from './nodes/scene-heading';
import { Dialogue } from './nodes/dialogue';
import { Action } from './nodes/action';

export const scriptEditorExtensions = [
  SceneHeading,
  Dialogue,
  Action,
];

// 导出各个扩展以便单独使用
export { SceneHeading } from './nodes/scene-heading';
export { Dialogue } from './nodes/dialogue';
export { Action } from './nodes/action';
```

**Step 2: Commit**

```bash
git add lib/editor/extensions/index.ts
git commit -m "feat(editor): add extensions index file"
```

---

### Task 8: 更新编辑器组件使用自定义节点

**Files:**
- Modify: `projects/scripter-nextjs/components/editor/script-editor.tsx`

**Step 1: Update script-editor to use custom nodes**

```typescript
// 在文件顶部添加导入
import { scriptEditorExtensions } from '@/lib/editor/extensions';

// 修改 editor 配置
const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: false,
      bulletList: false,
      orderedList: false,
      blockquote: false,
      codeBlock: false,
      horizontalRule: false,
    }),
    Placeholder.configure({
      placeholder: '开始创作你的剧本...',
    }),
    CharacterCount,
    ...scriptEditorExtensions, // 添加自定义节点
  ],
  // ... 其他配置保持不变
});
```

**Step 2: Commit**

```bash
git add components/editor/script-editor.tsx
git commit -m "feat(editor): integrate custom nodes into script editor"
```

---

## Phase 3: AI 集成

### Task 9: 创建气泡菜单组件

**Files:**
- Create: `projects/scripter-nextjs/components/editor/bubble-menu.tsx`

**Step 1: Create bubble menu component**

```typescript
'use client';

/**
 * AI 气泡菜单
 * 选中文字时显示，提供 AI 操作选项
 */

import { BubbleMenu as TiptapBubbleMenu } from '@tiptap/react';
import { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import { Sparkles, PenLine, RefreshCw, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

interface BubbleMenuProps {
  editor: Editor;
}

export default function BubbleMenu({ editor }: BubbleMenuProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!editor) {
    return null;
  }

  const handleAIOperation = async (operation: string) => {
    setIsProcessing(true);
    // TODO: 实现 AI 操作调用
    setTimeout(() => {
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <TiptapBubbleMenu
      editor={editor}
      tippyOptions={{
        duration: 200,
        placement: 'top',
      }}
      className="glass-card rounded-full px-3 py-2 flex items-center gap-2 shadow-lg border-[#C9A962]/30"
    >
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 h-8"
        onClick={() => handleAIOperation('polish')}
        disabled={isProcessing}
      >
        <Sparkles className={`w-4 h-4 text-[#C9A962] ${isProcessing ? 'animate-spin' : ''}`} />
        <span>AI 润色</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="gap-2 h-8"
        onClick={() => handleAIOperation('continue')}
        disabled={isProcessing}
      >
        <PenLine className="w-4 h-4 text-[#C9A962]" />
        <span>续写</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="gap-2 h-8"
        onClick={() => handleAIOperation('rewrite')}
        disabled={isProcessing}
      >
        <RefreshCw className="w-4 h-4 text-[#C9A962]" />
        <span>改写</span>
      </Button>

      <div className="w-px h-4 bg-[#D3C9B0]" />

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        disabled={isProcessing}
      >
        <MoreHorizontal className="w-4 h-4 text-[#C9A962]" />
      </Button>
    </TiptapBubbleMenu>
  );
}
```

**Step 2: Add bubble menu to script editor**

Modify `components/editor/script-editor.tsx`:

```typescript
import BubbleMenu from './bubble-menu';

// 在编辑器内容中添加
return (
  <div className="flex flex-col h-full bg-white">
    <EditorToolbar editor={editor} onSave={onSave} />

    <div className="flex-1 overflow-y-auto relative">
      <BubbleMenu editor={editor} />
      <EditorContent editor={editor} />
    </div>

    <StatusBar editor={editor} />
  </div>
);
```

**Step 3: Commit**

```bash
git add components/editor/bubble-menu.tsx components/editor/script-editor.tsx
git commit -m "feat(editor): add AI bubble menu for text selection"
```

---

### Task 10: 创建 AI 集成服务

**Files:**
- Create: `projects/scripter-nextjs/lib/editor/ai-service.ts`

**Step 1: Create AI service**

```typescript
/**
 * 编辑器 AI 服务
 * 连接编辑器与 AI 系统
 */

import { Editor } from '@tiptap/react';
import { AIOperationType, EditorContext, Selection } from './types';
import { ContextCollector } from './context-collector';

export interface AIOperationResult {
  success: boolean;
  content?: string;
  error?: string;
}

export class EditorAIService {
  private contextCollector: ContextCollector;

  constructor() {
    this.contextCollector = new ContextCollector({
      windowSize: 500,
      includeSceneInfo: true,
      includeCharacterInfo: true,
    });
  }

  /**
   * 执行 AI 操作
   */
  async executeAIOperation(
    editor: Editor,
    operationType: AIOperationType,
    selection: Selection
  ): Promise<AIOperationResult> {
    // 收集上下文
    const context = this.collectContext(editor, selection);

    // 准备 AI 请求
    const request = this.prepareRequest(operationType, selection.text, context);

    try {
      // 调用 AI 系统
      const response = await this.callAISystem(request);

      if (response.success && response.content) {
        // 应用结果到编辑器
        this.applyResult(editor, selection, response.content);
        return { success: true, content: response.content };
      }

      return { success: false, error: response.error || 'AI 操作失败' };
    } catch (error) {
      console.error('AI operation error:', error);
      return { success: false, error: 'AI 系统错误' };
    }
  }

  /**
   * 收集编辑器上下文
   */
  private collectContext(editor: Editor, selection: Selection): EditorContext {
    const text = editor.getText();
    const { from, to } = editor.state.selection;

    return this.contextCollector.collect({
      content: text,
      selection,
      cursorPosition: to,
    });
  }

  /**
   * 准备 AI 请求
   */
  private prepareRequest(
    operationType: AIOperationType,
    selectedText: string,
    context: EditorContext
  ): any {
    return {
      intent: operationType,
      content: selectedText,
      context: {
        beforeText: context.textBeforeCursor,
        afterText: context.textAfterCursor,
        sceneInfo: context.currentScene,
        characters: context.relatedCharacters,
      },
    };
  }

  /**
   * 调用 AI 系统
   */
  private async callAISystem(request: any): Promise<any> {
    // TODO: 与现有 AI 系统集成
    // 这里暂时返回模拟响应
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          content: 'AI 处理后的内容',
        });
      }, 1000);
    });
  }

  /**
   * 应用结果到编辑器
   */
  private applyResult(editor: Editor, selection: Selection, content: string): void {
    editor
      .chain()
      .focus()
      .deleteRange({ from: selection.start, to: selection.end })
      .insertContentAt(selection.start, content)
      .run();
  }
}

export const editorAIService = new EditorAIService();
```

**Step 2: Commit**

```bash
git add lib/editor/ai-service.ts
git commit -m "feat(editor): add AI integration service"
```

---

## Phase 4: 格式校验系统

### Task 11: 创建格式校验器

**Files:**
- Create: `projects/scripter-nextjs/lib/editor/format-validator.ts`

**Step 1: Create format validator**

```typescript
/**
 * 格式校验器
 * 检查剧本格式是否符合中文短剧剧本格式规范 v2.0
 */

import { FormatIssue, FormatIssueType, FormatValidationResult } from './types';

export class FormatValidator {
  /**
   * 校验剧本内容
   */
  validate(content: string): FormatValidationResult {
    const issues: FormatIssue[] = [];

    // 检查每一行
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineIssues = this.validateLine(line, index + 1);
      issues.push(...lineIssues);
    });

    // 计算格式符合率
    const score = this.calculateScore(issues, lines.length);

    return {
      issues,
      score,
      valid: score >= 90,
    };
  }

  /**
   * 校验单行
   */
  private validateLine(line: string, lineNumber: number): FormatIssue[] {
    const issues: FormatIssue[] = [];
    const trimmed = line.trim();

    if (!trimmed) {
      return issues;
    }

    // 场景标题检查
    if (trimmed.startsWith('**场')) {
      issues.push(...this.validateSceneHeading(trimmed, lineNumber));
    }
    // 对话检查
    else if (this.isDialogueLine(trimmed)) {
      issues.push(...this.validateDialogue(trimmed, lineNumber));
    }
    // 动作描述检查
    else if (trimmed.startsWith('△')) {
      issues.push(...this.validateAction(trimmed, lineNumber));
    }

    return issues;
  }

  /**
   * 校验场景标题
   */
  private validateSceneHeading(line: string, lineNumber: number): FormatIssue[] {
    const issues: FormatIssue[] = [];

    // 格式：**场X-Y 时间/内外 地点 主要人物：A、B**
    const pattern = /^\*\*场(\d+)-(\d+)\s+(日|夜|黄昏|清晨|傍晚|午夜)\/(内|外|内外)\s+([^\*]+?)\*\*$/;

    if (!pattern.test(line)) {
      issues.push({
        type: 'scene_heading_format',
        message: '场景标题格式不正确',
        line: lineNumber,
        column: 1,
        severity: 'error',
        suggestion: '正确格式：**场X-Y 时间/内外 地点**',
      });
    }

    return issues;
  }

  /**
   * 校验对话
   */
  private validateDialogue(line: string, lineNumber: number): FormatIssue[] {
    const issues: FormatIssue[] = [];

    // 检查冒号格式
    if (line.includes(':')) {
      issues.push({
        type: 'dialogue_colon',
        message: '使用了英文冒号',
        line: lineNumber,
        column: line.indexOf(':') + 1,
        severity: 'error',
        suggestion: '使用中文冒号（：）',
      });
    }

    // 检查 OS 格式
    const osPattern = /\(OS)\s*：/;
    const osPatternWrong = /\([Oo][Ss]\)\s*[:：]/;

    if (osPatternWrong.test(line)) {
      issues.push({
        type: 'os_format',
        message: 'OS 格式不规范',
        line: lineNumber,
        column: line.indexOf('('),
        severity: 'error',
        suggestion: '使用 (OS): 格式',
      });
    }

    return issues;
  }

  /**
   * 校验动作描述
   */
  private validateAction(line: string, lineNumber: number): FormatIssue[] {
    const issues: FormatIssue[] = [];

    // 检查 △ 后是否有空格
    if (line.startsWith('△ ')) {
      issues.push({
        type: 'action_prefix',
        message: '△ 后不应有空格',
        line: lineNumber,
        column: 2,
        severity: 'warning',
        suggestion: '删除 △ 后的空格',
      });
    }

    return issues;
  }

  /**
   * 判断是否为对话行
   */
  private isDialogueLine(line: string): boolean {
    // 包含中文冒号且不是特殊标记
    return line.includes('：') && !line.startsWith('【');
  }

  /**
   * 计算格式符合率
   */
  private calculateScore(issues: FormatIssue[], totalLines: number): number {
    if (totalLines === 0) return 100;

    const errorCount = issues.filter((i) => i.severity === 'error').length;
    const warningCount = issues.filter((i) => i.severity === 'warning').length;

    // 错误扣5分，警告扣2分
    const deduction = errorCount * 5 + warningCount * 2;
    const score = Math.max(0, 100 - deduction);

    return score;
  }
}

export const formatValidator = new FormatValidator();
```

**Step 2: Commit**

```bash
git add lib/editor/format-validator.ts
git commit -m "feat(editor): add format validator for script v2.0"
```

---

## Phase 5: 测试与优化

### Task 12: 添加基础测试

**Files:**
- Create: `projects/scripter-nextjs/lib/editor/__tests__/format-validator.test.ts`

**Step 1: Create format validator tests**

```typescript
/**
 * 格式校验器测试
 */

import { describe, it, expect } from 'vitest';
import { formatValidator } from '../format-validator';

describe('FormatValidator', () => {
  it('should validate correct scene heading', () => {
    const content = '**场1-1 日/内 客栈大堂 主要人物：风十三、柳如烟**';
    const result = formatValidator.validate(content);

    expect(result.valid).toBe(true);
    expect(result.score).toBe(100);
    expect(result.issues).toHaveLength(0);
  });

  it('should detect incorrect scene heading', () => {
    const content = '**场1-1 日内 客栈大堂**';
    const result = formatValidator.validate(content);

    expect(result.valid).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues[0].type).toBe('scene_heading_format');
  });

  it('should detect English colon in dialogue', () => {
    const content = '风十三:你好';
    const result = formatValidator.validate(content);

    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues[0].type).toBe('dialogue_colon');
  });

  it('should detect incorrect OS format', () => {
    const content = '风十三(os):你好';
    const result = formatValidator.validate(content);

    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues.some(i => i.type === 'os_format')).toBe(true);
  });

  it('should detect space after action prefix', () => {
    const content = '△ 风十三走进客栈';
    const result = formatValidator.validate(content);

    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues[0].type).toBe('action_prefix');
  });
});
```

**Step 2: Install vitest**

```bash
npm install -D vitest @vitest/ui
```

**Step 3: Add test script to package.json**

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

**Step 4: Run tests**

```bash
npm test
```

**Expected:** Tests should pass (or fail if there are issues to fix)

**Step 5: Commit**

```bash
git add lib/editor/__tests__/ package.json package-lock.json
git commit -m "test(editor): add format validator tests"
```

---

## 完成检查清单

在完成所有任务后，确保：

- [ ] TipTap 编辑器可以正常加载
- [ ] 工具栏按钮可以插入基础内容
- [ ] 状态栏显示正确的字数统计
- [ ] 气泡菜单在选中文字时显示
- [ ] 格式校验器能正确识别格式问题
- [ ] 所有测试通过
- [ ] 代码已提交到 git

---

## 后续扩展

以下功能可以在基础实现完成后添加：

1. **命令面板** - 输入 `/` 触发的命令选择器
2. **Markdown 导入/导出** - 与现有 v2.0 格式互转
3. **自动保存** - 本地 localStorage + 远程同步
4. **协作功能** - 多人实时编辑
5. **版本历史** - 时间轴回溯
6. **虚拟滚动** - 处理大型剧本

---

**文档版本**: 1.0
**最后更新**: 2026-01-23
**预计工期**: 3-5 天
