/* ==================================================
   人物状态管理 Store (Zustand)
   Character State Management Store
   ================================================== */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Character } from '@/lib/types';

/* ==================================================
   状态接口 State Interface
   ================================================== */

interface CharacterState {
  // 所有人物列表
  characters: Character[];

  // 当前选中的人物
  currentCharacter: Character | null;

  // 当前人物 ID
  currentCharacterId: string | null;

  /* ==================================================
     Actions - 人物操作
     ================================================== */

  // 设置当前人物
  setCurrentCharacter: (character: Character | null) => void;

  // 根据 ID 设置当前人物
  setCurrentCharacterById: (id: string) => void;

  // 添加新人物
  addCharacter: (character: Character) => void;

  // 更新人物
  updateCharacter: (id: string, updates: Partial<Character>) => void;

  // 删除人物
  deleteCharacter: (id: string) => void;

  // 获取人物
  getCharacter: (id: string) => Character | undefined;

  // 根据项目 ID 获取人物列表
  getCharactersByProject: (projectId: string) => Character[];
}

/* ==================================================
   Store 创建 Store Creation
   ================================================== */

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set, get) => ({
      // ========== 初始状态 Initial State ==========

      characters: [],
      currentCharacter: null,
      currentCharacterId: null,

      // ========== Actions ==========

      setCurrentCharacter: (character) => {
        set({
          currentCharacter: character,
          currentCharacterId: character?.id || null,
        });
      },

      setCurrentCharacterById: (id) => {
        const { characters } = get();
        const character = characters.find((c) => c.id === id);

        if (character) {
          set({
            currentCharacter: character,
            currentCharacterId: id,
          });
        }
      },

      addCharacter: (character) => {
        set((state) => ({
          characters: [...state.characters, character],
        }));
      },

      updateCharacter: (id, updates) => {
        set((state) => ({
          characters: state.characters.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
          currentCharacter:
            state.currentCharacter?.id === id
              ? { ...state.currentCharacter, ...updates }
              : state.currentCharacter,
        }));
      },

      deleteCharacter: (id) => {
        set((state) => ({
          characters: state.characters.filter((c) => c.id !== id),
          currentCharacter:
            state.currentCharacter?.id === id ? null : state.currentCharacter,
          currentCharacterId:
            state.currentCharacterId === id ? null : state.currentCharacterId,
        }));
      },

      getCharacter: (id) => {
        return get().characters.find((c) => c.id === id);
      },

      getCharactersByProject: (projectId) => {
        return get().characters.filter((c) => c.projectId === projectId);
      },
    }),
    {
      name: 'scripter-character-storage', // localStorage key

      // 选择要持久化的字段
      partialize: (state) => ({
        characters: state.characters,
        currentCharacterId: state.currentCharacterId,
      }),

      // 水合恢复后重新设置 currentCharacter
      onRehydrateStorage: () => (state) => {
        if (state && state.currentCharacterId) {
          const character = state.characters.find(
            (c) => c.id === state.currentCharacterId
          );
          state.currentCharacter = character || null;
        }
      },
    }
  )
);

/* ==================================================
   Selectors - 选择器（优化性能）
   ================================================== */

// 获取所有人物
export const selectAllCharacters = (state: CharacterState) => state.characters;

// 获取当前人物
export const selectCurrentCharacter = (state: CharacterState) =>
  state.currentCharacter;

// 获取人物数量
export const selectCharacterCount = (state: CharacterState) =>
  state.characters.length;
