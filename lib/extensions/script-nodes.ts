/* ==================================================
   TipTap 剧本格式扩展
   Script Format Extensions for TipTap
   ================================================== */

import { Node, mergeAttributes } from '@tiptap/core';
import type { EditorCommands } from '@tiptap/react';

/* ==================================================
   扩展 TipTap 命令类型 Extend TipTap Commands
   ================================================== */

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    script: {
      setSceneHeading: () => ReturnType;
      setCharacter: () => ReturnType;
      setDialogue: () => ReturnType;
      setAction: () => ReturnType;
      setParenthetical: () => ReturnType;
    };
  }
}

/* ==================================================
   场景标题 Scene Heading
   ================================================== */

export const SceneHeading = Node.create({
  name: 'sceneHeading',

  group: 'block',

  content: 'inline*',

  defining: true,

  // 从键盘快捷键触发
  addKeyboardShortcuts() {
    return {
      'Mod-Alt-S': () => this.editor.commands.setSceneHeading(),
    };
  },

  // 解析 HTML
  parseHTML() {
    return [
      {
        tag: 'div[data-type="scene-heading"]',
      },
      {
        // 检测以"场景"开头或全大写的段落
        tag: 'p',
        getAttrs: (node) => {
          const html = (node as HTMLElement).innerHTML;
          const text = (node as HTMLElement).textContent || '';

          // 以"场景"开头
          if (text.trim().startsWith('场景')) {
            return {};
          }

          // 全大写且长度较短（可能是场景标题）
          if (text === text.toUpperCase() && text.length < 50 && text.length > 0) {
            return {};
          }

          return false;
        },
      },
    ];
  },

  // 渲染 HTML
  renderHTML({ node }) {
    return [
      'div',
      mergeAttributes({
        'data-type': 'scene-heading',
        class: 'script-scene-heading',
      }),
      0,
    ];
  },

  // 添加命令
  addCommands() {
    return {
      setSceneHeading: () => ({ commands }: any) => {
        return commands.setNode(this.name);
      },
    };
  },
});

/* ==================================================
   人物名称 Character
   ================================================== */

export const Character = Node.create({
  name: 'character',

  group: 'block',

  content: 'inline*',

  defining: true,

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-C': () => this.editor.commands.setCharacter(),
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="character"]',
      },
      {
        tag: 'p',
        getAttrs: (node) => {
          const text = (node as HTMLElement).textContent || '';

          // 居中对齐、全大写、无标点
          const style = (node as HTMLElement).getAttribute('style') || '';
          const isCentered = style.includes('text-align: center') ||
                           (node as HTMLElement).classList.contains('character');

          if (isCentered && text === text.toUpperCase() && text.length < 30) {
            // 检查是否包含标点（除了空格和横线）
            const hasPunctuation = /[.,;:!?]/.test(text);
            if (!hasPunctuation) {
              return {};
            }
          }

          return false;
        },
      },
    ];
  },

  renderHTML({ node }) {
    return [
      'div',
      mergeAttributes({
        'data-type': 'character',
        class: 'script-character',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setCharacter: () => ({ commands }: any) => {
        return commands.setNode(this.name);
      },
    };
  },
});

/* ==================================================
   对白 Dialogue
   ================================================== */

export const Dialogue = Node.create({
  name: 'dialogue',

  group: 'block',

  content: 'inline*',

  defining: true,

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-D': () => this.editor.commands.setDialogue(),
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="dialogue"]',
      },
    ];
  },

  renderHTML({ node }) {
    return [
      'div',
      mergeAttributes({
        'data-type': 'dialogue',
        class: 'script-dialogue',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setDialogue: () => ({ commands }: any) => {
        return commands.setNode(this.name);
      },
    };
  },
});

/* ==================================================
   动作描述 Action
   ================================================== */

export const Action = Node.create({
  name: 'action',

  group: 'block',

  content: 'inline*',

  defining: true,

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-A': () => this.editor.commands.setAction(),
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="action"]',
      },
      {
        tag: 'p',
        getAttrs: (node) => {
          // 默认普通段落为动作描述
          const text = (node as HTMLElement).textContent || '';

          // 排除其他类型
          if (text.trim().startsWith('场景') ||
              (text === text.toUpperCase() && text.length < 50)) {
            return false;
          }

          return {};
        },
      },
    ];
  },

  renderHTML({ node }) {
    return [
      'div',
      mergeAttributes({
        'data-type': 'action',
        class: 'script-action',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setAction: () => ({ commands }: any) => {
        return commands.setNode(this.name);
      },
    };
  },
});

/* ==================================================
   括号说明 Parenthetical
   ================================================== */

export const Parenthetical = Node.create({
  name: 'parenthetical',

  group: 'block',

  content: 'inline*',

  defining: true,

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-P': () => this.editor.commands.setParenthetical(),
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="parenthetical"]',
      },
      {
        tag: 'p',
        getAttrs: (node) => {
          const text = (node as HTMLElement).textContent || '';

          // 以括号开头和结尾
          if (text.trim().startsWith('(') && text.trim().endsWith(')')) {
            return {};
          }

          return false;
        },
      },
    ];
  },

  renderHTML({ node }) {
    return [
      'div',
      mergeAttributes({
        'data-type': 'parenthetical',
        class: 'script-parenthetical',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setParenthetical: () => ({ commands }: any) => {
        return commands.setNode(this.name);
      },
    };
  },
});
