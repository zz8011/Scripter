"use client";

import { useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { WorldviewCard } from '@/components/ui-custom/WorldviewCard';
import { WorldviewFormDialog } from '@/components/ui-custom/WorldviewFormDialog';
import { Button } from '@/components/ui/button';
import { IconifyIcon } from '@/components/IconifyIcon';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useWorldviewStore } from '@/lib/stores/worldviewStore';
import { useProjectStore } from '@/lib/stores/projectStore';
import type { WorldviewItem } from '@/lib/types';

export default function WorldviewPage() {
  const { currentProject } = useProjectStore();
  const {
    items,
    categories,
    deleteItem,
    getItemsByProject,
    getItemsByCategory,
    getCategoriesByProject,
  } = useWorldviewStore();

  // 本地状态
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorldviewItem | null>(null);

  // 获取当前项目的所有分类
  const projectCategories = currentProject
    ? getCategoriesByProject(currentProject.id)
    : categories;

  // 获取当前项目的所有设定项
  const projectItems = currentProject
    ? getItemsByProject(currentProject.id)
    : items;

  // 按分类分组设定项
  const itemsByCategory: Record<string, WorldviewItem[]> = {};
  projectCategories.forEach((category) => {
    itemsByCategory[category.id] = getItemsByCategory(
      currentProject?.id || '',
      category.id
    );
  });

  // 处理创建设定项
  const handleCreateItem = () => {
    setEditingItem(null);
    if (!currentProject) {
      alert('请先选择一个项目');
      return;
    }
    setIsDialogOpen(true);
  };

  // 处理编辑设定项
  const handleEditItem = (item: WorldviewItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  // 处理删除设定项
  const handleDeleteItem = (item: WorldviewItem) => {
    if (confirm(`确定要删除设定"${item.title}"吗？`)) {
      deleteItem(item.id);
    }
  };

  // 统计信息
  const totalItems = projectItems.length;
  const totalCategories = projectCategories.length;

  return (
    <MainLayout
      header={
        <div className="flex items-center justify-between">
          <h1
            className="font-display font-bold text-lg"
            style={{ color: 'var(--ink-black)' }}
          >
            世界观 Worldview
          </h1>

          {/* 创建设定按钮 */}
          <Button
            onClick={handleCreateItem}
            disabled={!currentProject}
            className="gap-2"
            style={{
              backgroundColor: 'var(--brand-gold)',
              color: 'white',
            }}
          >
            <IconifyIcon icon="mdi:plus" className="text-lg" />
            创建设定
          </Button>
        </div>
      }
    >
      <div className="p-10">
        {/* 项目提示 */}
        {!currentProject && (
          <div
            className="flex flex-col items-center justify-center rounded-lg p-12"
            style={{
              backgroundColor: 'var(--paper-bg)',
              border: '1px dashed var(--brand-gold)',
            }}
          >
            <IconifyIcon
              icon="mdi:folder-open-outline"
              className="text-6xl mb-4"
              style={{ color: 'var(--brand-gold)' }}
            />
            <h2
              className="text-xl font-semibold mb-2"
              style={{ color: 'var(--ink-black)' }}
            >
              请先选择项目
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              选择一个项目后即可管理该项目的世界观设定
            </p>
          </div>
        )}

        {/* 设定列表 */}
        {currentProject && totalItems === 0 && (
          <div
            className="flex flex-col items-center justify-center rounded-lg p-12"
            style={{
              backgroundColor: 'var(--paper-bg)',
              border: '1px dashed var(--brand-gold)',
            }}
          >
            <IconifyIcon
              icon="mdi:book-open-variant"
              className="text-6xl mb-4"
              style={{ color: 'var(--brand-gold)' }}
            />
            <h2
              className="text-xl font-semibold mb-2"
              style={{ color: 'var(--ink-black)' }}
            >
              还没有世界观设定
            </h2>
            <p className="mb-4" style={{ color: 'var(--text-muted)' }}>
              点击右上角&ldquo;创建设定&rdquo;按钮开始构建你的世界
            </p>
          </div>
        )}

        {currentProject && totalItems > 0 && (
          <div className="space-y-8">
            {/* 统计信息 */}
            <div
              className="flex items-center gap-6 px-5 py-3 rounded-lg"
              style={{
                backgroundColor: 'var(--paper-bg)',
              }}
            >
              <div className="flex items-center gap-2">
                <IconifyIcon
                  icon="mdi:file-document-outline"
                  style={{ color: 'var(--brand-gold)' }}
                />
                <span style={{ color: 'var(--text-muted)' }}>
                  共 <strong style={{ color: 'var(--ink-black)' }}>{totalItems}</strong> 个设定
                </span>
              </div>
              <div className="flex items-center gap-2">
                <IconifyIcon
                  icon="mdi:folder-outline"
                  style={{ color: 'var(--brand-gold)' }}
                />
                <span style={{ color: 'var(--text-muted)' }}>
                  <strong style={{ color: 'var(--ink-black)' }}>{totalCategories}</strong> 个分类
                </span>
              </div>
            </div>

            {/* 按分类展示设定项 */}
            <Accordion type="multiple" className="space-y-4">
              {projectCategories.map((category) => {
                const categoryItems = itemsByCategory[category.id] || [];
                if (categoryItems.length === 0) return null;

                return (
                  <AccordionItem
                    key={category.id}
                    value={category.id}
                    className="rounded-lg border"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      borderColor: 'rgba(201, 169, 98, 0.2)',
                    }}
                  >
                    <AccordionTrigger className="px-5 hover:no-underline">
                      <div className="flex items-center gap-3">
                        {category.icon && (
                          <IconifyIcon
                            icon={category.icon}
                            className="text-xl"
                            style={{ color: 'var(--brand-gold)' }}
                          />
                        )}
                        <span
                          className="font-semibold"
                          style={{ color: 'var(--ink-black)' }}
                        >
                          {category.name}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded-md text-xs font-medium"
                          style={{
                            backgroundColor: 'var(--brand-gold-light)',
                            color: 'var(--ink-black)',
                          }}
                        >
                          {categoryItems.length}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-5">
                      <div
                        className="grid gap-4"
                        style={{
                          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        }}
                      >
                        {categoryItems.map((item) => (
                          <WorldviewCard
                            key={item.id}
                            item={item}
                            category={category}
                            onEdit={() => handleEditItem(item)}
                            onDelete={() => handleDeleteItem(item)}
                          />
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        )}
      </div>

      {/* 设定表单弹窗 */}
      {currentProject && (
        <WorldviewFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          item={editingItem}
          projectId={currentProject.id}
        />
      )}
    </MainLayout>
  );
}
