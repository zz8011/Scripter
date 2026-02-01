"use client";

import { useState, useMemo } from "react";
import { MainLayout } from "@/components/MainLayout";
import { SceneCard } from "@/components/SceneCard";
import { SceneFormDialog } from "@/components/SceneFormDialog";
import { SceneSortable } from "@/components/dnd/SceneSortable";
import { useSceneStore } from "@/lib/stores/sceneStore";
import { Button } from "@/components/ui/button";
import { IconifyIcon } from "@/components/IconifyIcon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Scene } from "@/lib/types";

/* ==================================================
   视图类型 View Type
   ================================================== */

type ViewMode = 'board' | 'list';

/* ==================================================
   场景页面组件 Scenes Page Component
   ================================================== */

export default function ScenesPage() {
  /* ==================================================
     状态管理 State Management
     ================================================== */

  const scenes = useSceneStore((state) => state.scenes);
  const addScene = useSceneStore((state) => state.addScene);
  const updateScene = useSceneStore((state) => state.updateScene);
  const deleteScene = useSceneStore((state) => state.deleteScene);
  const reorderScenes = useSceneStore((state) => state.reorderScenes);

  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [filterEpisode, setFilterEpisode] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<Scene['status'] | null>(null);
  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  /* ==================================================
     计算属性 Computed Properties
     ================================================== */

  // 获取所有集数（去重）
  const episodeNumbers = useMemo(() => {
    const episodes = new Set(scenes.map((scene) => scene.episodeNumber));
    return Array.from(episodes).sort((a, b) => a - b);
  }, [scenes]);

  // 筛选后的场景
  const filteredScenes = useMemo(() => {
    let filtered = [...scenes];

    if (filterEpisode !== null) {
      filtered = filtered.filter((scene) => scene.episodeNumber === filterEpisode);
    }

    if (filterStatus !== null) {
      filtered = filtered.filter((scene) => scene.status === filterStatus);
    }

    // 按集数和场景编号排序
    filtered.sort((a, b) => {
      if (a.episodeNumber !== b.episodeNumber) {
        return a.episodeNumber - b.episodeNumber;
      }
      return a.sceneNumber - b.sceneNumber;
    });

    return filtered;
  }, [scenes, filterEpisode, filterStatus]);

  // 按集数分组的场景（用于看板视图）
  const scenesByEpisode = useMemo(() => {
    const grouped: Record<number, Scene[]> = {};

    filteredScenes.forEach((scene) => {
      if (!grouped[scene.episodeNumber]) {
        grouped[scene.episodeNumber] = [];
      }
      grouped[scene.episodeNumber].push(scene);
    });

    return grouped;
  }, [filteredScenes]);

  /* ==================================================
     事件处理 Event Handlers
     ================================================== */

  const handleCreateScene = (sceneData: Omit<Scene, 'id'>) => {
    addScene(sceneData);
  };

  const handleUpdateScene = (sceneData: Omit<Scene, 'id'>) => {
    if (editingScene) {
      updateScene(editingScene.id, sceneData);
      setEditingScene(null);
    }
  };

  const handleEditScene = (scene: Scene) => {
    setEditingScene(scene);
    setIsDialogOpen(true);
  };

  const handleDeleteScene = (id: string) => {
    if (confirm('确定要删除这个场景吗？')) {
      deleteScene(id);
    }
  };

  const handleReorderScenes = (newScenes: { id: string }[]) => {
    // SceneSortable 返回的是泛型类型，需要转换
    reorderScenes(newScenes as Scene[]);
  };

  const openCreateDialog = () => {
    setEditingScene(null);
    setIsDialogOpen(true);
  };

  /* ==================================================
     渲染 Render
     ================================================== */

  return (
    <MainLayout
      header={
        <div className="flex items-center justify-between w-full">
          <h1 className="font-display font-bold text-lg" style={{ color: 'var(--ink-black)' }}>
            场景管理 Scenes
          </h1>

          {/* 操作按钮 */}
          <div className="flex items-center gap-3">
            {/* 视图切换 */}
            <div className="flex items-center gap-1 p-1 rounded-md bg-gray-100">
              <Button
                variant={viewMode === 'board' ? 'default' : 'ghost'}
                size="icon"
                className="h-7 w-7"
                onClick={() => setViewMode('board')}
              >
                <IconifyIcon icon="mdi:view-grid" className="text-base" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                className="h-7 w-7"
                onClick={() => setViewMode('list')}
              >
                <IconifyIcon icon="mdi:view-list" className="text-base" />
              </Button>
            </div>

            {/* 创建按钮 */}
            <Button
              onClick={openCreateDialog}
              className="bg-[var(--brand-gold)] hover:bg-[var(--brand-gold-dark)] text-white"
            >
              <IconifyIcon icon="mdi:plus" className="text-lg mr-1" />
              创建场景
            </Button>
          </div>
        </div>
      }
    >
      <div className="p-8">
        {/* 筛选栏 */}
        <div className="flex items-center gap-4 mb-6">
          {/* 按集数筛选 */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium whitespace-nowrap" style={{ color: 'var(--ink-secondary)' }}>
              按集数筛选:
            </label>
            <Select
              value={filterEpisode?.toString() || 'all'}
              onValueChange={(value) =>
                setFilterEpisode(value === 'all' ? null : parseInt(value))
              }
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="全部" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                {episodeNumbers.map((ep) => (
                  <SelectItem key={ep} value={ep.toString()}>
                    第 {ep} 集
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 按状态筛选 */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium whitespace-nowrap" style={{ color: 'var(--ink-secondary)' }}>
              按状态筛选:
            </label>
            <Select
              value={filterStatus || 'all'}
              onValueChange={(value) =>
                setFilterStatus(value === 'all' ? null : value as Scene['status'])
              }
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="全部" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="draft">草稿</SelectItem>
                <SelectItem value="in_progress">进行中</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 统计信息 */}
          <div className="ml-auto text-sm" style={{ color: 'var(--text-muted)' }}>
            共 {filteredScenes.length} 个场景
          </div>
        </div>

        {/* 场景列表 */}
        {filteredScenes.length === 0 ? (
          /* 空状态 */
          <div className="flex flex-col items-center justify-center py-20">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: 'var(--hover-bg)' }}
            >
              <IconifyIcon
                icon="mdi:filmstrip"
                className="text-5xl"
                style={{ color: 'var(--brand-gold)' }}
              />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2" style={{ color: 'var(--ink-black)' }}>
              暂无场景
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              创建你的第一个剧本场景开始创作
            </p>
            <Button
              onClick={openCreateDialog}
              className="bg-[var(--brand-gold)] hover:bg-[var(--brand-gold-dark)] text-white"
            >
              <IconifyIcon icon="mdi:plus" className="text-lg mr-1" />
              创建场景
            </Button>
          </div>
        ) : viewMode === 'board' ? (
          /* 看板视图 - 按集数分组 */
          <div className="space-y-8">
            {Object.entries(scenesByEpisode)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([episodeNumber, episodeScenes]) => (
                <div key={episodeNumber}>
                  {/* 集数标题 */}
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="font-display font-semibold text-xl" style={{ color: 'var(--ink-black)' }}>
                      第 {episodeNumber} 集
                    </h2>
                    <div className="h-px flex-1" style={{ backgroundColor: 'var(--border-color)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {episodeScenes.length} 个场景
                    </span>
                  </div>

                  {/* 场景卡片网格 */}
                  <SceneSortable<Scene>
                    items={episodeScenes}
                    onChange={handleReorderScenes}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    renderItem={(scene: Scene) => (
                      <div key={scene.id} className="group pl-8">
                        <SceneCard
                          scene={scene}
                          onEdit={handleEditScene}
                          onDelete={handleDeleteScene}
                        />
                      </div>
                    )}
                  />
                </div>
              ))}
          </div>
        ) : (
          /* 列表视图 - 拖拽排序 */
          <div className="max-w-4xl mx-auto">
            <SceneSortable<Scene>
              items={filteredScenes}
              onChange={handleReorderScenes}
              className="space-y-3"
              renderItem={(scene: Scene) => (
                <div key={scene.id} className="group pl-8">
                  <SceneCard
                    scene={scene}
                    onEdit={handleEditScene}
                    onDelete={handleDeleteScene}
                  />
                </div>
              )}
            />
          </div>
        )}

        {/* 场景表单弹窗 */}
        <SceneFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={editingScene ? handleUpdateScene : handleCreateScene}
          scene={editingScene || undefined}
          mode={editingScene ? 'edit' : 'create'}
        />
      </div>
    </MainLayout>
  );
}

