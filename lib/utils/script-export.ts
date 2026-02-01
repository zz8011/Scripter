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

/* ==================================================
   TipTap JSON 解析
   ================================================== */

/**
 * 从 TipTap JSON 中提取纯文本
 */
function extractTextFromNode(node: any): string {
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
export function parseTipTapContent(content: any): ScriptElement[] {
  const elements: ScriptElement[] = [];
  
  if (!content || !content.content || !Array.isArray(content.content)) {
    return elements;
  }
  
  for (const node of content.content) {
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
      case 'action':
        elements.push({ type: 'action', content: text });
        break;
      case 'parenthetical':
        elements.push({ type: 'parenthetical', content: text });
        break;
      default:
        // 尝试根据内容特征推断类型
        const inferredType = inferScriptElementType(text);
        elements.push({ type: inferredType, content: text });
    }
  }
  
  return elements;
}

/**
 * 根据文本特征推断剧本元素类型
 */
function inferScriptElementType(text: string): ScriptElement['type'] {
  const trimmed = text.trim();
  
  // 场景标题特征: 内/外景 + 地点 + 时间
  if (/^(内景|外景|内外景|INT\.?|EXT\.?|INT\.\/EXT\.?)/i.test(trimmed)) {
    return 'scene-heading';
  }
  
  // 人物特征: 全大写，较短，可能在括号内有说明
  if (/^[\u4e00-\u9fa5A-Z\s]+(\([^)]*\))?$/.test(trimmed) && trimmed.length < 30) {
    return 'character';
  }
  
  // 括号说明特征: 括号包裹
  if (/^\([^)]*\)$/.test(trimmed)) {
    return 'parenthetical';
  }
  
  // 默认为动作描述
  return 'action';
}

/* ==================================================
   场景数据转换
   ================================================== */

/**
 * 将场景数组转换为剧本元素数组
 */
export function scenesToScriptElements(scenes: Scene[]): ScriptElement[] {
  const elements: ScriptElement[] = [];
  
  for (const scene of scenes) {
    // 添加场景标题
    const intExt = scene.intExt === 'INT' ? '内景' : 
                   scene.intExt === 'EXT' ? '外景' : '内外景';
    const timeOfDay = scene.timeOfDay === 'day' ? '日' :
                      scene.timeOfDay === 'night' ? '夜' :
                      scene.timeOfDay === 'dawn' ? '晨' :
                      scene.timeOfDay === 'dusk' ? '昏' : scene.timeOfDay;
    
    elements.push({
      type: 'scene-heading',
      content: `${intExt} ${scene.location} - ${timeOfDay}`
    });
    
    // 解析场景内容
    if (scene.content) {
      const contentElements = parseTipTapContent(scene.content);
      elements.push(...contentElements);
    }
    
    // 场景间隔
    elements.push({ type: 'text', content: '' });
  }
  
  return elements;
}

/* ==================================================
   Fountain 格式导出
   ================================================== */

/**
 * 转换为 Fountain 格式
 * Fountain 是一种纯文本剧本格式
 */
export function toFountain(
  project: Project,
  scenes: Scene[],
  options: ExportOptions = {}
): string {
  const lines: string[] = [];
  
  // 标题页
  if (options.includeTitlePage !== false) {
    lines.push(`Title: ${project.name}`);
    lines.push(`Type: ${project.scriptType === 'short-drama' ? '短剧' : project.scriptType === 'movie' ? '电影' : '连续剧'}`);
    lines.push('');
  }
  
  // 场景内容
  for (const scene of scenes) {
    // 场景标题
    const intExt = scene.intExt === 'INT' ? 'INT.' : 
                   scene.intExt === 'EXT' ? 'EXT.' : 'INT./EXT.';
    const timeOfDay = scene.timeOfDay.toUpperCase();
    lines.push(`${intExt} ${scene.location} - ${timeOfDay}`);
    lines.push('');
    
    // 场景内容
    if (scene.content) {
      const elements = parseTipTapContent(scene.content);
      
      for (const element of elements) {
        switch (element.type) {
          case 'scene-heading':
            // 已处理，跳过
            break;
          case 'character':
            lines.push(element.content.toUpperCase());
            break;
          case 'dialogue':
            lines.push(element.content);
            lines.push('');
            break;
          case 'parenthetical':
            lines.push(`(${element.content.replace(/[()]/g, '')})`);
            break;
          case 'action':
            lines.push(element.content);
            lines.push('');
            break;
          default:
            lines.push(element.content);
        }
      }
    }
    
    // 场景间隔
    lines.push('');
  }
  
  return lines.join('\n');
}

/* ==================================================
   纯文本格式导出
   ================================================== */

/**
 * 转换为格式化的纯文本
 */
export function toPlainText(
  project: Project,
  scenes: Scene[],
  options: ExportOptions = {}
): string {
  const lines: string[] = [];
  
  // 标题
  lines.push('='.repeat(60));
  lines.push(project.name);
  lines.push('='.repeat(60));
  lines.push('');
  
  // 场景内容
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    
    // 场景标题
    const intExt = scene.intExt === 'INT' ? '内景' : 
                   scene.intExt === 'EXT' ? '外景' : '内外景';
    const timeOfDay = scene.timeOfDay === 'day' ? '日' :
                      scene.timeOfDay === 'night' ? '夜' :
                      scene.timeOfDay === 'dawn' ? '晨' :
                      scene.timeOfDay === 'dusk' ? '昏' : scene.timeOfDay;
    
    const sceneNumber = options.includeSceneNumbers !== false ? ` 第${i + 1}场` : '';
    lines.push(`【${intExt}】${scene.location} - ${timeOfDay}${sceneNumber}`);
    lines.push('-'.repeat(40));
    
    // 场景内容
    if (scene.content) {
      const elements = parseTipTapContent(scene.content);
      
      for (const element of elements) {
        switch (element.type) {
          case 'scene-heading':
            // 已处理，跳过
            break;
          case 'character':
            lines.push('');
            lines.push(`${element.content}:`);
            break;
          case 'dialogue':
            lines.push(`  ${element.content}`);
            break;
          case 'parenthetical':
            lines.push(`  （${element.content.replace(/[()（）]/g, '')}）`);
            break;
          case 'action':
            lines.push('');
            lines.push(element.content);
            break;
          default:
            lines.push(element.content);
        }
      }
    }
    
    lines.push('');
    lines.push('');
  }
  
  return lines.join('\n');
}

/* ==================================================
   HTML 格式导出（用于 PDF 生成）
   ================================================== */

/**
 * 转换为 HTML 格式
 */
export function toHTML(
  project: Project,
  scenes: Scene[],
  options: ExportOptions = {}
): string {
  const styles = `
    <style>
      @page {
        size: ${options.pageSize === 'US-Letter' ? 'letter' : 'A4'};
        margin: 2.5cm 2cm;
      }
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: "Noto Sans SC", "Source Han Sans SC", "Microsoft YaHei", "SimHei", sans-serif;
        font-size: 12pt;
        line-height: 1.6;
        color: #000;
        background: #fff;
      }
      
      .title-page {
        page-break-after: always;
        text-align: center;
        padding-top: 40%;
      }
      
      .title-page h1 {
        font-size: 24pt;
        margin-bottom: 20px;
      }
      
      .title-page .meta {
        font-size: 12pt;
        color: #666;
      }
      
      .scene {
        margin-bottom: 24pt;
        page-break-inside: avoid;
      }
      
      .scene-heading {
        font-weight: bold;
        margin-bottom: 12pt;
        background-color: #f5f5f5;
        padding: 8pt;
      }
      
      .character {
        text-align: center;
        font-weight: bold;
        margin-top: 16pt;
        margin-bottom: 4pt;
      }
      
      .dialogue {
        margin-left: 15%;
        margin-right: 15%;
        margin-bottom: 12pt;
      }
      
      .parenthetical {
        margin-left: 20%;
        margin-right: 20%;
        font-style: italic;
        margin-bottom: 4pt;
      }
      
      .action {
        margin-bottom: 12pt;
        text-align: justify;
      }
      
      .scene-number {
        float: right;
        font-weight: normal;
        color: #666;
      }
    </style>
  `;
  
  let content = '';
  
  // 标题页
  if (options.includeTitlePage !== false) {
    content += `
      <div class="title-page">
        <h1>${escapeHtml(project.name)}</h1>
        <div class="meta">
          <p>类型: ${project.scriptType === 'short-drama' ? '短剧' : project.scriptType === 'movie' ? '电影' : '连续剧'}</p>
          <p>目标集数: ${project.targetEpisodes} 集</p>
        </div>
      </div>
    `;
  }
  
  // 场景内容
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    
    const intExt = scene.intExt === 'INT' ? '内景' : 
                   scene.intExt === 'EXT' ? '外景' : '内外景';
    const timeOfDay = scene.timeOfDay === 'day' ? '日' :
                      scene.timeOfDay === 'night' ? '夜' :
                      scene.timeOfDay === 'dawn' ? '晨' :
                      scene.timeOfDay === 'dusk' ? '昏' : scene.timeOfDay;
    
    const sceneNumber = options.includeSceneNumbers !== false ? `<span class="scene-number">${i + 1}</span>` : '';
    
    content += `<div class="scene">`;
    content += `<div class="scene-heading">${sceneNumber}${intExt} ${escapeHtml(scene.location)} - ${timeOfDay}</div>`;
    
    if (scene.content) {
      const elements = parseTipTapContent(scene.content);
      
      for (const element of elements) {
        switch (element.type) {
          case 'scene-heading':
            break;
          case 'character':
            content += `<div class="character">${escapeHtml(element.content)}</div>`;
            break;
          case 'dialogue':
            content += `<div class="dialogue">${escapeHtml(element.content)}</div>`;
            break;
          case 'parenthetical':
            content += `<div class="parenthetical">(${escapeHtml(element.content.replace(/[()]/g, ''))})</div>`;
            break;
          case 'action':
            content += `<div class="action">${escapeHtml(element.content)}</div>`;
            break;
        }
      }
    }
    
    content += `</div>`;
  }
  
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(project.name)}</title>
  ${styles}
</head>
<body>
  ${content}
</body>
</html>`;
}

/**
 * HTML 转义
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ==================================================
   Word 文档格式导出
   ================================================== */

/**
 * 转换为 Word 文档的段落结构
 */
export function toWordParagraphs(
  project: Project,
  scenes: Scene[],
  options: ExportOptions = {}
): Array<{ type: string; content: string; style?: string }> {
  const paragraphs: Array<{ type: string; content: string; style?: string }> = [];
  
  // 标题页
  if (options.includeTitlePage !== false) {
    paragraphs.push({ type: 'title', content: project.name, style: 'Title' });
    paragraphs.push({ type: 'text', content: '' });
    paragraphs.push({ 
      type: 'text', 
      content: `类型: ${project.scriptType === 'short-drama' ? '短剧' : project.scriptType === 'movie' ? '电影' : '连续剧'}` 
    });
    paragraphs.push({ type: 'text', content: `目标集数: ${project.targetEpisodes} 集` });
    paragraphs.push({ type: 'pageBreak', content: '' });
  }
  
  // 场景内容
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    
    const intExt = scene.intExt === 'INT' ? '内景' : 
                   scene.intExt === 'EXT' ? '外景' : '内外景';
    const timeOfDay = scene.timeOfDay === 'day' ? '日' :
                      scene.timeOfDay === 'night' ? '夜' :
                      scene.timeOfDay === 'dawn' ? '晨' :
                      scene.timeOfDay === 'dusk' ? '昏' : scene.timeOfDay;
    
    const sceneNumber = options.includeSceneNumbers !== false ? ` (${i + 1})` : '';
    
    paragraphs.push({
      type: 'sceneHeading',
      content: `${intExt} ${scene.location} - ${timeOfDay}${sceneNumber}`,
      style: 'SceneHeading'
    });
    
    if (scene.content) {
      const elements = parseTipTapContent(scene.content);
      
      for (const element of elements) {
        switch (element.type) {
          case 'scene-heading':
            break;
          case 'character':
            paragraphs.push({ type: 'character', content: element.content, style: 'Character' });
            break;
          case 'dialogue':
            paragraphs.push({ type: 'dialogue', content: element.content, style: 'Dialogue' });
            break;
          case 'parenthetical':
            paragraphs.push({ 
              type: 'parenthetical', 
              content: `(${element.content.replace(/[()]/g, '')})`,
              style: 'Parenthetical'
            });
            break;
          case 'action':
            paragraphs.push({ type: 'action', content: element.content, style: 'Action' });
            break;
        }
      }
    }
    
    paragraphs.push({ type: 'text', content: '' });
  }
  
  return paragraphs;
}
