/* ==================================================
   Storyboard Page 分镜脚本页面
   ================================================== */

"use client";

import React from 'react';
import { MainLayout } from "@/components/MainLayout";
import { SceneSelector } from "@/components/storyboard/SceneSelector";
import { StoryboardTable } from "@/components/storyboard/StoryboardTable";
import { useProjectStore } from "@/lib/stores/projectStore";
import { useStoryboardStore } from "@/lib/stores/storyboardStore";
import { IconifyIcon } from "@/components/IconifyIcon";
import { Button } from "@/components/ui/button";

export default function StoryboardPage() {
  const { currentProject } = useProjectStore();
  const { currentSceneId } = useStoryboardStore();

  // 如果没有选择项目
  if (!currentProject) {
    return (
      <MainLayout
        header={
          <h1 className="font-display font-bold text-lg" style={{ color: 'var(--ink-black)' }}>
            分镜脚本 Storyboard
          </h1>
        }
      >
        <div className="p-10">
          <div className="flex flex-col items-center justify-center py-20">
            <IconifyIcon icon="mdi:filmstrip-off" className="h-16 w-16 text-stone-300 mb-4" />
            <h2 className="text-xl font-semibold text-stone-700 mb-2">
              请先选择一个项目
            </h2>
            <p className="text-stone-500">
              选择项目后即可开始创建分镜脚本
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      header={
        <h1 className="font-display font-bold text-lg" style={{ color: 'var(--ink-black)' }}>
          分镜脚本 Storyboard
        </h1>
      }
    >
      <div className="p-6 space-y-6">
        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-stone-200">
          <SceneSelector
            projectId={currentProject.id}
            onSceneChange={(sceneId) => {
              console.log('Selected scene:', sceneId);
            }}
          />

          {/* 操作按钮 */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <IconifyIcon icon="mdi:download" className="mr-2 h-4 w-4" />
              导出分镜
            </Button>
            <Button variant="outline" size="sm">
              <IconifyIcon icon="mdi:printer" className="mr-2 h-4 w-4" />
              打印
            </Button>
          </div>
        </div>

        {/* 分镜表格 */}
        {currentSceneId ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-stone-700">
                分镜列表
              </h2>
              <div className="text-sm text-stone-500">
                <IconifyIcon icon="mdi:information" className="inline h-4 w-4 mr-1" />
                拖拽行可调整顺序
              </div>
            </div>

            <StoryboardTable sceneId={currentSceneId} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-lg border-2 border-dashed border-stone-300">
            <IconifyIcon icon="mdi:filmstrip" className="h-16 w-16 text-stone-300 mb-4" />
            <h2 className="text-xl font-semibold text-stone-700 mb-2">
              请选择一个场景
            </h2>
            <p className="text-stone-500 mb-4">
              选择场景后即可开始创建分镜
            </p>
            <div className="text-sm text-stone-400 space-y-1">
              <p>💡 提示:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>分镜用于规划镜头画面和运镜方式</li>
                <li>支持拖拽排序调整分镜顺序</li>
                <li>系统会根据画面描述智能推荐运镜方式</li>
              </ul>
            </div>
          </div>
        )}

        {/* 快捷键提示 */}
        <div className="text-xs text-stone-400 text-center">
          <IconifyIcon icon="mdi:keyboard" className="inline h-3 w-3 mr-1" />
          拖拽分镜行可调整顺序 · 双击输入框快速编辑
        </div>
      </div>
    </MainLayout>
  );
}
