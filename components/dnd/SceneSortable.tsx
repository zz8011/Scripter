/* ==================================================
   场景拖拽排序组件 Scene Sortable Component
   Scene Sortable Component with dnd-kit
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

/* ==================================================
   类型定义 Type Definitions
   ================================================== */

interface SceneSortableProps<T> {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

/* ==================================================
   可排序项包装器 Sortable Item Wrapper
   ================================================== */

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

function SortableItem({ id, children, className }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        // 基础样式
        'relative',

        // 拖拽中样式
        isDragging && [
          'opacity-50',
          'scale-95',
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
      <div>{children}</div>
    </div>
  );
}

/* ==================================================
   场景可排序组件 Scene Sortable Component
   ================================================== */

export function SceneSortable<T extends { id: string }>({
  items,
  onChange,
  renderItem,
  className,
}: SceneSortableProps<T>) {
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
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      onChange(arrayMove(items, oldIndex, newIndex));
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
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={cn(className)}>
        {items.map((item, index) => (
          <SortableItem key={item.id} id={item.id}>
            {renderItem(item, index)}
          </SortableItem>
        ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
