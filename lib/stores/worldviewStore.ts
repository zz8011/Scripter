/* ==================================================
   世界观状态管理 Store (Zustand)
   Worldview State Management Store
   ================================================== */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WorldviewItem, WorldviewCategory } from '@/lib/types';

/* ==================================================
   默认分类 Default Categories
   ================================================== */

const DEFAULT_CATEGORIES: WorldviewCategory[] = [
  {
    id: 'era',
    name: '时代背景',
    icon: 'mdi:clock-outline',
    description: '故事发生的时代、历史背景',
    isDefault: true,
    order: 1,
  },
  {
    id: 'geography',
    name: '地理环境',
    icon: 'mdi:earth',
    description: '世界观中的地理、地点、环境',
    isDefault: true,
    order: 2,
  },
  {
    id: 'social',
    name: '社会阶层',
    icon: 'mdi:account-group-outline',
    description: '社会结构、阶级体系',
    isDefault: true,
    order: 3,
  },
  {
    id: 'organization',
    name: '组织势力',
    icon: 'mdi:shield-outline',
    description: '各种组织、势力、派系',
    isDefault: true,
    order: 4,
  },
  {
    id: 'rules',
    name: '世界规则',
    icon: 'mdi:book-open-variant',
    description: '世界观的基本规则、设定',
    isDefault: true,
    order: 5,
  },
];

/* ==================================================
   状态接口 State Interface
   ================================================== */

interface WorldviewState {
  // 所有世界观设定项
  items: WorldviewItem[];

  // 所有分类
  categories: WorldviewCategory[];

  // 当前选中的分类
  selectedCategory: string | null;

  // 当前编辑的设定项
  currentItem: WorldviewItem | null;

  /* ==================================================
     Actions - 设定项操作
     ================================================== */

  // 添加设定项
  addItem: (item: Omit<WorldviewItem, 'id' | 'order' | 'createdAt' | 'updatedAt'>) => void;

  // 更新设定项
  updateItem: (id: string, updates: Partial<WorldviewItem>) => void;

  // 删除设定项
  deleteItem: (id: string) => void;

  // 设置当前编辑项
  setCurrentItem: (item: WorldviewItem | null) => void;

  /* ==================================================
     Actions - 分类操作
     ================================================== */

  // 添加分类
  addCategory: (category: Omit<WorldviewCategory, 'id' | 'order'>) => void;

  // 更新分类
  updateCategory: (id: string, updates: Partial<WorldviewCategory>) => void;

  // 删除分类（只能删除自定义分类）
  deleteCategory: (id: string) => void;

  // 设置当前选中的分类
  setSelectedCategory: (categoryId: string | null) => void;

  /* ==================================================
     Actions - 工具操作
     ================================================== */

  // 根据项目 ID 获取设定项
  getItemsByProject: (projectId: string) => WorldviewItem[];

  // 根据分类获取设定项
  getItemsByCategory: (projectId: string, category: string) => WorldviewItem[];

  // 根据项目 ID 获取分类
  getCategoriesByProject: (projectId: string) => WorldviewCategory[];

  // 清空所有数据
  clearAll: () => void;
}

/* ==================================================
   工具函数 Utility Functions
   ================================================== */

// 生成唯一 ID
const generateId = () => `worldview-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// 获取当前时间戳
const getCurrentTimestamp = () => new Date();

/* ==================================================
   Store 创建 Store Creation
   ================================================== */

export const useWorldviewStore = create<WorldviewState>()(
  persist(
    (set, get) => ({
      // ========== 初始状态 Initial State ==========

      items: [],
      categories: DEFAULT_CATEGORIES,
      selectedCategory: null,
      currentItem: null,

      // ========== Actions - 设定项操作 ==========

      addItem: (itemData) => {
        const { items } = get();

        // 获取该项目中该分类的最大 order 值
        const maxOrder = items
          .filter((item) => item.projectId === itemData.projectId && item.category === itemData.category)
          .reduce((max, item) => Math.max(max, item.order), 0);

        const newItem: WorldviewItem = {
          ...itemData,
          id: generateId(),
          order: maxOrder + 1,
          createdAt: getCurrentTimestamp(),
          updatedAt: getCurrentTimestamp(),
        };

        set((state) => ({
          items: [...state.items, newItem],
        }));
      },

      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, ...updates, updatedAt: getCurrentTimestamp() }
              : item
          ),
          currentItem:
            state.currentItem?.id === id
              ? { ...state.currentItem, ...updates, updatedAt: getCurrentTimestamp() }
              : state.currentItem,
        }));
      },

      deleteItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
          currentItem: state.currentItem?.id === id ? null : state.currentItem,
        }));
      },

      setCurrentItem: (item) => {
        set({ currentItem: item });
      },

      // ========== Actions - 分类操作 ==========

      addCategory: (categoryData) => {
        const { categories } = get();

        // 获取当前最大 order 值
        const maxOrder = categories.reduce((max, cat) => Math.max(max, cat.order), 0);

        const newCategory: WorldviewCategory = {
          ...categoryData,
          id: generateId(),
          order: maxOrder + 1,
        };

        set((state) => ({
          categories: [...state.categories, newCategory],
        }));
      },

      updateCategory: (id, updates) => {
        set((state) => ({
          categories: state.categories.map((cat) =>
            cat.id === id ? { ...cat, ...updates } : cat
          ),
        }));
      },

      deleteCategory: (id) => {
        const { categories, items } = get();
        const category = categories.find((cat) => cat.id === id);

        // 不允许删除默认分类
        if (category?.isDefault) {
          console.warn('Cannot delete default category');
          return;
        }

        // 检查是否有设定项使用该分类
        const hasItems = items.some((item) => item.category === id);
        if (hasItems) {
          console.warn('Cannot delete category with existing items');
          return;
        }

        set((state) => ({
          categories: state.categories.filter((cat) => cat.id !== id),
          selectedCategory: state.selectedCategory === id ? null : state.selectedCategory,
        }));
      },

      setSelectedCategory: (categoryId) => {
        set({ selectedCategory: categoryId });
      },

      // ========== Actions - 工具操作 ==========

      getItemsByProject: (projectId) => {
        return get().items
          .filter((item) => item.projectId === projectId)
          .sort((a, b) => a.order - b.order);
      },

      getItemsByCategory: (projectId, category) => {
        return get().items
          .filter((item) => item.projectId === projectId && item.category === category)
          .sort((a, b) => a.order - b.order);
      },

      getCategoriesByProject: (_projectId) => {
        // 返回所有分类（默认分类 + 用户自定义分类）
        // TODO: 未来可以支持项目级别的自定义分类
        return get().categories.sort((a, b) => a.order - b.order);
      },

      clearAll: () => {
        set({
          items: [],
          categories: DEFAULT_CATEGORIES,
          selectedCategory: null,
          currentItem: null,
        });
      },
    }),
    {
      name: 'scripter-worldview-storage',

      // 选择要持久化的字段
      partialize: (state) => ({
        items: state.items,
        categories: state.categories,
        selectedCategory: state.selectedCategory,
      }),
    }
  )
);

/* ==================================================
   Selectors - 选择器（优化性能）
   ================================================== */

// 获取所有设定项
export const selectAllItems = (state: WorldviewState) => state.items;

// 获取所有分类
export const selectAllCategories = (state: WorldviewState) => state.categories;

// 获取当前选中的分类
export const selectSelectedCategory = (state: WorldviewState) => state.selectedCategory;

// 获取当前编辑项
export const selectCurrentItem = (state: WorldviewState) => state.currentItem;

// 获取设定项总数
export const selectItemCount = (state: WorldviewState) => state.items.length;

// 按分类分组设定项
export const selectItemsByCategoryGrouped = (state: WorldviewState, projectId: string) => {
  const items = state.items.filter((item) => item.projectId === projectId);
  const grouped: Record<string, WorldviewItem[]> = {};

  items.forEach((item) => {
    if (!grouped[item.category]) {
      grouped[item.category] = [];
    }
    grouped[item.category].push(item);
  });

  return grouped;
};
