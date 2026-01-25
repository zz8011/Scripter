/* ==================================================
   项目状态管理 Store (Zustand)
   Project State Management Store
   ================================================== */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project } from '@/lib/types';

/* ==================================================
   状态接口 State Interface
   ================================================== */

interface ProjectState {
  // 当前项目
  currentProject: Project | null;

  // 所有项目列表
  projects: Project[];

  // 当前项目 ID
  currentProjectId: string | null;

  /* ==================================================
     Actions - 项目操作
     ================================================== */

  // 设置当前项目
  setCurrentProject: (project: Project | null) => void;

  // 根据 ID 设置当前项目
  setCurrentProjectById: (id: string) => void;

  // 添加新项目
  addProject: (project: Project) => void;

  // 更新项目
  updateProject: (id: string, updates: Partial<Project>) => void;

  // 删除项目
  deleteProject: (id: string) => void;

  // 获取项目
  getProject: (id: string) => Project | undefined;
}

/* ==================================================
   Store 创建 Store Creation
   ================================================== */

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      // ========== 初始状态 Initial State ==========

      currentProject: null,
      projects: [],
      currentProjectId: null,

      // ========== Actions ==========

      setCurrentProject: (project) => {
        set({
          currentProject: project,
          currentProjectId: project?.id || null,
        });
      },

      setCurrentProjectById: (id) => {
        const { projects } = get();
        const project = projects.find((p) => p.id === id);

        if (project) {
          set({
            currentProject: project,
            currentProjectId: id,
          });
        }
      },

      addProject: (project) => {
        set((state) => ({
          projects: [...state.projects, project],
        }));
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
          ),
          currentProject:
            state.currentProject?.id === id
              ? { ...state.currentProject, ...updates, updatedAt: new Date() }
              : state.currentProject,
        }));
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          currentProject:
            state.currentProject?.id === id ? null : state.currentProject,
          currentProjectId:
            state.currentProjectId === id ? null : state.currentProjectId,
        }));
      },

      getProject: (id) => {
        return get().projects.find((p) => p.id === id);
      },
    }),
    {
      name: 'scripter-project-storage', // localStorage key

      // 选择要持久化的字段
      partialize: (state) => ({
        projects: state.projects,
        currentProjectId: state.currentProjectId,
      }),

      // 水合恢复后重新设置 currentProject
      onRehydrateStorage: () => (state) => {
        if (state && state.currentProjectId) {
          const project = state.projects.find(
            (p) => p.id === state.currentProjectId
          );
          state.currentProject = project || null;
        }
      },
    }
  )
);

/* ==================================================
   Selectors - 选择器（优化性能）
   ================================================== */

// 获取所有项目（按更新时间排序）
export const selectProjectsSorted = (state: ProjectState) =>
  state.projects.sort((a, b) =>
    b.updatedAt.getTime() - a.updatedAt.getTime()
  );

// 获取当前项目
export const selectCurrentProject = (state: ProjectState) =>
  state.currentProject;

// 获取项目数量
export const selectProjectCount = (state: ProjectState) =>
  state.projects.length;

// 获取总字数
export const selectTotalWordCount = (state: ProjectState) =>
  state.projects.reduce((sum, p) => sum + p.wordCount, 0);

// 获取总场景数
export const selectTotalSceneCount = (state: ProjectState) =>
  state.projects.reduce((sum, p) => sum + p.sceneCount, 0);

// 获取总人物数
export const selectTotalCharacterCount = (state: ProjectState) =>
  state.projects.reduce((sum, p) => sum + p.characterCount, 0);
