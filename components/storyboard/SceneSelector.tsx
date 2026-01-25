/* ==================================================
   SceneSelector 场景选择器组件
   Scene Selector Component
   ================================================== */

"use client";

import React from 'react';
import { useSceneStore } from '@/lib/stores/sceneStore';
import { useStoryboardStore } from '@/lib/stores/storyboardStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IconifyIcon } from '@/components/IconifyIcon';

/* ==================================================
   Types 类型定义
   ================================================== */

interface SceneSelectorProps {
  projectId: string;
  onSceneChange?: (sceneId: string | null) => void;
}

/* ==================================================
   SceneSelector 场景选择器组件
   ================================================== */

export function SceneSelector({ projectId, onSceneChange }: SceneSelectorProps) {
  const { scenes } = useSceneStore();
  const { currentSceneId, setCurrentSceneId } = useStoryboardStore();

  // 获取当前项目的场景,按集数和场景编号排序
  const projectScenes = scenes
    .filter((scene) => scene.projectId === projectId)
    .sort((a, b) => {
      if (a.episodeNumber !== b.episodeNumber) {
        return a.episodeNumber - b.episodeNumber;
      }
      return a.sceneNumber - b.sceneNumber;
    });

  // 按集数分组
  const scenesByEpisode: Record<number, typeof projectScenes> = {};
  projectScenes.forEach((scene) => {
    if (!scenesByEpisode[scene.episodeNumber]) {
      scenesByEpisode[scene.episodeNumber] = [];
    }
    scenesByEpisode[scene.episodeNumber].push(scene);
  });

  // 处理场景选择
  const handleSceneChange = (sceneId: string) => {
    setCurrentSceneId(sceneId);
    onSceneChange?.(sceneId);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-stone-600">
        <IconifyIcon icon="mdi:filmstrip" className="h-5 w-5" />
        <span className="font-medium">选择场景:</span>
      </div>

      <Select
        value={currentSceneId || ''}
        onValueChange={handleSceneChange}
      >
        <SelectTrigger className="w-[300px]">
          <SelectValue placeholder="请选择要创建分镜的场景" />
        </SelectTrigger>
        <SelectContent>
          {projectScenes.length === 0 ? (
            <div className="p-4 text-center text-sm text-stone-400">
              暂无场景,请先创建场景
            </div>
          ) : (
            Object.entries(scenesByEpisode).map(([episodeNumber, episodeScenes]) => (
              <React.Fragment key={episodeNumber}>
                <div className="px-2 py-1.5 text-xs font-semibold text-stone-500 bg-stone-50">
                  第 {episodeNumber} 集
                </div>
                {episodeScenes.map((scene) => (
                  <SelectItem key={scene.id} value={scene.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">
                        第{scene.sceneNumber}场
                      </span>
                      {scene.title && (
                        <span className="text-stone-600">{scene.title}</span>
                      )}
                      {scene.location && (
                        <span className="text-xs text-stone-400">
                          · {scene.location}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </React.Fragment>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
