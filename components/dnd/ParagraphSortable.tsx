/* ==================================================
   段落拖拽排序组件 Paragraph Sortable Component
   Paragraph Sortable Component with dnd-kit
   ================================================== */

'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconifyIcon } from '@/components/IconifyIcon';
import { cn } from '@/lib/utils';
import type { EditorParagraph } from '@/lib/stores/editorStore';

/* ==================================================
   可排序段落 Sortable Paragraph
   ================================================== */

interface SortableParagraphProps {
  paragraph: EditorParagraph;
  children: React.ReactNode;
  className?: string;
}

function SortableParagraph({
  paragraph,
  children,
  className,
}: SortableParagraphProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: paragraph.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        // 埃础样式
        'group relative',
        'p-3 rounded-md',
        'border border-transparent',
        'hover:border-gray-200 dark:hover:border-gray-700',
        'transition-all',

        // 拖拽中样式
        isDragging && [
          'opacity-50',
          'scale-[0.98]',
          'shadow-lg',
        ],

        className
      )}
      {...attributes}
    >
      {/* 拖拽手柄 */}
      <div
        {...listeners}
        className={cn(
          // 布局
          'absolute left-2 top-1/2 -translate-y-1/2',
          'p-1.5 rounded-md',

          // 样式
          'cursor-grab active:cursor-grabbing',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          'opacity-0 group-hover:opacity-100',
          'transition-opacity'
        )}
      >
        <IconifyIcon
          icon="mdi:drag-vertical"
          className="text-lg"
          style={{ color: 'var(--text-muted)' }}
        />
      </div>

      {/* 内容 */}
      <div className="pl-8">{children}</div>
    </div>
  );
}

/* ==================================================
   段落可排序组件 Paragraph Sortable Component
   ================================================== */

interface ParagraphSortableProps {
  paragraphs: EditorParagraph[];
  onChange: (paragraphs: EditorParagraph[]) => void;
  renderParagraph: (paragraph: EditorParagraph) => React.ReactNode;
  className?: string;
}

export function ParagraphSortable({
  paragraphs,
  onChange,
  renderParagraph,
  className,
}: ParagraphSortableProps) {
  /* ==================================================
     传感器配置 Sensors Configuration
     ================================================== */

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 移动 8px 后才开始拖拽
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /* ==================================================
     拖拽处理 Drag Handling
     ================================================== */

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = paragraphs.findIndex((p) => p.id === active.id);
      const newIndex = paragraphs.findIndex((p) => p.id === over.id);

      // 更新顺序
      const reordered = arrayMove(paragraphs, oldIndex, newIndex).map(
        (p, index) => ({
          ...p,
          order: index,
        })
      );

      onChange(reordered);
    }
  }

  /* ==================================================
     渲染 Render
     ================================================== */

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={paragraphs.map((p) => p.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={cn(className)}>
        {paragraphs.map((paragraph) => (
          <SortableParagraph key={paragraph.id} paragraph={paragraph}>
            {renderParagraph(paragraph)}
          </SortableParagraph>
        ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
