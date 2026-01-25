/* ==================================================
   场景状态管理 Store (Zustand)
   Scene State Management Store
   ================================================== */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Scene } from '@/lib/types';

/* ==================================================
   状态接口 State Interface
   ================================================== */

interface SceneState {
  // 所有场景列表
  scenes: Scene[];

  // 当前选中的场景
  currentScene: Scene | null;

  // 筛选条件
  filterByEpisode: number | null; // 按集数筛选
  filterByStatus: Scene['status'] | null; // 按状态筛选

  /* ==================================================
     Actions - CRUD 操作
     ================================================== */

  // 添加场景
  addScene: (scene: Omit<Scene, 'id'>) => void;

  // 更新场景
  updateScene: (id: string, updates: Partial<Scene>) => void;

  // 删除场景
  deleteScene: (id: string) => void;

  // 重新排序场景
  reorderScenes: (scenes: Scene[]) => void;

  // 设置当前场景
  setCurrentScene: (scene: Scene | null) => void;

  // 批量添加场景
  addScenes: (scenes: Scene[]) => void;

  // 清空所有场景
  clearScenes: () => void;

  /* ==================================================
     Actions - 筛选操作
     ================================================== */

  // 按集数筛选
  setFilterByEpisode: (episodeNumber: number | null) => void;

  // 按状态筛选
  setFilterByStatus: (status: Scene['status'] | null) => void;

  // 清除筛选
  clearFilters: () => void;

  /* ==================================================
     Actions - 工具操作
     ================================================== */

  // 根据项目 ID 获取场景
  getScenesByProject: (projectId: string) => Scene[];

  // 根据集数获取场景
  getScenesByEpisode: (episodeNumber: number) => Scene[];
}

/* ==================================================
   工具函数 Utility Functions
   ================================================== */

// 生成唯一 ID
const generateId = () => `scene-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/* ==================================================
   Store 创建 Store Creation
   ================================================== */

export const useSceneStore = create<SceneState>()(
  persist(
    (set, get) => ({
      // ========== 初始状态 Initial State ==========

      scenes: [],
      currentScene: null,
      filterByEpisode: null,
      filterByStatus: null,

      // ========== Actions - CRUD 操作 ==========

      addScene: (sceneData) => {
        const newScene: Scene = {
          ...sceneData,
          id: generateId(),
        };

        set((state) => ({
          scenes: [...state.scenes, newScene],
        }));
      },

      updateScene: (id, updates) => {
        set((state) => ({
          scenes: state.scenes.map((scene) =>
            scene.id === id ? { ...scene, ...updates } : scene
          ),
          currentScene:
            state.currentScene?.id === id
              ? { ...state.currentScene, ...updates }
              : state.currentScene,
        }));
      },

      deleteScene: (id) => {
        set((state) => ({
          scenes: state.scenes.filter((scene) => scene.id !== id),
          currentScene:
            state.currentScene?.id === id ? null : state.currentScene,
        }));
      },

      reorderScenes: (scenes) => {
        set({ scenes });
      },

      setCurrentScene: (scene) => {
        set({ currentScene: scene });
      },

      addScenes: (newScenes) => {
        set((state) => ({
          scenes: [...state.scenes, ...newScenes],
        }));
      },

      clearScenes: () => {
        set({
          scenes: [],
          currentScene: null,
        });
      },

      // ========== Actions - 筛选操作 ==========

      setFilterByEpisode: (episodeNumber) => {
        set({ filterByEpisode: episodeNumber });
      },

      setFilterByStatus: (status) => {
        set({ filterByStatus: status });
      },

      clearFilters: () => {
        set({
          filterByEpisode: null,
          filterByStatus: null,
        });
      },

      // ========== Actions - 工具操作 ==========

      getScenesByProject: (projectId) => {
        return get().scenes.filter((scene) => scene.projectId === projectId);
      },

      getScenesByEpisode: (episodeNumber) => {
        return get().scenes.filter((scene) => scene.episodeNumber === episodeNumber);
      },
    }),
    {
      name: 'scripter-scene-storage',

      // 选择要持久化的字段
      partialize: (state) => ({
        scenes: state.scenes,
      }),
    }
  )
);

/* ==================================================
   Selectors - 选择器（优化性能）
   ================================================== */

// 获取所有场景（按集数和场景编号排序）
export const selectScenesSorted = (state: SceneState) =>
  [...state.scenes].sort((a, b) => {
    // 先按集数排序
    if (a.episodeNumber !== b.episodeNumber) {
      return a.episodeNumber - b.episodeNumber;
    }
    // 再按场景编号排序
    return a.sceneNumber - b.sceneNumber;
  });

// 获取筛选后的场景
export const selectFilteredScenes = (state: SceneState) => {
  let filtered = selectScenesSorted(state);

  if (state.filterByEpisode) {
    filtered = filtered.filter((scene) => scene.episodeNumber === state.filterByEpisode);
  }

  if (state.filterByStatus) {
    filtered = filtered.filter((scene) => scene.status === state.filterByStatus);
  }

  return filtered;
};

// 按集数分组场景
export const selectScenesByEpisode = (state: SceneState) => {
  const scenes = selectFilteredScenes(state);
  const grouped: Record<number, Scene[]> = {};

  scenes.forEach((scene) => {
    if (!grouped[scene.episodeNumber]) {
      grouped[scene.episodeNumber] = [];
    }
    grouped[scene.episodeNumber].push(scene);
  });

  return grouped;
};

// 按状态分组场景
export const selectScenesByStatus = (state: SceneState) => {
  const scenes = selectFilteredScenes(state);
  const grouped: Record<Scene['status'], Scene[]> = {
    draft: [],
    in_progress: [],
    completed: [],
  };

  scenes.forEach((scene) => {
    grouped[scene.status].push(scene);
  });

  return grouped;
};

// 获取场景总数
export const selectSceneCount = (state: SceneState) => state.scenes.length;

// 获取集数列表（去重）
export const selectEpisodeNumbers = (state: SceneState) => {
  const episodes = new Set(state.scenes.map((scene) => scene.episodeNumber));
  return Array.from(episodes).sort((a, b) => a - b);
};

// 获取当前场景
export const selectCurrentScene = (state: SceneState) => state.currentScene;
