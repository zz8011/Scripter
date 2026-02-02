/* ==================================================
   剧本导出对话框组件
   Script Export Dialog Component
   ================================================== */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { IconifyIcon } from '@/components/IconifyIcon';
import {
  exportScript,
  downloadBlob,
  type ExportFormat,
  type ExportOptions,
  type ExportProgress,
} from '@/lib/api/export';
import { cn } from '@/lib/utils';
import { getProject, type Project } from '@/lib/api/projects';
import { getScenes } from '@/lib/api/scenes';

/* ==================================================
   类型定义
   ================================================== */

interface ExportDialogProps {
  projectId: string;
  projectName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ExportFormatOption {
  value: ExportFormat;
  label: string;
  icon: string;
  description: string;
  color: string;
}

/* ==================================================
   导出格式选项
   ================================================== */

const EXPORT_FORMATS: ExportFormatOption[] = [
  {
    value: 'word',
    label: 'Word',
    icon: 'lucide:file-type',
    description: '专业剧本格式，可编辑',
    color: '#2B579A',
  },
  {
    value: 'pdf',
    label: 'PDF',
    icon: 'lucide:file-text',
    description: '防篡改格式，适合分享',
    color: '#DC2626',
  },
  {
    value: 'txt',
    label: '纯文本',
    icon: 'lucide:file-code',
    description: 'Fountain 格式，通用',
    color: '#059669',
  },
  {
    value: 'fountain',
    label: 'Fountain',
    icon: 'lucide:file-json',
    description: '编剧标准格式',
    color: '#7C3AED',
  },
];

/* ==================================================
   状态标签映射
   ================================================== */

const STATUS_LABELS: Record<ExportProgress['status'], { label: string; color: string }> = {
  idle: { label: '等待中', color: 'bg-gray-400' },
  preparing: { label: '准备数据', color: 'bg-blue-500' },
  generating: { label: '生成文件', color: 'bg-yellow-500' },
  downloading: { label: '下载中', color: 'bg-purple-500' },
  completed: { label: '完成', color: 'bg-green-500' },
  error: { label: '错误', color: 'bg-red-500' },
};

/* ==================================================
   导出对话框组件
   ================================================== */

export function ExportDialog({
  projectId,
  projectName,
  open,
  onOpenChange,
}: ExportDialogProps) {
  // 导出选项状态
  const [format, setFormat] = useState<ExportFormat>('word');
  const [includeTitlePage, setIncludeTitlePage] = useState(true);
  const [includeSceneNumbers, setIncludeSceneNumbers] = useState(true);
  const [pageSize, setPageSize] = useState<'A4' | 'US-Letter'>('A4');
  const [includeProductionDocs, setIncludeProductionDocs] = useState(false);

  // 导出进度状态
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress>({
    status: 'idle',
    progress: 0,
    message: '',
  });
  const [error, setError] = useState<string | null>(null);

  // 项目预览数据
  const [projectInfo, setProjectInfo] = useState<{
    sceneCount: number;
    wordCount: number;
    estimatedPages: number;
    loading: boolean;
  }>({
    sceneCount: 0,
    wordCount: 0,
    estimatedPages: 0,
    loading: true,
  });

  // SSE 连接
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  /* ==================================================
     加载项目预览数据
     ================================================== */
  useEffect(() => {
    if (open && projectId) {
      loadProjectPreview();
    }
  }, [open, projectId]);

  const loadProjectPreview = async () => {
    setProjectInfo(prev => ({ ...prev, loading: true }));
    try {
      const [project, scenes] = await Promise.all([
        getProject(projectId),
        getScenes(projectId),
      ]);

      // 估算字数（从内容计算）
      const wordCount = scenes.reduce((total, scene) => {
        if (scene.content && typeof scene.content === 'object') {
          const extractText = (node: unknown): string => {
            if (!node || typeof node !== 'object') return '';
            const n = node as { text?: string; content?: unknown[] };
            if (n.text) return n.text;
            if (n.content) return n.content.map(extractText).join('');
            return '';
          };
          return total + extractText(scene.content).length;
        }
        return total;
      }, 0);
      // 估算页数：平均每页约 450 字（剧本格式）
      const estimatedPages = Math.ceil(wordCount / 450);

      setProjectInfo({
        sceneCount: scenes.length,
        wordCount,
        estimatedPages: Math.max(1, estimatedPages),
        loading: false,
      });
    } catch (err) {
      console.error('Failed to load project preview:', err);
      setProjectInfo(prev => ({ ...prev, loading: false }));
    }
  };

  /* ==================================================
     SSE 进度监听
     ================================================== */
  const setupProgressListener = useCallback(() => {
    const es = new EventSource(`/api/export/progress?projectId=${projectId}`);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setProgress(data);

        if (data.status === 'completed' || data.status === 'error') {
          es.close();
          setEventSource(null);
        }
      } catch (err) {
        console.error('Failed to parse SSE data:', err);
      }
    };

    es.onerror = () => {
      es.close();
      setEventSource(null);
    };

    setEventSource(es);
    return es;
  }, [projectId]);

  // 清理 SSE 连接
  useEffect(() => {
    return () => {
      eventSource?.close();
    };
  }, [eventSource]);

  /* ==================================================
     处理函数
     ================================================== */

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    setProgress({
      status: 'preparing',
      progress: 10,
      message: '准备导出数据...',
    });

    // 设置 SSE 进度监听（如果可用）
    const es = setupProgressListener();

    try {
      // 如果选择了制作准备文档，先导出制作文档
      if (includeProductionDocs) {
        setProgress({
          status: 'generating',
          progress: 30,
          message: '生成制作准备文档...',
        });

        const response = await fetch('/api/export/production', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId }),
        });

        if (!response.ok) {
          throw new Error('制作准备文档导出失败');
        }

        const blob = await response.blob();
        downloadBlob(blob, `${projectName}-制作准备文档.xlsx`);
      }

      const options: ExportOptions = {
        includeTitlePage,
        includeSceneNumbers,
        pageSize,
      };

      setProgress({
        status: 'generating',
        progress: 50,
        message: `生成 ${format.toUpperCase()} 文件...`,
      });

      const blob = await exportScript(
        format,
        projectId,
        options,
        (p) => setProgress(p)
      );

      // 生成文件名
      const extension = format === 'word' ? 'docx' : format;
      const fileName = `${projectName}-剧本.${extension}`;

      // 下载文件
      downloadBlob(blob, fileName);

      setProgress({
        status: 'completed',
        progress: 100,
        message: '导出完成',
      });

      // 关闭对话框
      setTimeout(() => {
        onOpenChange(false);
        resetState();
      }, 1000);
    } catch (err) {
      console.error('Export error:', err);
      setError(err instanceof Error ? err.message : '导出失败');
      setProgress({
        status: 'error',
        progress: 0,
        message: '导出失败',
      });
    } finally {
      setIsExporting(false);
      es?.close();
      setEventSource(null);
    }
  };

  const handleCancel = () => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }
    setIsExporting(false);
    setProgress({
      status: 'idle',
      progress: 0,
      message: '',
    });
  };

  const resetState = () => {
    setFormat('word');
    setIncludeTitlePage(true);
    setIncludeSceneNumbers(true);
    setPageSize('A4');
    setIncludeProductionDocs(false);
    setIsExporting(false);
    setProgress({
      status: 'idle',
      progress: 0,
      message: '',
    });
    setError(null);
  };

  const handleClose = () => {
    if (!isExporting) {
      onOpenChange(false);
      resetState();
    }
  };

  const selectedFormat = EXPORT_FORMATS.find(f => f.value === format);

  /* ==================================================
     渲染
     ================================================== */

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden" style={{ backgroundColor: '#F5F1E8' }}>
        {/* 头部 */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b" style={{ borderColor: 'rgba(139, 115, 85, 0.2)' }}>
          <DialogTitle className="flex items-center gap-2 text-xl" style={{ color: '#1A1A1A', fontFamily: 'var(--font-display)' }}>
            <IconifyIcon icon="lucide:file-output" className="h-5 w-5" style={{ color: '#C9A962' }} />
            导出剧本
          </DialogTitle>
          <DialogDescription style={{ color: '#8B7355' }}>
            选择导出格式和选项，将剧本导出为文件
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 px-6">
          {/* 项目信息预览 */}
          <div 
            className="rounded-lg p-4 space-y-2"
            style={{ backgroundColor: 'rgba(201, 169, 98, 0.1)' }}
          >
            <div className="flex items-center gap-2 text-sm">
              <IconifyIcon icon="lucide:file-text" className="h-4 w-4" style={{ color: '#C9A962' }} />
              <span style={{ color: '#8B7355' }}>项目名称:</span>
              <span className="font-medium" style={{ color: '#1A1A1A' }}>《{projectName}》</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <IconifyIcon icon="lucide:layers" className="h-4 w-4" style={{ color: '#C9A962' }} />
                <span style={{ color: '#8B7355' }}>场景数量:</span>
                <span className="font-medium" style={{ color: '#1A1A1A' }}>
                  {projectInfo.loading ? '...' : `${projectInfo.sceneCount} 场`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <IconifyIcon icon="lucide:file-stack" className="h-4 w-4" style={{ color: '#C9A962' }} />
                <span style={{ color: '#8B7355' }}>预计页数:</span>
                <span className="font-medium" style={{ color: '#1A1A1A' }}>
                  {projectInfo.loading ? '...' : `约 ${projectInfo.estimatedPages} 页`}
                </span>
              </div>
            </div>
          </div>

          {/* 导出格式选择 - 卡片式布局 */}
          <div className="space-y-3">
            <Label className="text-sm font-medium" style={{ color: '#1A1A1A' }}>选择格式</Label>
            <div className="grid grid-cols-2 gap-3">
              {EXPORT_FORMATS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormat(option.value)}
                  disabled={isExporting}
                  className={cn(
                    'relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-200',
                    'hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                  style={{
                    borderColor: format === option.value ? option.color : 'rgba(139, 115, 85, 0.2)',
                    backgroundColor: format === option.value ? `${option.color}10` : 'white',
                  }}
                >
                  <IconifyIcon 
                    icon={option.icon} 
                    className="h-8 w-8"
                    style={{ color: option.color }}
                  />
                  <div className="text-center">
                    <div className="font-medium text-sm" style={{ color: '#1A1A1A' }}>
                      {option.label}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: '#8B7355' }}>
                      {option.description}
                    </div>
                  </div>
                  {format === option.value && (
                    <div 
                      className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: option.color }}
                    >
                      <IconifyIcon icon="lucide:check" className="h-3 w-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 导出选项 */}
          <div className="space-y-4">
            <Label className="text-sm font-medium" style={{ color: '#1A1A1A' }}>导出选项</Label>
            
            {/* 复选框选项 */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="titlePage"
                  checked={includeTitlePage}
                  onCheckedChange={(checked) => setIncludeTitlePage(checked as boolean)}
                  disabled={isExporting}
                  style={{ borderColor: '#C9A962' }}
                />
                <Label
                  htmlFor="titlePage"
                  className="text-sm cursor-pointer"
                  style={{ color: '#1A1A1A' }}
                >
                  包含标题页
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="sceneNumbers"
                  checked={includeSceneNumbers}
                  onCheckedChange={(checked) => setIncludeSceneNumbers(checked as boolean)}
                  disabled={isExporting}
                  style={{ borderColor: '#C9A962' }}
                />
                <Label
                  htmlFor="sceneNumbers"
                  className="text-sm cursor-pointer"
                  style={{ color: '#1A1A1A' }}
                >
                  包含场景编号
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="productionDocs"
                  checked={includeProductionDocs}
                  onCheckedChange={(checked) => setIncludeProductionDocs(checked as boolean)}
                  disabled={isExporting}
                  style={{ borderColor: '#C9A962' }}
                />
                <Label
                  htmlFor="productionDocs"
                  className="text-sm cursor-pointer"
                  style={{ color: '#1A1A1A' }}
                >
                  包含制作准备文档
                  <span className="ml-2 text-xs" style={{ color: '#8B7355' }}>
                    (角色清单、场景列表)
                  </span>
                </Label>
              </div>
            </div>

            {/* 页面尺寸选择 */}
            {(format === 'pdf' || format === 'word') && (
              <div className="pt-2">
                <Label className="text-sm mb-2 block" style={{ color: '#1A1A1A' }}>页面尺寸</Label>
                <RadioGroup
                  value={pageSize}
                  onValueChange={(value) => setPageSize(value as 'A4' | 'US-Letter')}
                  disabled={isExporting}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="A4" id="a4" style={{ borderColor: '#C9A962' }} />
                    <Label htmlFor="a4" className="text-sm cursor-pointer" style={{ color: '#1A1A1A' }}>
                      A4 (210×297mm)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="US-Letter" id="us-letter" style={{ borderColor: '#C9A962' }} />
                    <Label htmlFor="us-letter" className="text-sm cursor-pointer" style={{ color: '#1A1A1A' }}>
                      US Letter
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>

          {/* 进度显示 */}
          {isExporting && (
            <div 
              className="rounded-lg p-4 space-y-3"
              style={{ backgroundColor: 'rgba(201, 169, 98, 0.1)' }}
            >
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <IconifyIcon 
                    icon={progress.status === 'completed' ? 'lucide:check-circle' : 'lucide:loader-2'} 
                    className={cn(
                      'h-4 w-4',
                      progress.status === 'completed' ? '' : 'animate-spin'
                    )}
                    style={{ color: progress.status === 'completed' ? '#059669' : '#C9A962' }}
                  />
                  <span style={{ color: '#1A1A1A' }}>{progress.message}</span>
                </div>
                <span className="font-medium" style={{ color: '#C9A962' }}>{progress.progress}%</span>
              </div>
              <Progress 
                value={progress.progress} 
                className="h-2"
                style={{
                  backgroundColor: 'rgba(139, 115, 85, 0.2)',
                }}
              />
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div 
              className="flex items-center gap-2 text-sm p-3 rounded-md"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#DC2626' }}
            >
              <IconifyIcon icon="lucide:alert-circle" className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <DialogFooter className="px-6 py-4 border-t gap-2" style={{ borderColor: 'rgba(139, 115, 85, 0.2)' }}>
          {isExporting ? (
            <Button
              variant="outline"
              onClick={handleCancel}
              className="gap-2"
            >
              <IconifyIcon icon="lucide:x" className="h-4 w-4" />
              取消导出
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleClose}
              className="gap-2"
              style={{ borderColor: 'rgba(139, 115, 85, 0.3)', color: '#8B7355' }}
            >
              取消
            </Button>
          )}
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="gap-2"
            style={{
              backgroundColor: '#C9A962',
              color: '#1A1A1A',
            }}
          >
            {isExporting ? (
              <>
                <IconifyIcon icon="lucide:loader-2" className="h-4 w-4 animate-spin" />
                导出中...
              </>
            ) : (
              <>
                <IconifyIcon icon="lucide:download" className="h-4 w-4" />
                开始导出
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
