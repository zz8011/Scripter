/* ==================================================
   剧本导出工具函数
   Script Export Utilities
   ================================================== */

import { Scene } from '@/lib/api/scenes';
import { Project } from '@/lib/api/projects';

/* ==================================================
   类型定义
   ================================================== */

export interface ScriptElement {
  type: 'scene-heading' | 'character' | 'dialogue' | 'action' | 'parenthetical' | 'text';
  content: string;
}

export interface ExportOptions {
  includeTitlePage?: boolean;
  includeSceneNumbers?: boolean;
  pageSize?: 'A4' | 'US-Letter';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface TipTapNode extends Record<string, any> {
  type?: string;
  text?: string;
  content?: TipTapNode[];
}

/* ==================================================
   TipTap JSON 解析
   ================================================== */

/**
 * 从 TipTap JSON 中提取纯文本
 */
function extractTextFromNode(node: TipTapNode): string {
  if (!node) return '';
  
  if (node.type === 'text') {
    return node.text || '';
  }
  
  if (node.content && Array.isArray(node.content)) {
    return node.content.map(extractTextFromNode).join('');
  }
  
  return '';
}

/**
 * 解析 TipTap JSON 为剧本元素数组
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseTipTapContent(content: any): ScriptElement[] {
  const elements: ScriptElement[] = [];
  
  if (!content || !content.content || !Array.isArray(content.content)) {
    return elements;
  }
  
  for (const node of content.content as TipTapNode[]) {
    const text = extractTextFromNode(node);
    
    if (!text.trim()) continue;
    
    switch (node.type) {
      case 'sceneHeading':
        elements.push({ type: 'scene-heading', content: text });
        break;
      case 'character':
        elements.push({ type: 'character', content: text });
        break;
      case 'dialogue':
        elements.push({ type: 'dialogue', content: text });
        break;
      case 'parenthetical':
        elements.push({ type: 'parenthetical', content: text });
        break;
      case 'action':
      default:
        elements.push({ type: 'action', content: text });
        break;
    }
  }
  
  return elements;
}

/* ==================================================
   格式化函数
   ================================================== */

/**
 * 格式化剧本元素为 Fountain 格式
 */
function formatAsFountain(elements: ScriptElement[]): string {
  return elements.map(el => {
    switch (el.type) {
      case 'scene-heading':
        return `\n${el.content.toUpperCase()}\n`;
      case 'character':
        return `\n${el.content.toUpperCase()}`;
      case 'dialogue':
        return el.content;
      case 'parenthetical':
        return `(${el.content})`;
      case 'action':
      default:
        return `\n${el.content}`;
    }
  }).join('\n');
}

/**
 * 格式化剧本元素为纯文本
 */
function formatAsPlainText(elements: ScriptElement[]): string {
  return elements.map(el => el.content).join('\n\n');
}

/* ==================================================
   导出函数
   ================================================== */

/**
 * 导出剧本为 Fountain 格式
 */
export function exportToFountain(
  project: Project,
  scenes: Scene[],
  options: ExportOptions = {}
): string {
  const lines: string[] = [];
  
  // 标题页
  if (options.includeTitlePage !== false) {
    lines.push(`Title: ${project.title}`);
    if (project.description) {
      lines.push(`Description: ${project.description}`);
    }
    lines.push('');
  }
  
  // 场景内容
  for (const scene of scenes) {
    if (scene.content) {
      const elements = parseTipTapContent(scene.content);
      lines.push(formatAsFountain(elements));
    }
  }
  
  return lines.join('\n');
}

/**
 * 导出剧本为纯文本
 */
export function exportToPlainText(
  project: Project,
  scenes: Scene[],
  options: ExportOptions = {}
): string {
  const lines: string[] = [];
  
  // 标题
  if (options.includeTitlePage !== false) {
    lines.push(project.title);
    lines.push('='.repeat(project.title.length));
    lines.push('');
    if (project.description) {
      lines.push(project.description);
      lines.push('');
    }
  }
  
  // 场景内容
  for (const scene of scenes) {
    if (scene.content) {
      const elements = parseTipTapContent(scene.content);
      lines.push(formatAsPlainText(elements));
      lines.push('');
    }
  }
  
  return lines.join('\n');
}

/**
 * 导出剧本为 Markdown 格式
 */
export function exportToMarkdown(
  project: Project,
  scenes: Scene[],
  options: ExportOptions = {}
): string {
  const lines: string[] = [];
  
  // 标题页
  if (options.includeTitlePage !== false) {
    lines.push(`# ${project.title}`);
    lines.push('');
    if (project.description) {
      lines.push(project.description);
      lines.push('');
    }
  }
  
  // 场景内容
  let sceneNumber = 1;
  for (const scene of scenes) {
    if (scene.content) {
      const elements = parseTipTapContent(scene.content);
      
      if (options.includeSceneNumbers !== false) {
        lines.push(`## 场景 ${sceneNumber}`);
        lines.push('');
      }
      
      for (const el of elements) {
        switch (el.type) {
          case 'scene-heading':
            lines.push(`**${el.content}**`);
            break;
          case 'character':
            lines.push(`\n**${el.content}**`);
            break;
          case 'dialogue':
            lines.push(`> ${el.content}`);
            break;
          case 'parenthetical':
            lines.push(`*(${el.content})*`);
            break;
          case 'action':
          default:
            lines.push(el.content);
            break;
        }
      }
      lines.push('');
      sceneNumber++;
    }
  }
  
  return lines.join('\n');
}

/**
 * 导出剧本为 PDF（返回 HTML 用于打印）
 */
export function exportToPDF(
  project: Project,
  scenes: Scene[],
  options: ExportOptions = {}
): string {
  const lines: string[] = [];
  
  lines.push('<!DOCTYPE html>');
  lines.push('<html><head>');
  lines.push('<meta charset="UTF-8">');
  lines.push('<title>' + project.title + '</title>');
  lines.push('<style>');
  lines.push(`
    @page {
      size: ${options.pageSize === 'A4' ? 'A4' : 'letter'};
      margin: 1in;
    }
    body {
      font-family: 'Courier New', monospace;
      font-size: 12pt;
      line-height: 1.5;
      max-width: 6in;
      margin: 0 auto;
    }
    .scene-heading {
      text-transform: uppercase;
      margin: 1em 0;
    }
    .character {
      text-transform: uppercase;
      text-align: center;
      margin-top: 1em;
    }
    .dialogue {
      margin: 0 1in;
    }
    .parenthetical {
      margin: 0 1.5in;
      font-style: italic;
    }
    .action {
      margin: 1em 0;
    }
    .title-page {
      text-align: center;
      page-break-after: always;
    }
  `);
  lines.push('</style></head><body>');
  
  // 标题页
  if (options.includeTitlePage !== false) {
    lines.push('<div class="title-page">');
    lines.push(`<h1>${project.title}</h1>`);
    if (project.description) {
      lines.push(`<p>${project.description}</p>`);
    }
    lines.push('</div>');
  }
  
  // 场景内容
  for (const scene of scenes) {
    if (scene.content) {
      const elements = parseTipTapContent(scene.content);
      
      for (const el of elements) {
        const className = el.type === 'scene-heading' ? 'scene-heading' :
                         el.type === 'character' ? 'character' :
                         el.type === 'dialogue' ? 'dialogue' :
                         el.type === 'parenthetical' ? 'parenthetical' : 'action';
        lines.push(`<div class="${className}">${el.content}</div>`);
      }
    }
  }
  
  lines.push('</body></html>');
  
  return lines.join('\n');
}

/* ==================================================
   别名导出（兼容旧代码）
   ================================================== */

/**
 * 导出为 Fountain 格式（别名）
 * @deprecated 请使用 exportToFountain
 */
export function toFountain(project: Project, scenes: Scene[], options?: ExportOptions): string {
  return exportToFountain(project, scenes, options);
}

/**
 * 导出为纯文本格式（别名）
 * @deprecated 请使用 exportToPlainText
 */
export function toPlainText(project: Project, scenes: Scene[], options?: ExportOptions): string {
  return exportToPlainText(project, scenes, options);
}

/**
 * 导出为 HTML 格式（别名）
 * @deprecated 请使用 exportToPDF
 */
export function toHTML(project: Project, scenes: Scene[], options?: ExportOptions): string {
  return exportToPDF(project, scenes, options);
}

/**
 * 导出为 Word 段落格式（别名）
 * @deprecated 请使用 exportToPDF 或自定义实现
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toWordParagraphs(_project: Project, scenes: Scene[], _options?: ExportOptions): any[] {
  const paragraphs: { text: string; style?: string }[] = [];
  
  for (const scene of scenes) {
    if (scene.content) {
      const elements = parseTipTapContent(scene.content);
      for (const el of elements) {
        paragraphs.push({
          text: el.content,
          style: el.type,
        });
      }
    }
  }
  
  return paragraphs;
}

