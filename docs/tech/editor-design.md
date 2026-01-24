# 剧灵 Scripter - 编辑器技术设计

> TipTap 编辑器定制、双视图模式、键盘交互设计

---

## 文档导航

| 文档 | 说明 |
|------|------|
| [技术设计文档](tech-design.md) | 整体技术架构 |
| [导出系统设计](export-system.md) | 导出与防盗版 |
| [UI 设计系统](../design/ui-design-system.md) | 视觉设计规范 |

---

## 一、设计目标

### 1.1 核心体验

```
┌─────────────────────────────────────────────────────────────┐
│                    编辑器体验金字塔                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│           ╱───────────────╲                                 │
│          ╱  WYSIWYG       ╲    What You See Is What You Print │
│         ╱─────────────────╲                                  │
│                                                             │
│        ╱────────────────────────╲                           │
│       ╱   纸上打字体验            ╲  "像在纸上写字一样自然"    │
│      ╱────────────────────────────╲                         │
│                                                             │
│     ╱──────────────────────────────────╲                    │
│    ╱     专业剧本格式                    ╲                  │
│   ╱──────────────────────────────────────╲                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 关键需求

| 需求 | 描述 | 优先级 |
|------|------|--------|
| **所见即所得** | 屏幕显示与打印输出完全一致 | P0 |
| **A4 纸张布局** | 自动分页，显示页码 | P0 |
| **简单格式控制** | Tab/Enter/Backspace 即可完成所有格式切换 | P0 |
| **Fountain 兼容** | 编辑时遵循国际 Fountain 规范 | P0 |
| **中式视图可选** | 可切换到中式剧本视图（△符号） | P1 |
| **多行对白** | 支持连续对白，空行结束 | P1 |

---

## 二、TipTap 编辑器架构

### 2.1 自定义节点系统

```typescript
// lib/editor/extensions/nodes/index.ts
export const ScriptNodes = [
  SceneHeadingNode,
  ActionNode,
  CharacterNode,
  DialogueNode,
  ParentheticalNode,
  OSNode,          // 内心独白
  TransitionNode,  // 转场
  PageBreakNode,   // 分页符
]
```

### 2.2 场景标题节点 (SceneHeading)

```typescript
// lib/editor/extensions/nodes/scene-heading-node.ts
import { Node, mergeAttributes } from '@tiptap/core'

export const SceneHeadingNode = Node.create({
  name: 'sceneHeading',

  group: 'block',
  content: 'inline*',

  addAttributes() {
    return {
      number: {
        default: null,
        parseHTML: element => element.getAttribute('data-number'),
        renderHTML: attributes => {
          if (!attributes.number) return {}
          return { 'data-number': attributes.number }
        }
      },
      timeOfDay: {
        default: null,
        parseHTML: element => element.getAttribute('data-time'),
        renderHTML: attributes => {
          if (!attributes.timeOfDay) return {}
          return { 'data-time': attributes.timeOfDay }
        }
      },
      intExt: {
        default: null,
        parseHTML: element => element.getAttribute('data-intext'),
        renderHTML: attributes => {
          if (!attributes.intExt) return {}
          return { 'data-intext': attributes.intExt }
        }
      },
      location: {
        default: null,
        parseHTML: element => element.getAttribute('data-location'),
        renderHTML: attributes => {
          if (!attributes.location) return {}
          return { 'data-location': attributes.location }
        }
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'h2[data-type="scene-heading"]',
      },
      // Fountain 格式解析
      {
        tag: 'p',
        getAttrs: node => {
          const text = (node as HTMLElement).innerText
          // 检测是否为场景标题：全大写或以 内/外 开头
          const isSceneHeading = /^[A-Z\u4e00-\u9fa5]+$/.test(text) ||
                                 /^[内外表][\s·]/.test(text)
          return isSceneHeading ? { 'data-type': 'scene-heading' } : false
        }
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['h2', mergeAttributes({
      'data-type': 'scene-heading',
      class: 'text-lg font-bold uppercase tracking-wider'
    }, HTMLAttributes), 0]
  },

  addKeyboardShortcuts() {
    return {
      // Ctrl+1: 场景标题
      'Mod-1': () => this.editor.commands.setElementType('sceneHeading'),
    }
  }
})
```

### 2.3 动作描述节点 (Action)

```typescript
// lib/editor/extensions/nodes/action-node.ts
import { Node, mergeAttributes } from '@tiptap/core'

export const ActionNode = Node.create({
  name: 'action',

  group: 'block',
  content: 'inline*',

  parseHTML() {
    return [
      { tag: 'p[data-type="action"]' },
      // Fountain: 默认段落为动作描述
      { tag: 'p' }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['p', mergeAttributes({
      'data-type': 'action',
      class: 'text-left leading-relaxed'
    }, HTMLAttributes), 0]
  },

  addKeyboardShortcuts() {
    return {
      'Mod-2': () => this.editor.commands.setElementType('action'),
    }
  }
})
```

### 2.4 人物名节点 (Character)

```typescript
// lib/editor/extensions/nodes/character-node.ts
import { Node, mergeAttributes } from '@tiptap/core'

export const CharacterNode = Node.create({
  name: 'character',

  group: 'block',
  content: 'inline*',
  isolating: true,  // 确保人物名独立

  addAttributes() {
    return {
      name: {
        default: null,
        parseHTML: element => element.getAttribute('data-name'),
        renderHTML: attributes => {
          if (!attributes.name) return {}
          return { 'data-name': attributes.name }
        }
      }
    }
  },

  parseHTML() {
    return [
      { tag: 'p[data-type="character"]' },
      // Fountain: 居中的全大写文本
      {
        tag: 'p',
        getAttrs: node => {
          const element = node as HTMLElement
          const text = element.innerText
          const isCentered = element.style.textAlign === 'center'
          const isUppercase = /^[A-Z\u4e00-\u9fa5\s]+$/.test(text)
          return (isCentered || isUppercase) ? { 'data-type': 'character' } : false
        }
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['p', mergeAttributes({
      'data-type': 'character',
      class: 'text-center font-bold uppercase'
    }, HTMLAttributes), 0]
  },

  addKeyboardShortcuts() {
    return {
      'Mod-3': () => this.editor.commands.setElementType('character'),
    }
  }
})
```

### 2.5 对白节点 (Dialogue)

```typescript
// lib/editor/extensions/nodes/dialogue-node.ts
import { Node, mergeAttributes } from '@tiptap/core'

export const DialogueNode = Node.create({
  name: 'dialogue',

  group: 'block',
  content: 'inline*',

  addAttributes() {
    return {
      character: {
        default: null,
        parseHTML: element => element.getAttribute('data-character'),
        renderHTML: attributes => {
          if (!attributes.character) return {}
          return { 'data-character': attributes.character }
        }
      }
    }
  },

  parseHTML() {
    return [
      { tag: 'p[data-type="dialogue"]' },
      // Fountain: 缩进的段落
      {
        tag: 'p',
        getAttrs: node => {
          const element = node as HTMLElement
          const hasIndent = element.style.paddingLeft ||
                           element.style.marginLeft
          return hasIndent ? { 'data-type': 'dialogue' } : false
        }
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['p', mergeAttributes({
      'data-type': 'dialogue',
      class: 'text-center max-w-2xl mx-auto px-12'
    }, HTMLAttributes), 0]
  },

  addKeyboardShortcuts() {
    return {
      'Mod-4': () => this.editor.commands.setElementType('dialogue'),
    }
  }
})
```

### 2.6 内心独白节点 (OS)

```typescript
// lib/editor/extensions/nodes/os-node.ts
import { Node, mergeAttributes } from '@tiptap/core'

export const OSNode = Node.create({
  name: 'os',  // Inner Monologue / Off-Screen

  group: 'block',
  content: 'inline*',

  addAttributes() {
    return {
      character: {
        default: null,
      }
    }
  },

  parseHTML() {
    return [
      { tag: 'p[data-type="os"]' },
      // Fountain: (OS) 标记
      {
        tag: 'p',
        getAttrs: node => {
          const text = (node as HTMLElement).innerText
          return text.includes('(OS)') || text.includes('（OS）')
            ? { 'data-type': 'os' }
            : false
        }
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['p', mergeAttributes({
      'data-type': 'os',
      class: 'text-center max-w-2xl mx-auto px-12 italic text-gray-600'
    }, HTMLAttributes), 0]
  },

  addKeyboardShortcuts() {
    return {
      'Mod-5': () => this.editor.commands.setElementType('os'),
    }
  }
})
```

### 2.7 分页符节点 (PageBreak)

```typescript
// lib/editor/extensions/nodes/page-break-node.ts
import { Node, mergeAttributes } from '@tiptap/core'

export const PageBreakNode = Node.create({
  name: 'pageBreak',

  group: 'block',

  parseHTML() {
    return [
      { tag: 'div[data-type="page-break"]' },
      // Fountain: === 分页符
      {
        tag: 'p',
        getAttrs: node => {
          const text = (node as HTMLElement).innerText.trim()
          return text === '===' || text === '***'
            ? { 'data-type': 'page-break' }
            : false
        }
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({
      'data-type': 'page-break',
      class: 'page-break my-8 border-t-2 border-dashed border-gray-300'
    }), [
      ['span', { class: 'text-xs text-gray-400' }, '分页符']
    ]]
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Enter': () => this.editor.commands.insertContent({
        type: 'pageBreak'
      }),
    }
  }
})
```

---

## 三、键盘交互系统

### 3.1 Tab 导航

```typescript
// lib/editor/extensions/tab-navigation.ts
import { Extension } from '@tiptap/core'

interface ElementFormat {
  name: string
  nextOnTab?: string
  prevOnTab?: string
}

const ELEMENT_FORMATS: Record<string, ElementFormat> = {
  'sceneHeading': {
    name: '场景标题',
    nextOnTab: 'action'
  },
  'action': {
    name: '动作描述',
    nextOnTab: 'character',
    prevOnTab: 'sceneHeading'
  },
  'character': {
    name: '人物名',
    nextOnTab: 'dialogue',
    prevOnTab: 'action'
  },
  'dialogue': {
    name: '对白',
    nextOnTab: 'character',
    prevOnTab: 'action'
  },
  'os': {
    name: '内心独白',
    nextOnTab: 'character',
    prevOnTab: 'action'
  }
}

export const TabNavigation = Extension.create({
  name: 'tabNavigation',

  addKeyboardShortcuts() {
    return {
      // Tab: 下一个格式
      'Tab': ({ editor }) => {
        const currentType = this.getCurrentElementType(editor.state)

        if (currentType && ELEMENT_FORMATS[currentType]?.nextOnTab) {
          const nextType = ELEMENT_FORMATS[currentType].nextOnTab
          return editor.commands.setElementType(nextType)
        }

        return false
      },

      // Shift+Tab: 上一个格式
      'Shift-Tab': ({ editor }) => {
        const currentType = this.getCurrentElementType(editor.state)

        if (currentType && ELEMENT_FORMATS[currentType]?.prevOnTab) {
          const prevType = ELEMENT_FORMATS[currentType].prevOnTab
          return editor.commands.setElementType(prevType)
        }

        return false
      }
    }
  },

  // 获取当前元素类型
  getCurrentElementType(state: any): string | null {
    const { $from } = state.selection
    const node = $from.parent
    return node.type.name || null
  }
})
```

### 3.2 智能 Enter 行为

```typescript
// lib/editor/extensions/smart-enter.ts
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'

export const SmartEnter = Extension.create({
  name: 'smartEnter',

  addProseMirrorPlugins() {
    const pluginKey = new PluginKey('smartEnter')

    return [
      new Plugin({
        key: pluginKey,
        props: {
          handleKeyDown: (view, event) => {
            if (event.key !== 'Enter') return false

            const { state, dispatch } = view
            const { $from } = state.selection

            const currentNode = $from.parent
            const currentType = currentNode.type.name
            const prevNode = $from.nodeBefore

            // 场景标题后 → 动作描述
            if (currentType === 'sceneHeading') {
              return this.dispatchAction(state, dispatch, 'insertAction')
            }

            // 动作描述后 → 动作描述（连续）
            if (currentType === 'action') {
              return this.dispatchAction(state, dispatch, 'insertAction')
            }

            // 人物名后 → 对白
            if (currentType === 'character') {
              return this.dispatchAction(state, dispatch, 'insertDialogue')
            }

            // 对白处理
            if (currentType === 'dialogue') {
              const isCurrentLineEmpty = currentNode.content.size === 0

              // 检查上一行是否也是对白（同一人物）
              const prevType = prevNode?.type.name
              const isPrevDialogue = prevType === 'dialogue'

              if (isPrevDialogue && !isCurrentLineEmpty) {
                // 连续对白：继续对白
                return this.dispatchAction(state, dispatch, 'continueDialogue')
              } else if (isCurrentLineEmpty) {
                // 空对白行：结束对白块，回到动作描述
                return this.dispatchAction(state, dispatch, 'endDialogueBlock')
              } else {
                // 新对白：正常插入
                return this.dispatchAction(state, dispatch, 'insertDialogue')
              }
            }

            // 默认行为
            return false
          }
        }
      })
    ]
  },

  dispatchAction(state: any, dispatch: any, action: string): boolean {
    const { tr } = state

    switch (action) {
      case 'insertAction':
        dispatch(tr.insertText('\n').setBlockType('action'))
        return true

      case 'insertDialogue':
        dispatch(tr.insertText('\n').setBlockType('dialogue'))
        return true

      case 'continueDialogue':
        dispatch(tr.insertText('\n'))
        return true

      case 'endDialogueBlock':
        // 插入两个换行：一个结束当前行，一个创建空动作行
        dispatch(tr.insertText('\n\n').setBlockType('action'))
        return true

      default:
        return false
    }
  }
})
```

### 3.3 Backspace 合并

```typescript
// lib/editor/extensions/smart-backspace.ts
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'

export const SmartBackspace = Extension.create({
  name: 'smartBackspace',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('smartBackspace'),
        props: {
          handleKeyDown: (view, event) => {
            if (event.key !== 'Backspace') return false

            const { state, dispatch } = view
            const { $from } = state.selection

            // 只有在行首才触发
            if ($from.parentOffset > 0) return false

            const currentNode = $from.parent
            const prevNode = $from.nodeBefore

            // 空对白行：删除并回到人物名
            if (currentNode.type.name === 'dialogue' && currentNode.content.size === 0) {
              const { tr } = state
              dispatch(tr.delete($from.before($from.depth), $from.after($from.depth))
                       .setBlockType('character'))
              return true
            }

            // 空动作行：删除
            if (currentNode.type.name === 'action' && currentNode.content.size === 0) {
              const { tr } = state
              dispatch(tr.delete($from.before($from.depth), $from.after($from.depth)))
              return true
            }

            return false
          }
        }
      })
    ]
  }
})
```

---

## 四、双视图模式系统

### 4.1 视图模式定义

```typescript
// lib/editor/view-mode.ts
export enum ViewMode {
  EDIT = 'edit',                    // 编辑模式：Fountain 规范
  VIEW_CHINESE = 'view_chinese',     // 中式视图：中文短剧规范v2.0
  VIEW_PRINT = 'view_print'          // 打印预览：所见即所得
}

export interface ViewModeConfig {
  mode: ViewMode
  showLineNumbers: boolean
  showPageBreaks: boolean
  paperTexture: boolean
}
```

### 4.2 CSS 变量系统

```css
/* app/globals.css */

/* 编辑模式 - 无视觉符号 */
.view-mode-edit .action::before {
  display: none;
}

/* 中式视图 - 显示△符号 */
.view-mode-view_chinese .action::before {
  content: '△';
  color: #C9A962;
  margin-right: 0.5em;
  font-weight: bold;
}

/* 场景标题在中式视图中的样式 */
.view-mode-view_chinese .scene-heading {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

.view-mode-view_chinese .scene-heading::before {
  content: '场';
  background: #C9A962;
  color: white;
  padding: 0.125em 0.5em;
  border-radius: 0.25em;
  font-size: 0.75em;
}

/* 内心独白在中式视图中显示（OS）标记 */
.view-mode-view_chinese .os::after {
  content: '（OS）';
  color: #999;
  font-size: 0.875em;
  margin-left: 0.5em;
}
```

### 4.3 视图模式切换

```typescript
// components/editor/view-mode-toggle.tsx
'use client'

import { ViewMode } from '@/lib/editor/view-mode'
import { Eye, EyeOff, FileText } from 'lucide-react'

interface ViewModeToggleProps {
  currentMode: ViewMode
  onModeChange: (mode: ViewMode) => void
}

export function ViewModeToggle({ currentMode, onModeChange }: ViewModeToggleProps) {
  const modes = [
    { value: ViewMode.EDIT, label: '编辑', icon: FileText },
    { value: ViewMode.VIEW_CHINESE, label: '中式', icon: Eye },
    { value: ViewMode.VIEW_PRINT, label: '预览', icon: EyeOff },
  ]

  return (
    <div className="flex items-center gap-1 p-1 bg-white/60 rounded-lg backdrop-blur-sm">
      {modes.map(mode => {
        const Icon = mode.icon
        const isActive = currentMode === mode.value

        return (
          <button
            key={mode.value}
            onClick={() => onModeChange(mode.value)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium
              transition-all duration-200
              ${isActive
                ? 'bg-brand-gold text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            {mode.label}
          </button>
        )
      })}
    </div>
  )
}
```

### 4.4 编辑器容器组件

```typescript
// components/editor/script-editor-container.tsx
'use client'

import { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { ViewMode } from '@/lib/editor/view-mode'
import { ViewModeToggle } from './view-mode-toggle'

// 导入所有扩展
import StarterKit from '@tiptap/starter-kit'
import { SceneHeadingNode } from '@/lib/editor/extensions/nodes/scene-heading-node'
import { ActionNode } from '@/lib/editor/extensions/nodes/action-node'
import { CharacterNode } from '@/lib/editor/extensions/nodes/character-node'
import { DialogueNode } from '@/lib/editor/extensions/nodes/dialogue-node'
import { OSNode } from '@/lib/editor/extensions/nodes/os-node'
import { TabNavigation } from '@/lib/editor/extensions/tab-navigation'
import { SmartEnter } from '@/lib/editor/extensions/smart-enter'
import { SmartBackspace } from '@/lib/editor/extensions/smart-backspace'

export function ScriptEditorContainer() {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.EDIT)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,  // 禁用默认标题，使用自定义场景标题
        bulletList: false,
        orderedList: false,
        blockquote: false,
      }),
      SceneHeadingNode,
      ActionNode,
      CharacterNode,
      DialogueNode,
      OSNode,
      TabNavigation,
      SmartEnter,
      SmartBackspace,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: `
          prose prose-sm max-w-none focus:outline-none
          min-h-[800px] p-[74px]  // A4 页边距
          bg-white shadow-lg
          view-mode-${viewMode}
        `,
      },
    },
  })

  return (
    <div className="flex flex-col h-full">
      {/* 工具栏 */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
        <ViewModeToggle
          currentMode={viewMode}
          onModeChange={setViewMode}
        />

        {/* 格式快捷按钮 */}
        <div className="flex items-center gap-1">
          <FormatButton shortcut="⌘1" label="场景" onClick={() => editor?.commands.setElementType('sceneHeading')} />
          <FormatButton shortcut="⌘2" label="动作" onClick={() => editor?.commands.setElementType('action')} />
          <FormatButton shortcut="⌘3" label="人物" onClick={() => editor?.commands.setElementType('character')} />
          <FormatButton shortcut="⌘4" label="对白" onClick={() => editor?.commands.setElementType('dialogue')} />
          <FormatButton shortcut="⌘5" label="OS" onClick={() => editor?.commands.setElementType('os')} />
        </div>
      </div>

      {/* 编辑器 */}
      <div className="flex-1 overflow-auto bg-[#F5F1E8]">
        <div className="max-w-[210mm] mx-auto my-8">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}

function FormatButton({ shortcut, label, onClick }: { shortcut: string, label: string, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
      title={`快捷键: ${shortcut}`}
    >
      {label}
    </button>
  )
}
```

---

## 五、A4 纸张布局与分页

### 5.1 A4 容器样式

```css
/* app/globals.css */

/* A4 纸张尺寸: 210mm x 297mm */
.script-page {
  width: 210mm;
  min-height: 297mm;
  padding: 25.4mm 19.1mm;  /* 标准页边距 */
  background: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
}

/* 自动分页显示 */
.script-page::after {
  content: '';
  display: block;
  height: 1px;
  background: repeating-linear-gradient(
    to right,
    transparent,
    transparent 10mm,
    #e5e7eb 10mm,
    #e5e7eb 11mm
  );
  margin: 20mm 0;
}

/* 页码显示 */
.page-number {
  position: absolute;
  bottom: 12.7mm;
  right: 19.1mm;
  font-size: 12px;
  color: #9ca3af;
}

/* 纸张纹理（可选） */
.paper-texture {
  background-image: url('/textures/natural-paper.png');
  background-blend-mode: multiply;
}
```

### 5.2 动态分页组件

```typescript
// components/editor/pagination.tsx
'use client'

import { useEffect, useState } from 'react'
import { useEditor } from '@tiptap/react'

export function Pagination({ editor }: { editor: ReturnType<typeof useEditor>[0] }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (!editor) return

    // 计算内容高度，估算页数
    const calculatePages = () => {
      const content = editor.getText()
      const approximateLines = content.split('\n').length
      const linesPerPage = 25  // A4 纸大约每页 25-30 行
      setTotalPages(Math.ceil(approximateLines / linesPerPage))
    }

    const updatePage = () => {
      const scrollContainer = editor.view.dom.closest('.overflow-auto')
      if (!scrollContainer) return

      const scrollTop = scrollContainer.scrollTop
      const pageHeight = 297  // A4 高度 mm
      setCurrentPage(Math.floor(scrollTop / pageHeight) + 1)
    }

    editor.on('update', calculatePages)
    editor.on('selectionUpdate', updatePage)

    return () => {
      editor.off('update', calculatePages)
      editor.off('selectionUpdate', updatePage)
    }
  }, [editor])

  return (
    <div className="fixed bottom-4 right-4 px-3 py-1.5 bg-white/80 rounded-full text-sm text-gray-600 backdrop-blur-sm shadow-sm">
      第 {currentPage} / {totalPages} 页
    </div>
  )
}
```

---

## 六、Fountain 格式导入/导出

### 6.1 Fountain 解析器

```typescript
// lib/editor/fountain/parser.ts
export interface FountainLine {
  type: 'sceneHeading' | 'action' | 'character' | 'dialogue' | 'parenthetical' | 'transition' | 'pageBreak'
  content: string
  metadata?: Record<string, any>
}

export function parseFountain(text: string): FountainLine[] {
  const lines = text.split('\n')
  const result: FountainLine[] = []
  let currentCharacter: string | null = null

  for (const line of lines) {
    const trimmed = line.trim()

    // 空行
    if (!trimmed) {
      currentCharacter = null
      continue
    }

    // 场景标题：全大写或以 内/外 开头
    if (/^[A-Z\u4e00-\u9fa5\s\-·]+$/.test(trimmed) || /^[内外表]/.test(trimmed)) {
      result.push({ type: 'sceneHeading', content: trimmed })
      currentCharacter = null
      continue
    }

    // 人物名：全大写且较短
    if (/^[A-Z\u4e00-\u9fa5\s]+$/.test(trimmed) && trimmed.length < 30) {
      result.push({ type: 'character', content: trimmed })
      currentCharacter = trimmed
      continue
    }

    // 对白：缩进行
    if (line.startsWith('  ') || line.startsWith('\t')) {
      result.push({
        type: 'dialogue',
        content: trimmed,
        metadata: { character: currentCharacter }
      })
      continue
    }

    // 转场：全大写，以 TO: 结尾
    if (/^[A-Z\s]+:TO$/.test(trimmed) || /^CUT TO:/.test(trimmed)) {
      result.push({ type: 'transition', content: trimmed })
      continue
    }

    // 分页符
    if (trimmed === '===' || trimmed === '***') {
      result.push({ type: 'pageBreak', content: '' })
      continue
    }

    // 默认：动作描述
    result.push({ type: 'action', content: trimmed })
    currentCharacter = null
  }

  return result
}
```

### 6.2 Fountain 生成器

```typescript
// lib/editor/fountain/generator.ts
import { FountainLine } from './parser'

export function generateFountain(lines: FountainLine[]): string {
  const result: string[] = []

  for (const line of lines) {
    switch (line.type) {
      case 'sceneHeading':
        result.push(line.content.toUpperCase())
        break

      case 'character':
        result.push(`\n${line.content.toUpperCase()}\n`)
        break

      case 'dialogue':
        result.push(`    ${line.content}`)
        break

      case 'parenthetical':
        result.push(`  (${line.content})`)
        break

      case 'action':
        result.push(line.content)
        break

      case 'transition':
        result.push(`\n> ${line.content.toUpperCase()}`)
        break

      case 'pageBreak':
        result.push('\n===\n')
        break
    }
  }

  return result.join('\n')
}
```

### 6.3 导入/导出 API

```typescript
// app/api/scripts/import/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { parseFountain } from '@/lib/editor/fountain/parser'
import { generateFountain } from '@/lib/editor/fountain/generator'

export async function POST(request: NextRequest) {
  const { format, content } = await request.json()

  if (format === 'fountain') {
    // 导入 Fountain
    const lines = parseFountain(content)
    return NextResponse.json({ lines })
  }

  if (format === 'chinese') {
    // 导入中文短剧格式
    // TODO: 实现中文格式解析
    return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
  }

  return NextResponse.json({ error: 'Unknown format' }, { status: 400 })
}

export async function PUT(request: NextRequest) {
  const { format, lines } = await request.json()

  if (format === 'fountain') {
    // 导出为 Fountain
    const content = generateFountain(lines)
    return NextResponse.json({ content })
  }

  if (format === 'chinese') {
    // 导出为中文短剧格式
    // TODO: 实现中文格式生成
    return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
  }

  return NextResponse.json({ error: 'Unknown format' }, { status: 400 })
}
```

---

## 七、验收标准

### 7.1 编辑体验

- [ ] 用户可以像在纸上打字一样流畅编辑
- [ ] Tab/Enter/Backspace 操作符合直觉
- [ ] 所见即所得，打印效果与屏幕一致
- [ ] A4 纸张布局自动分页

### 7.2 格式兼容

- [ ] 编辑时遵循 Fountain 国际规范
- [ ] 可导入/导出 Fountain 格式文件
- [ ] 可切换到中式剧本视图（△符号）
- [ ] 导出时选择中文或 Fountain 格式

### 7.3 性能

- [ ] 编辑器加载时间 < 1s
- [ ] 输入响应延迟 < 50ms
- [ ] 大文档（100+ 场景）流畅滚动

---

**让灵感，在剧本中苏醒** ✨
