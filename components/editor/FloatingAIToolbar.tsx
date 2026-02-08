/* ==================================================
   浮动 AI 工具栏组件
   Floating AI Toolbar Component
   ================================================== */

'use client';

import { BubbleMenu, Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import { IconifyIcon } from '@/components/IconifyIcon';
import { cn } from '@/lib/utils';

/* ==================================================
   类型定义 Type Definitions
   ================================================== */

export interface FloatingAIToolbarProps {
  editor: Editor | null;
  onPolish?: () => void;
  onExpand?: () => void;
  onFix?: () => void;
  isLoading?: boolean;
}

/* ==================================================
   浮动 AI 工具栏组件
   ================================================== */

export function FloatingAIToolbar({
  editor,
  onPolish,
  onExpand,
  onFix,
  isLoading = false,
}: FloatingAIToolbarProps) {
  if (!editor) {
    return null;
  }

  // 检查是否有选中的文本
  const hasSelection = !editor.state.selection.empty;

  // 获取选中的文本
  const selectedText = editor.state.doc.textBetween(
    editor.state.selection.from,
    editor.state.selection.to,
    ' '
  );

  // 检测选中文本的类型
  const getSelectionType = (): 'dialogue' | 'scene' | 'mixed' | null => {
    if (!hasSelection) return null;

    const { from, to } = editor.state.selection;
    let hasDialogue = false;
    let hasOther = false;

    editor.state.doc.nodesBetween(from, to, (node) => {
      if (node.type.name === 'dialogue') {
        hasDialogue = true;
      } else if (['sceneHeading', 'action', 'character'].includes(node.type.name)) {
        hasOther = true;
      }
    });

    if (hasDialogue && !hasOther) return 'dialogue';
    if (!hasDialogue && hasOther) return 'scene';
    if (hasDialogue && hasOther) return 'mixed';
    return null;
  };

  const selectionType = getSelectionType();

  // 根据选中类型决定显示哪些按钮
  const shouldShowPolish = selectionType === 'dialogue' || selectionType === 'mixed';
  const shouldShowExpand = selectionType === 'scene' || selectionType === 'mixed';
  const shouldShowFix = hasSelection;

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{
        duration: 100,
        placement: 'top',
        maxWidth: 'none',
      }}
      className={cn(
        'flex items-center gap-1 p-1',
        'rounded-lg shadow-lg border',
        'bg-white dark:bg-gray-900',
        'border-gray-200 dark:border-gray-700'
      )}
    >
      {/* 润色按钮 */}
      {shouldShowPolish && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onPolish}
          disabled={isLoading}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5',
            'hover:bg-gold-50 dark:hover:bg-gold-900/20',
            'transition-colors'
          )}
          title="润色对白 - 优化表达，保持人物性格"
        >
          <IconifyIcon
            icon={isLoading ? "lucide:loader-2" : "lucide:sparkles"}
            className={cn("text-base", isLoading && "animate-spin")}
            style={{ color: 'var(--brand-gold)' }}
          />
          <span className="text-sm font-medium">润色</span>
        </Button>
      )}

      {/* 扩展按钮 */}
      {shouldShowExpand && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onExpand}
          disabled={isLoading}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5',
            'hover:bg-blue-50 dark:hover:bg-blue-900/20',
            'transition-colors'
          )}
          title="扩展场景 - 增加动作、环境、情绪描写"
        >
          <IconifyIcon
            icon={isLoading ? "lucide:loader-2" : "lucide:file-plus"}
            className={cn("text-base", isLoading && "animate-spin")}
            style={{ color: 'var(--info-blue)' }}
          />
          <span className="text-sm font-medium">扩展</span>
        </Button>
      )}

      {/* 修复格式按钮 */}
      {shouldShowFix && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onFix}
          disabled={isLoading}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5',
            'hover:bg-green-50 dark:hover:bg-green-900/20',
            'transition-colors'
          )}
          title="修复格式 - 检查并修复剧本格式问题"
        >
          <IconifyIcon
            icon={isLoading ? "lucide:loader-2" : "lucide:wrench"}
            className={cn("text-base", isLoading && "animate-spin")}
            style={{ color: 'var(--success-green)' }}
          />
          <span className="text-sm font-medium">修复</span>
        </Button>
      )}

      {/* 分隔线 */}
      {hasSelection && (
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
      )}

      {/* 选中文本信息 */}
      {hasSelection && (
        <div className="px-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          已选中 {selectedText.length} 字
        </div>
      )}
    </BubbleMenu>
  );
}
