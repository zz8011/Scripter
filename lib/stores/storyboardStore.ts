/* ==================================================
   分镜状态管理 Store (Zustand)
   Storyboard State Management Store
   ================================================== */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Storyboard } from '@/lib/types';

/* ==================================================
   扩展分镜类型 Extended Storyboard Types
   ================================================== */

// 分镜项（对应四栏表格的一行）
export interface StoryboardItem {
  id: string;
  sceneId: string;
  order: number; // 排序顺序
  sceneNumber: string; // 场景编号
  visualDescription: string; // 画面描述
  cameraMovement: string; // 运镜方式
  notes: string; // 备注
}

/* ==================================================
   状态接口 State Interface
   ================================================== */

interface StoryboardState {
  // 所有分镜项列表
  items: StoryboardItem[];

  // 当前选中的分镜项
  currentItem: StoryboardItem | null;

  // 当前场景 ID（用于筛选）
  currentSceneId: string | null;

  /* ==================================================
     Actions - CRUD 操作
     ================================================== */

  // 添加分镜项
  addItem: (item: Omit<StoryboardItem, 'id' | 'order'>) => void;

  // 更新分镜项
  updateItem: (id: string, updates: Partial<StoryboardItem>) => void;

  // 删除分镜项
  deleteItem: (id: string) => void;

  // 重新排序分镜项
  reorderItems: (items: StoryboardItem[]) => void;

  // 设置当前分镜项
  setCurrentItem: (item: StoryboardItem | null) => void;

  // 批量添加分镜项
  addItems: (items: StoryboardItem[]) => void;

  // 清空所有分镜项
  clearItems: () => void;

  /* ==================================================
     Actions - 场景关联
     ================================================== */

  // 设置当前场景 ID
  setCurrentSceneId: (sceneId: string | null) => void;

  // 根据场景 ID 获取分镜项
  getItemsByScene: (sceneId: string) => StoryboardItem[];

  // 删除场景的所有分镜项
  deleteItemsByScene: (sceneId: string) => void;

  /* ==================================================
     Actions - 运镜建议
     ================================================== */

  // 根据画面描述推荐运镜方式
  suggestCameraMovement: (visualDescription: string) => string[];
}

/* ==================================================
   运镜类型预设 Camera Movement Presets
   ================================================== */

export const CAMERA_MOVEMENTS = {
  推: {
    name: '推',
    description: '镜头逐渐靠近主体',
    keywords: ['特写', '强调', '情绪', '细节', '靠近'],
  },
  拉: {
    name: '拉',
    description: '镜头逐渐远离主体',
    keywords: ['全景', '环境', '远离', '展示', '宏观'],
  },
  摇: {
    name: '摇',
    description: '镜头固定位置转动',
    keywords: ['跟随', '扫视', '转动', '环顾', '摇摄'],
  },
  移: {
    name: '移',
    description: '镜头平行移动',
    keywords: ['平行', '横移', '跟随', '移动', '侧移'],
  },
  跟: {
    name: '跟',
    description: '镜头跟随主体移动',
    keywords: ['跟随', '追逐', '奔跑', '移动', '跟踪'],
  },
  升降: {
    name: '升降',
    description: '镜头垂直升降',
    keywords: ['上升', '下降', '俯瞰', '仰视', '升降'],
  },
  俯仰: {
    name: '俯仰',
    description: '镜头上下倾斜',
    keywords: ['俯视', '仰视', '高低', '角度', '倾斜'],
  },
  环绕: {
    name: '环绕',
    description: '镜头围绕主体旋转',
    keywords: ['环绕', '旋转', '环绕主体', '环绕拍摄'],
  },
  固定: {
    name: '固定',
    description: '镜头固定不动',
    keywords: ['固定', '静止', '稳定', '不动', '静态'],
  },
} as const;

export type CameraMovementType = keyof typeof CAMERA_MOVEMENTS;

/* ==================================================
   工具函数 Utility Functions
   ================================================== */

// 生成唯一 ID
const generateId = () => `storyboard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// 根据画面描述推荐运镜方式
const suggestCameraMovement = (visualDescription: string): string[] => {
  const suggestions: string[] = [];
  const description = visualDescription.toLowerCase();

  // 遍历所有运镜类型，匹配关键词
  for (const [key, movement] of Object.entries(CAMERA_MOVEMENTS)) {
    if (movement.keywords.some((keyword) => description.includes(keyword))) {
      suggestions.push(movement.name);
    }
  }

  // 如果没有匹配到，返回默认建议
  if (suggestions.length === 0) {
    return ['固定', '推'];
  }

  return suggestions;
};

/* ==================================================
   Store 创建 Store Creation
   ================================================== */

export const useStoryboardStore = create<StoryboardState>()(
  persist(
    (set, get) => ({
      // ========== 初始状态 Initial State ==========

      items: [],
      currentItem: null,
      currentSceneId: null,

      // ========== Actions - CRUD 操作 ==========

      addItem: (itemData) => {
        // 获取当前场景的最大 order 值
        const sceneItems = get().items.filter(
          (item) => item.sceneId === itemData.sceneId
        );
        const maxOrder = sceneItems.length > 0
          ? Math.max(...sceneItems.map((item) => item.order))
          : 0;

        const newItem: StoryboardItem = {
          ...itemData,
          id: generateId(),
          order: maxOrder + 1,
        };

        set((state) => ({
          items: [...state.items, newItem],
        }));
      },

      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
          currentItem:
            state.currentItem?.id === id
              ? { ...state.currentItem, ...updates }
              : state.currentItem,
        }));
      },

      deleteItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
          currentItem:
            state.currentItem?.id === id ? null : state.currentItem,
        }));
      },

      reorderItems: (items) => {
        set({ items });
      },

      setCurrentItem: (item) => {
        set({ currentItem: item });
      },

      addItems: (newItems) => {
        set((state) => ({
          items: [...state.items, ...newItems],
        }));
      },

      clearItems: () => {
        set({
          items: [],
          currentItem: null,
        });
      },

      // ========== Actions - 场景关联 ==========

      setCurrentSceneId: (sceneId) => {
        set({ currentSceneId: sceneId });
      },

      getItemsByScene: (sceneId) => {
        return get()
          .items.filter((item) => item.sceneId === sceneId)
          .sort((a, b) => a.order - b.order);
      },

      deleteItemsByScene: (sceneId) => {
        set((state) => ({
          items: state.items.filter((item) => item.sceneId !== sceneId),
          currentItem:
            state.currentItem?.sceneId === sceneId ? null : state.currentItem,
        }));
      },

      // ========== Actions - 运镜建议 ==========

      suggestCameraMovement: (visualDescription) => {
        return suggestCameraMovement(visualDescription);
      },
    }),
    {
      name: 'scripter-storyboard-storage',

      // 选择要持久化的字段
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
);

/* ==================================================
   Selectors - 选择器（优化性能）
   ================================================== */

// 获取当前场景的分镜项（按 order 排序）
export const selectCurrentSceneItems = (state: StoryboardState) => {
  if (!state.currentSceneId) return [];
  return state.items
    .filter((item) => item.sceneId === state.currentSceneId)
    .sort((a, b) => a.order - b.order);
};

// 获取分镜项总数
export const selectItemCount = (state: StoryboardState) => state.items.length;

// 获取当前分镜项
export const selectCurrentItem = (state: StoryboardState) => state.currentItem;

// 按场景分组分镜项
export const selectItemsByScene = (state: StoryboardState) => {
  const grouped: Record<string, StoryboardItem[]> = {};

  state.items.forEach((item) => {
    if (!grouped[item.sceneId]) {
      grouped[item.sceneId] = [];
    }
    grouped[item.sceneId].push(item);
  });

  // 对每个场景的分镜项按 order 排序
  Object.keys(grouped).forEach((sceneId) => {
    grouped[sceneId].sort((a, b) => a.order - b.order);
  });

  return grouped;
};
