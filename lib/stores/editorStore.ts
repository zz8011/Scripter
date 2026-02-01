/* ==================================================
   编辑器状态管理 Store (Zustand)
   Editor State Management Store
   ================================================== */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/* ==================================================
   类型定义 Type Definitions
   ================================================== */

// TipTap 内容类型（简化）
interface TipTapContent {
  type: string;
  content?: TipTapContent[];
  attrs?: Record<string, unknown>;
}

// 剧本元素类型
export type ScriptElement =
  | 'scene-heading'
  | 'character'
  | 'dialogue'
  | 'action'
  | 'parenthetical';

// 编辑器段落
export interface EditorParagraph {
  id: string;
  type: ScriptElement;
  content: string;
  order: number;
}

/* ==================================================
   状态接口 State Interface
   ================================================== */

interface EditorState {
  // 设置纯文本内容（直接设置，不标记脏）
  setPlainText: (text: string) => void;
  // TipTap JSON 内容
  content: TipTapContent | null;

  // 纯文本内容
  plainText: string;

  // 段落数组（用于拖拽排序）
  paragraphs: EditorParagraph[];

  // 统计信息
  wordCount: number;
  characterCount: number;
  sceneCount: number;
  dialogueCount: number;

  // 编辑器状态
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;

  /* ==================================================
     Actions - 内容操作
     ================================================== */

  // 更新 TipTap 内容
  updateContent: (content: TipTapContent) => void;

  // 更新纯文本
  updatePlainText: (text: string) => void;

  // 更新段落数组
  updateParagraphs: (paragraphs: EditorParagraph[]) => void;

  // 添加段落
  addParagraph: (paragraph: Omit<EditorParagraph, 'id'>) => void;

  // 删除段落
  deleteParagraph: (id: string) => void;

  // 更新段落
  updateParagraph: (id: string, updates: Partial<EditorParagraph>) => void;

  // 重新排序段落
  reorderParagraphs: (oldIndex: number, newIndex: number) => void;

  /* ==================================================
     Actions - 统计操作
     ================================================== */

  // 更新统计信息
  updateStats: () => void;

  // 重置统计
  resetStats: () => void;

  /* ==================================================
     Actions - 编辑器状态
     ================================================== */

  // 标记为脏（有未保存更改）
  markDirty: () => void;

  // 清除脏标记
  clearDirty: () => void;

  // 开始保存
  startSaving: () => void;

  // 完成保存

  // 重置编辑器
  resetEditor: () => void;
}

/* ==================================================
   工具函数 Utility Functions
   ================================================== */

// 生成唯一 ID
const generateId = () => `para-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// 从 TipTap JSON 提取段落数组
const extractParagraphs = (content: TipTapContent | null): EditorParagraph[] => {
  if (!content || !content.content) return [];

  return content.content.map((node, index) => ({
    id: generateId(),
    type: node.type as ScriptElement,
    content: node.content?.map((c: TipTapContent) => {
      // TipTap 文本节点格式
      return (c as unknown as { text?: string })?.text || '';
    }).join('') || '',
    order: index,
  }));
};

// 计算字数（中英文混合）
const countWords = (text: string): number => {
  // 移除空格
  const cleanText = text.replace(/\s/g, '');

  // 中文字符
  const chineseChars = cleanText.match(/[\u4e00-\u9fa5]/g);
  const chineseCount = chineseChars ? chineseChars.length : 0;

  // 英文单词
  const englishWords = text.match(/[a-zA-Z]+/g);
  const englishCount = englishWords ? englishWords.length : 0;

  return chineseCount + englishCount;
};

// 计算场景数
const countScenes = (paragraphs: EditorParagraph[]): number => {
  return paragraphs.filter((p) => p.type === 'scene-heading').length;
};

// 计算对白段落数
const countDialogues = (paragraphs: EditorParagraph[]): number => {
  return paragraphs.filter((p) => p.type === 'dialogue').length;
};

/* ==================================================
   Store 创建 Store Creation
   ================================================== */

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      // ========== 初始状态 Initial State ==========

      content: null,
      plainText: '',
      paragraphs: [],
      wordCount: 0,
      characterCount: 0,
      sceneCount: 0,
      dialogueCount: 0,
      isDirty: false,
      isSaving: false,
      lastSavedAt: null,

      // ========== Actions - 内容操作 ==========

      updateContent: (content) => {
        const paragraphs = extractParagraphs(content);
        const plainText = content
          ?.content?.map((node: unknown) => (node as { content?: Array<{ text?: string }> })?.content?.map((c) => c.text).join('')).join('\n') || '';

        set({
          content,
          paragraphs,
          plainText,
          isDirty: true,
        });

        // 自动更新统计
        get().updateStats();
      },

      updatePlainText: (plainText) => {
        set({ plainText, isDirty: true });
        get().updateStats();
      },

      updateParagraphs: (paragraphs) => {
        set({ paragraphs, isDirty: true });
      },

      addParagraph: (paragraph) => {
        const newParagraph: EditorParagraph = {
          ...paragraph,
          id: generateId(),
        };

        set((state) => ({
          paragraphs: [...state.paragraphs, newParagraph],
          isDirty: true,
        }));
      },

      deleteParagraph: (id) => {
        set((state) => ({
          paragraphs: state.paragraphs.filter((p) => p.id !== id),
          isDirty: true,
        }));

        get().updateStats();
      },

      updateParagraph: (id, updates) => {
        set((state) => ({
          paragraphs: state.paragraphs.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
          isDirty: true,
        }));
      },

      reorderParagraphs: (oldIndex, newIndex) => {
        set((state) => {
          const newParagraphs = [...state.paragraphs];
          const [removed] = newParagraphs.splice(oldIndex, 1);
          newParagraphs.splice(newIndex, 0, removed);

          // 更新顺序
          return {
            paragraphs: newParagraphs.map((p, index) => ({
              ...p,
              order: index,
            })),
            isDirty: true,
          };
        });
      },

      // ========== Actions - 统计操作 ==========

      updateStats: () => {
        const state = get();
        const wordCount = countWords(state.plainText);
        const characterCount = state.plainText.length;
        const sceneCount = countScenes(state.paragraphs);
        const dialogueCount = countDialogues(state.paragraphs);

        set({
          wordCount,
          characterCount,
          sceneCount,
          dialogueCount,
        });
      },

      resetStats: () => {
        set({
          wordCount: 0,
          characterCount: 0,
          sceneCount: 0,
          dialogueCount: 0,
        });
      },

      // ========== Actions - 编辑器状态 ==========

      markDirty: () => set({ isDirty: true }),

      clearDirty: () => set({ isDirty: false }),

      startSaving: () => set({ isSaving: true }),

      finishSaving: () => set({
        isSaving: false,
        lastSavedAt: new Date(),
        isDirty: false,
      }),

      setPlainText: (text) => {
        set({ plainText: text });
        get().updateStats();
      },

      resetEditor: () => set({
        content: null,
        plainText: '',
        paragraphs: [],
        wordCount: 0,
        characterCount: 0,
        sceneCount: 0,
        dialogueCount: 0,
        isDirty: false,
        isSaving: false,
        lastSavedAt: null,
      }),
    }),
    {
      name: 'scripter-editor-storage',

      // 只持久化必要的状态
      partialize: (state) => ({
        content: state.content,
        plainText: state.plainText,
        paragraphs: state.paragraphs,
      }),
    }
  )
);

/* ==================================================
   Selectors - 选择器（优化性能）
   ================================================== */

// 获取当前内容
export const selectEditorContent = (state: EditorState) => state.content;

// 获取段落数组
export const selectParagraphs = (state: EditorState) => state.paragraphs;

// 获取统计信息
export const selectEditorStats = (state: EditorState) => ({
  wordCount: state.wordCount,
  characterCount: state.characterCount,
  sceneCount: state.sceneCount,
  dialogueCount: state.dialogueCount,
});

// 是否有未保存的更改
export const selectIsDirty = (state: EditorState) => state.isDirty;

// 是否正在保存
export const selectIsSaving = (state: EditorState) => state.isSaving;

