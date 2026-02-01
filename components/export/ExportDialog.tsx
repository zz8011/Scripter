/* ==================================================
   剧本导出对话框组件
   Script Export Dialog Component
   ================================================== */

'use client';

import { useState } from 'react';
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
import { IconifyIcon } from '@/components/IconifyIcon';
import {
  exportScript,
  downloadBlob,
  type ExportFormat,
  type ExportOptions,
  type ExportProgress,
} from '@/lib/api/export';
import { cn } from '@/lib/utils';

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
}

/* ==================================================
   导出格式选项
   ================================================== */

const EXPORT_FORMATS: ExportFormatOption[] = [
  {
    value: 'pdf',
    label: 'PDF 文档',
    icon: 'lucide:file-text',
    description: '标准剧本格式，适合打印和分享',
  },
  {
    value: 'word',
    label: 'Word 文档',
    icon: 'lucide:file-type',
    description: '可编辑的 Word 格式',
  },
  {
    value: 'txt',
    label: '纯文本',
    icon: 'lucide:file-code',
    description: '简单的文本格式',
  },
  {
    value: 'fountain',
    label: 'Fountain',
    icon: 'lucide:file-json',
    description: '编剧标准格式，兼容多种工具',
  },
];

/* ==================================================
   导出对话框组件
   ================================================== */

export function ExportDialog({
  projectId,
  projectName,
  open,
  onOpenChange,
}: ExportDialogProps) {
  // 状态
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [includeTitlePage, setIncludeTitlePage] = useState(true);
  const [includeSceneNumbers, setIncludeSceneNumbers] = useState(true);
  const [pageSize, setPageSize] = useState<'A4' | 'US-Letter'>('A4');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress>({
    status: 'idle',
    progress: 0,
    message: '',
  });
  const [error, setError] = useState<string | null>(null);

  /* ==================================================
     处理函数
     ================================================== */

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    setProgress({
      status: 'preparing',
      progress: 0,
      message: '准备导出...',
    });

    try {
      const options: ExportOptions = {
        includeTitlePage,
        includeSceneNumbers,
        pageSize,
      };

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

      // 关闭对话框
      setTimeout(() => {
        onOpenChange(false);
        resetState();
      }, 500);
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
    }
  };

  const resetState = () => {
    setFormat('pdf');
    setIncludeTitlePage(true);
    setIncludeSceneNumbers(true);
    setPageSize('A4');
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

  /* ==================================================
     渲染
     ================================================== */

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconifyIcon icon="lucide:download" className="h-5 w-5" />
            导出剧本
          </DialogTitle>
          <DialogDescription>
            选择导出格式和选项，将剧本导出为文件
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 导出格式选择 */}
          <div className="space-y-2">
            <Label>导出格式</Label>
            <Select
              value={format}
              onValueChange={(value) => setFormat(value as ExportFormat)}
              disabled={isExporting}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择导出格式" />
              </SelectTrigger>
              <SelectContent>
                {EXPORT_FORMATS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="flex items-center gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <IconifyIcon icon={option.icon} className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* PDF/Word 特有选项 */}
          {(format === 'pdf' || format === 'word') && (
            <div className="space-y-2">
              <Label>页面设置</Label>
              <Select
                value={pageSize}
                onValueChange={(value) => setPageSize(value as 'A4' | 'US-Letter')}
                disabled={isExporting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择页面大小" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A4">A4 (210 × 297 mm)</SelectItem>
                  <SelectItem value="US-Letter">US Letter (8.5 × 11 in)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* 导出选项 */}
          <div className="space-y-3">
            <Label>导出选项</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="titlePage"
                checked={includeTitlePage}
                onCheckedChange={(checked) => setIncludeTitlePage(checked as boolean)}
                disabled={isExporting}
              />
              <Label
                htmlFor="titlePage"
                className="text-sm font-normal cursor-pointer"
              >
                包含标题页
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sceneNumbers"
                checked={includeSceneNumbers}
                onCheckedChange={(checked) => setIncludeSceneNumbers(checked as boolean)}
                disabled={isExporting}
              />
              <Label
                htmlFor="sceneNumbers"
                className="text-sm font-normal cursor-pointer"
              >
                显示场景编号
              </Label>
            </div>
          </div>

          {/* 进度显示 */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{progress.message}</span>
                <span className="font-medium">{progress.progress}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-all duration-300',
                    progress.status === 'error'
                      ? 'bg-destructive'
                      : 'bg-primary'
                  )}
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              <IconifyIcon icon="lucide:alert-circle" className="h-4 w-4" />
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isExporting}
          >
            取消
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="gap-2"
          >
            {isExporting ? (
              <>
                <IconifyIcon icon="lucide:loader-2" className="h-4 w-4 animate-spin" />
                导出中...
              </>
            ) : (
              <>
                <IconifyIcon icon="lucide:download" className="h-4 w-4" />
                导出
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
