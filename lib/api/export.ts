/* ==================================================
   导出 API 客户端
   Export API Client
   ================================================== */

import { ApiError } from '@/lib/api/projects';

/* ==================================================
   类型定义
   ================================================== */

export interface ExportOptions {
  includeTitlePage?: boolean;
  includeSceneNumbers?: boolean;
  pageSize?: 'A4' | 'US-Letter';
}

export type ExportFormat = 'pdf' | 'word' | 'txt' | 'fountain';

export interface ExportProgress {
  status: 'idle' | 'preparing' | 'generating' | 'downloading' | 'completed' | 'error';
  progress: number; // 0-100
  message: string;
}

/* ==================================================
   导出函数
   ================================================== */

/**
 * 导出剧本为 PDF
 */
export async function exportToPDF(
  projectId: string,
  options: ExportOptions = {},
  onProgress?: (progress: ExportProgress) => void
): Promise<Blob> {
  onProgress?.({
    status: 'preparing',
    progress: 10,
    message: '准备导出数据...',
  });

  const response = await fetch('/api/export/pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      projectId,
      options,
    }),
  });

  onProgress?.({
    status: 'generating',
    progress: 50,
    message: '生成 PDF 文件...',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '导出失败' }));
    throw new ApiError(error.error || 'PDF导出失败', response.status, error.details);
  }

  onProgress?.({
    status: 'downloading',
    progress: 80,
    message: '下载文件...',
  });

  const blob = await response.blob();

  onProgress?.({
    status: 'completed',
    progress: 100,
    message: '导出完成',
  });

  return blob;
}

/**
 * 导出剧本为 Word
 */
export async function exportToWord(
  projectId: string,
  options: ExportOptions = {},
  onProgress?: (progress: ExportProgress) => void
): Promise<Blob> {
  onProgress?.({
    status: 'preparing',
    progress: 10,
    message: '准备导出数据...',
  });

  const response = await fetch('/api/export/word', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      projectId,
      options,
    }),
  });

  onProgress?.({
    status: 'generating',
    progress: 50,
    message: '生成 Word 文件...',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '导出失败' }));
    throw new ApiError(error.error || 'Word导出失败', response.status, error.details);
  }

  onProgress?.({
    status: 'downloading',
    progress: 80,
    message: '下载文件...',
  });

  const blob = await response.blob();

  onProgress?.({
    status: 'completed',
    progress: 100,
    message: '导出完成',
  });

  return blob;
}

/**
 * 导出剧本为纯文本
 */
export async function exportToText(
  projectId: string,
  format: 'txt' | 'fountain' = 'txt',
  options: ExportOptions = {},
  onProgress?: (progress: ExportProgress) => void
): Promise<Blob> {
  onProgress?.({
    status: 'preparing',
    progress: 10,
    message: '准备导出数据...',
  });

  const response = await fetch('/api/export/text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      projectId,
      format,
      options,
    }),
  });

  onProgress?.({
    status: 'generating',
    progress: 50,
    message: '生成文本文件...',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '导出失败' }));
    throw new ApiError(error.error || '文本导出失败', response.status, error.details);
  }

  onProgress?.({
    status: 'downloading',
    progress: 80,
    message: '下载文件...',
  });

  const blob = await response.blob();

  onProgress?.({
    status: 'completed',
    progress: 100,
    message: '导出完成',
  });

  return blob;
}

/**
 * 通用导出函数
 */
export async function exportScript(
  format: ExportFormat,
  projectId: string,
  options: ExportOptions = {},
  onProgress?: (progress: ExportProgress) => void
): Promise<Blob> {
  switch (format) {
    case 'pdf':
      return exportToPDF(projectId, options, onProgress);
    case 'word':
      return exportToWord(projectId, options, onProgress);
    case 'txt':
      return exportToText(projectId, 'txt', options, onProgress);
    case 'fountain':
      return exportToText(projectId, 'fountain', options, onProgress);
    default:
      throw new Error(`不支持的导出格式: ${format}`);
  }
}

/**
 * 下载 Blob 文件
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
