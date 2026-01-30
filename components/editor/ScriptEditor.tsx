/* ==================================================
   TipTap 剧本编辑器组件 Script Editor Component
   TipTap Script Editor Component
   ================================================== */

'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { cn } from '@/lib/utils';
import { IconifyIcon } from '@/components/IconifyIcon';
import { useCallback, useEffect, useState } from 'react';
import {
  SceneHeading,
  Character,
  Dialogue,
  Action,
  Parenthetical,
} from '@/lib/extensions/script-nodes';
import { validateScript, FormatError } from '@/lib/utils/script-validator';

/* ==================================================
   客户端检查 - 避免 SSR 警告
   ================================================== */

const useIsClient = () => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  return isClient;
};

/* ==================================================
   剧本元素类型 Script Element Types
   ================================================== */

export type ScriptElement =
  | 'scene-heading'
  | 'character'
  | 'dialogue'
  | 'action'
  | 'parenthetical';

interface ScriptEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  onValidationChange?: (errors: FormatError[], warnings: FormatError[]) => void;
  editable?: boolean;
  className?: string;
  showValidation?: boolean;
}

/* ==================================================
   工具栏按钮 Toolbar Button
   ================================================== */

interface ToolbarButtonProps {
  active?: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  shortcut?: string;
}

function ToolbarButton({
  active,
  onClick,
  icon,
  label,
  shortcut,
}: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        // 布局
        'flex flex-col items-center gap-1',
        'px-3 py-2 rounded-md',

        // 过渡动画
        'transition-all duration-200',

        // 样式
        active
          ? 'bg-gold-500 text-white'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800',
        !active && 'text-gray-700 dark:text-gray-300'
      )}
      title={`${label}${shortcut ? ` (${shortcut})` : ''}`}
    >
      <IconifyIcon icon={icon} className="text-lg" />
      <span className="text-xs">{label}</span>
    </button>
  );
}

/* ==================================================
   TipTap 编辑器 Script Editor Component
   ================================================== */

export function ScriptEditor({
  content = '',
  onChange,
  onValidationChange,
  editable = true,
  className,
  showValidation = true,
}: ScriptEditorProps) {
  // 客户端检查 - 避免 TipTap SSR 警告
  const isClient = useIsClient();

  /* ==================================================
     编辑器初始化 Editor Initialization
     ================================================== */

  // 格式检查状态
  const [formatErrors, setFormatErrors] = useState<FormatError[]>([]);
  const [formatWarnings, setFormatWarnings] = useState<FormatError[]>([]);

  // 只在客户端初始化编辑器
  const editor = useEditor({
    immediatelyRender: false, // 避免 SSR hydration 错误
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        codeBlock: false,
        paragraph: {
          HTMLAttributes: {
            class: 'script-paragraph',
          },
        },
      }),
      Placeholder.configure({
        placeholder: '开始创作你的剧本...',
      }),
      // 剧本格式扩展
      SceneHeading,
      Character,
      Dialogue,
      Action,
      Parenthetical,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());

      // 实时格式检查
      if (showValidation) {
        const result = validateScript(editor.state.doc);
        setFormatErrors(result.errors);
        setFormatWarnings(result.warnings);
        onValidationChange?.(result.errors, result.warnings);
      }
    },
    editorProps: {
      attributes: {
        class: cn(
          // 基础样式
          'prose prose-sm max-w-none',
          'focus:outline-none',
          'min-h-[500px]',
          'p-6',
          'font-editor',

          // 剧本格式样式
          'script-editor'
        ),
      },
    },
  });

  /* ==================================================
     格式切换函数 Format Toggling
     ================================================== */

  const setSceneHeading = useCallback(() => {
    editor?.chain().focus().setNode('sceneHeading').run();
  }, [editor]);

  const setCharacter = useCallback(() => {
    editor?.chain().focus().setNode('character').run();
  }, [editor]);

  const setDialogue = useCallback(() => {
    editor?.chain().focus().setNode('dialogue').run();
  }, [editor]);

  const setAction = useCallback(() => {
    editor?.chain().focus().setNode('action').run();
  }, [editor]);

  const setParenthetical = useCallback(() => {
    editor?.chain().focus().setNode('parenthetical').run();
  }, [editor]);

  /* ==================================================
     键盘快捷键 Keyboard Shortcuts
     ================================================== */

  useEffect(() => {
    if (!editor || !editable) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Tab 键切换格式（循环切换）
      if (event.key === 'Tab') {
        event.preventDefault();

        const currentType = editor.state.doc.nodeAt(editor.state.selection.from)?.type.name;

        // 格式切换顺序：动作 -> 场景 -> 人物 -> 对白 -> 括号说明 -> 动作
        switch (currentType) {
          case 'action':
          case 'paragraph':
            setSceneHeading();
            break;
          case 'sceneHeading':
            setCharacter();
            break;
          case 'character':
            setDialogue();
            break;
          case 'dialogue':
            setParenthetical();
            break;
          case 'parenthetical':
            setAction();
            break;
          default:
            setAction();
        }
      }

      // Ctrl/Cmd + S 保存
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent('script-save'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor, editable, setSceneHeading, setCharacter, setDialogue, setAction, setParenthetical]);

  /* ==================================================
     渲染 Render
     ================================================== */

  if (!editor) {
    return null;
  }

  // 获取当前激活的节点类型
  const activeNodeType = editor.state.doc.nodeAt(editor.state.selection.from)?.type.name;

  // 客户端检查 - 避免 SSR 问题
  if (!isClient) {
    return (
      <div className={cn('flex items-center justify-center', className)} style={{ minHeight: '500px' }}>
        <div className="text-center" style={{ color: 'var(--text-muted)' }}>
          <IconifyIcon icon="mdi:loading" className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>编辑器加载中...</p>
        </div>
      </div>
    );
  }

  if (!editor) {
    return null;
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {/* 工具栏 */}
      {editable && (
        <div
          className={cn(
            // 布局
            'flex items-center gap-1',
            'px-4 py-3',
            'border-b',

            // 样式
            'bg-white dark:bg-gray-900',
            'border-gray-200 dark:border-gray-700'
          )}
        >
          <ToolbarButton
            active={activeNodeType === 'sceneHeading'}
            onClick={setSceneHeading}
            icon="mdi:format-header-1"
            label="场景"
            shortcut="Tab"
          />
          <ToolbarButton
            active={activeNodeType === 'character'}
            onClick={setCharacter}
            icon="mdi:account"
            label="人物"
            shortcut="Ctrl+Alt+C"
          />
          <ToolbarButton
            active={activeNodeType === 'dialogue'}
            onClick={setDialogue}
            icon="mdi:format-align-center"
            label="对白"
            shortcut="Ctrl+Alt+D"
          />
          <ToolbarButton
            active={activeNodeType === 'parenthetical'}
            onClick={setParenthetical}
            icon="mdi:subtitles"
            label="括号"
            shortcut="Ctrl+Alt+P"
          />
          <ToolbarButton
            active={activeNodeType === 'action' || activeNodeType === 'paragraph'}
            onClick={setAction}
            icon="mdi:format-align-left"
            label="动作"
            shortcut="Ctrl+Alt+A"
          />

          {/* 分隔线 */}
          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-2" />

          {/* 撤销/重做 */}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            icon="mdi:undo"
            label="撤销"
            shortcut="Ctrl+Z"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            icon="mdi:redo"
            label="重做"
            shortcut="Ctrl+Y"
          />

          {/* 分隔线 */}
          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-2" />

          {/* 格式状态指示器 */}
          {showValidation && (
            <div className="ml-auto flex items-center gap-2">
              {formatErrors.length > 0 && (
                <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-sm">
                  <IconifyIcon icon="mdi:alert-circle" className="text-base" />
                  <span>{formatErrors.length} 个错误</span>
                </div>
              )}
              {formatWarnings.length > 0 && formatErrors.length === 0 && (
                <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 text-sm">
                  <IconifyIcon icon="mdi:alert" className="text-base" />
                  <span>{formatWarnings.length} 个警告</span>
                </div>
              )}
              {formatErrors.length === 0 && formatWarnings.length === 0 && (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                  <IconifyIcon icon="mdi:check-circle" className="text-base" />
                  <span>格式正确</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 编辑器内容区 */}
      <div
        className={cn(
          // 基础样式
          'flex-1',
          'overflow-y-auto',
          'custom-scrollbar',

          // A4 纸张效果
          'bg-white dark:bg-gray-900'
        )}
      >
        <div className="max-w-3xl mx-auto py-8">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* 格式检查面板（底部） */}
      {showValidation && editable && (formatErrors.length > 0 || formatWarnings.length > 0) && (
        <div
          className={cn(
            // 布局
            'border-t',
            'px-4 py-3',
            'max-h-48 overflow-y-auto',

            // 样式
            'bg-gray-50 dark:bg-gray-900',
            'border-gray-200 dark:border-gray-700'
          )}
        >
          <div className="space-y-2">
            {formatErrors.map((error, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400"
              >
                <IconifyIcon icon="mdi:alert-circle" className="text-base mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium">{error.message}</div>
                  {error.suggestion && (
                    <div className="text-xs mt-1 opacity-80">建议：{error.suggestion}</div>
                  )}
                </div>
                {error.line > 0 && (
                  <div className="text-xs opacity-60">第 {error.line} 行</div>
                )}
              </div>
            ))}
            {formatWarnings.map((warning, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-sm text-yellow-600 dark:text-yellow-400"
              >
                <IconifyIcon icon="mdi:alert" className="text-base mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium">{warning.message}</div>
                  {warning.suggestion && (
                    <div className="text-xs mt-1 opacity-80">建议：{warning.suggestion}</div>
                  )}
                </div>
                {warning.line > 0 && (
                  <div className="text-xs opacity-60">第 {warning.line} 行</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
