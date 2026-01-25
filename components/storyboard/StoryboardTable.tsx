/* ==================================================
   StoryboardTable 分镜表格组件
   Storyboard Table Component
   ================================================== */

"use client";

import React, { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStoryboardStore, CAMERA_MOVEMENTS } from '@/lib/stores/storyboardStore';
import type { StoryboardItem } from '@/lib/stores/storyboardStore';

/* ==================================================
   Types 类型定义
   ================================================== */

interface StoryboardTableProps {
  sceneId: string;
}

/* ==================================================
   SortableRow 可排序行组件
   ================================================== */

interface SortableRowProps {
  item: StoryboardItem;
  index: number;
  onUpdate: (id: string, updates: Partial<StoryboardItem>) => void;
  onDelete: (id: string) => void;
  onSuggest: (description: string) => void;
}

function SortableRow({ item, index: _index, onUpdate, onDelete, onSuggest }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [localData, setLocalData] = useState({
    sceneNumber: item.sceneNumber,
    visualDescription: item.visualDescription,
    cameraMovement: item.cameraMovement,
    notes: item.notes,
  });

  // 处理输入变化
  const handleChange = (
    field: keyof typeof localData,
    value: string
  ) => {
    setLocalData((prev) => ({ ...prev, [field]: value }));
    onUpdate(item.id, { [field]: value });
  };

  // 画面描述变化时,建议运镜方式
  const handleVisualDescriptionChange = (value: string) => {
    setLocalData((prev) => ({ ...prev, visualDescription: value }));
    onUpdate(item.id, { visualDescription: value });

    // 如果运镜方式为空,自动建议
    if (!localData.cameraMovement && value.trim()) {
      onSuggest(value);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="grid grid-cols-12 gap-2 items-start p-3 bg-white/80 hover:bg-white/100 transition-colors border-b border-stone-200"
    >
      {/* 拖拽手柄 + 场景编号 */}
      <div className="col-span-2 flex items-center gap-2">
        <button
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-stone-100 rounded"
          {...attributes}
          {...listeners}
        >
          <IconifyIcon icon="mdi:dots-vertical" className="text-stone-400" />
        </button>
        <Input
          value={localData.sceneNumber}
          onChange={(e) => handleChange('sceneNumber', e.target.value)}
          placeholder="场景编号"
          className="font-mono text-sm"
        />
      </div>

      {/* 画面描述 */}
      <div className="col-span-4">
        <Textarea
          value={localData.visualDescription}
          onChange={(e) => handleVisualDescriptionChange(e.target.value)}
          placeholder="描述画面内容..."
          className="min-h-[60px] text-sm resize-none"
          rows={2}
        />
      </div>

      {/* 运镜方式 */}
      <div className="col-span-2">
        <Select
          value={localData.cameraMovement}
          onValueChange={(value) => handleChange('cameraMovement', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="选择运镜" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CAMERA_MOVEMENTS).map(([key, movement]) => (
              <SelectItem key={key} value={movement.name}>
                <div className="flex flex-col">
                  <span className="font-medium">{movement.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {movement.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 备注 */}
      <div className="col-span-3">
        <Textarea
          value={localData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="备注信息..."
          className="min-h-[60px] text-sm resize-none"
          rows={2}
        />
      </div>

      {/* 操作按钮 */}
      <div className="col-span-1 flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(item.id)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <IconifyIcon icon="mdi:delete" className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* ==================================================
   StoryboardTable 分镜表格主组件
   ================================================== */

export function StoryboardTable({ sceneId }: StoryboardTableProps) {
  const { items, updateItem, deleteItem, reorderItems, suggestCameraMovement } = useStoryboardStore();

  // 获取当前场景的分镜项
  const sceneItems = items
    .filter((item) => item.sceneId === sceneId)
    .sort((a, b) => a.order - b.order);

  // DnD 传感器配置
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 处理拖拽结束
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sceneItems.findIndex((item) => item.id === active.id);
      const newIndex = sceneItems.findIndex((item) => item.id === over.id);

      const reorderedItems = arrayMove(sceneItems, oldIndex, newIndex).map(
        (item, index) => ({
          ...item,
          order: index + 1,
        })
      );

      // 更新 store 中的所有分镜项
      const otherItems = items.filter((item) => item.sceneId !== sceneId);
      reorderItems([...otherItems, ...reorderedItems]);
    }
  };

  // 添加新行
  const handleAddRow = () => {
    const newItem: Omit<StoryboardItem, 'id' | 'order'> = {
      sceneId,
      sceneNumber: `${sceneItems.length + 1}`,
      visualDescription: '',
      cameraMovement: '',
      notes: '',
    };

    // 使用 store 的 addItem 方法
    useStoryboardStore.getState().addItem(newItem);
  };

  // 更新分镜项
  const handleUpdateItem = (id: string, updates: Partial<StoryboardItem>) => {
    updateItem(id, updates);
  };

  // 删除分镜项
  const handleDeleteItem = (id: string) => {
    if (confirm('确定要删除这个分镜项吗？')) {
      deleteItem(id);
    }
  };

  // 建议运镜方式
  const handleSuggestMovement = (description: string) => {
    const suggestions = suggestCameraMovement(description);
    if (suggestions.length > 0 && sceneItems.length > 0) {
      // 为最后一个分镜项设置建议的运镜方式
      const lastItem = sceneItems[sceneItems.length - 1];
      if (!lastItem.cameraMovement) {
        updateItem(lastItem.id, { cameraMovement: suggestions[0] });
      }
    }
  };

  return (
    <div className="w-full bg-white/50 backdrop-blur-sm rounded-lg border border-stone-200 overflow-hidden">
      {/* 表头 */}
      <div className="grid grid-cols-12 gap-2 items-center p-3 bg-stone-100/80 border-b border-stone-300 font-semibold text-sm text-stone-700">
        <div className="col-span-2 flex items-center gap-2">
          <span className="w-6" /> {/* 占位,对齐拖拽手柄 */}
          <span>场景编号</span>
        </div>
        <div className="col-span-4">画面描述</div>
        <div className="col-span-2">运镜</div>
        <div className="col-span-3">备注</div>
        <div className="col-span-1 text-right">操作</div>
      </div>

      {/* 分镜项列表 */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sceneItems.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {sceneItems.length === 0 ? (
            <div className="p-12 text-center text-stone-400">
              <IconifyIcon icon="mdi:filmstrip-off" className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>暂无分镜项</p>
              <p className="text-sm mt-1">点击下方按钮开始创建分镜</p>
            </div>
          ) : (
            sceneItems.map((item, index) => (
              <SortableRow
                key={item.id}
                item={item}
                index={index}
                onUpdate={handleUpdateItem}
                onDelete={handleDeleteItem}
                onSuggest={handleSuggestMovement}
              />
            ))
          )}
        </SortableContext>
      </DndContext>

      {/* 添加按钮 */}
      <div className="p-3 bg-stone-50/80 border-t border-stone-200">
        <Button
          onClick={handleAddRow}
          className="w-full"
          variant="outline"
        >
          <IconifyIcon icon="mdi:plus" className="mr-2 h-4 w-4" />
          添加分镜项
        </Button>
      </div>
    </div>
  );
}
