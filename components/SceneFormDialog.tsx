/* ==================================================
   场景表单弹窗组件 Scene Form Dialog Component
   Scene Form Dialog with Validation
   ================================================== */

'use client';

import { useState, useEffect } from 'react';
import { Scene } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IconifyIcon } from '@/components/IconifyIcon';
import { cn } from '@/lib/utils';

/* ==================================================
   类型定义 Type Definitions
   ================================================== */

interface SceneFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (scene: Omit<Scene, 'id'>) => void;
  scene?: Scene;
  projectId?: string;
  mode?: 'create' | 'edit';
}

/* ==================================================
   表单数据类型 Form Data Type
   ================================================== */

type FormData = {
  title: string;
  location: string;
  time: Scene['time'];
  environment: Scene['environment'];
  episodeNumber: number;
  sceneNumber: number;
  status: Scene['status'];
};

/* ==================================================
   场景表单弹窗组件 Scene Form Dialog Component
   ================================================== */

export function SceneFormDialog({
  open,
  onOpenChange,
  onSubmit,
  scene,
  projectId = '',
  mode = 'create',
}: SceneFormDialogProps) {
  /* ==================================================
     状态管理 State Management
     ================================================== */

  const [formData, setFormData] = useState<FormData>({
    title: '',
    location: '',
    time: 'day',
    environment: 'interior',
    episodeNumber: 1,
    sceneNumber: 1,
    status: 'draft',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  /* ==================================================
     初始化表单数据 Initialize Form Data
     ================================================== */

  useEffect(() => {
    if (scene && mode === 'edit') {
      setFormData({
        title: scene.title || '',
        location: scene.location || '',
        time: scene.time || 'day',
        environment: scene.environment || 'interior',
        episodeNumber: scene.episodeNumber,
        sceneNumber: scene.sceneNumber,
        status: scene.status,
      });
    } else {
      // 重置为默认值
      setFormData({
        title: '',
        location: '',
        time: 'day',
        environment: 'interior',
        episodeNumber: 1,
        sceneNumber: 1,
        status: 'draft',
      });
    }
    setErrors({});
  }, [scene, mode, open]);

  /* ==================================================
     表单验证 Form Validation
     ================================================== */

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // 场景标题验证
    if (!formData.title.trim()) {
      newErrors.title = '请输入场景标题';
    }

    // 集数验证
    if (formData.episodeNumber < 1) {
      newErrors.episodeNumber = '集数必须大于 0';
    }

    // 场景编号验证
    if (formData.sceneNumber < 1) {
      newErrors.sceneNumber = '场景编号必须大于 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ==================================================
     表单提交 Handle Submit
     ================================================== */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const sceneData: Omit<Scene, 'id'> = {
      projectId: scene?.projectId || projectId,
      episodeNumber: formData.episodeNumber,
      sceneNumber: formData.sceneNumber,
      title: formData.title.trim(),
      location: formData.location.trim() || undefined,
      time: formData.time,
      environment: formData.environment,
      status: formData.status,
      content: scene?.content,
      duration: scene?.duration,
    };

    onSubmit(sceneData);
    onOpenChange(false);
  };

  /* ==================================================
     渲染 Render
     ================================================== */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl" style={{ color: 'var(--ink-black)' }}>
            {mode === 'create' ? '创建新场景' : '编辑场景'}
          </DialogTitle>
          <DialogDescription style={{ color: 'var(--text-muted)' }}>
            {mode === 'create' ? '填写场景信息创建新的剧本场景' : '修改场景信息'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 场景标题 */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: 'var(--ink-secondary)' }}>
              场景标题 <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="例如：初遇咖啡厅"
              className={cn(errors.title && 'border-red-500')}
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title}</p>
            )}
          </div>

          {/* 地点 */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: 'var(--ink-secondary)' }}>
              地点
            </label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="例如：市中心的咖啡厅"
            />
          </div>

          {/* 集数和场景编号 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: 'var(--ink-secondary)' }}>
                集数 <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min="1"
                value={formData.episodeNumber}
                onChange={(e) => setFormData({
                  ...formData,
                  episodeNumber: parseInt(e.target.value) || 1
                })}
                className={cn(errors.episodeNumber && 'border-red-500')}
              />
              {errors.episodeNumber && (
                <p className="text-xs text-red-500">{errors.episodeNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: 'var(--ink-secondary)' }}>
                场景编号 <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min="1"
                value={formData.sceneNumber}
                onChange={(e) => setFormData({
                  ...formData,
                  sceneNumber: parseInt(e.target.value) || 1
                })}
                className={cn(errors.sceneNumber && 'border-red-500')}
              />
              {errors.sceneNumber && (
                <p className="text-xs text-red-500">{errors.sceneNumber}</p>
              )}
            </div>
          </div>

          {/* 时间和环境 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: 'var(--ink-secondary)' }}>
                时间
              </label>
              <Select
                value={formData.time}
                onValueChange={(value: Scene['time']) =>
                  setFormData({ ...formData, time: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">日</SelectItem>
                  <SelectItem value="night">夜</SelectItem>
                  <SelectItem value="dawn">黎明</SelectItem>
                  <SelectItem value="dusk">黄昏</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: 'var(--ink-secondary)' }}>
                环境
              </label>
              <Select
                value={formData.environment}
                onValueChange={(value: string) =>
                  setFormData({ ...formData, environment: value as Scene['environment'] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interior">室内</SelectItem>
                  <SelectItem value="exterior">室外</SelectItem>
                  <SelectItem value="both">内外</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 状态 */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: 'var(--ink-secondary)' }}>
              状态
            </label>
            <Select
              value={formData.status}
              onValueChange={(value: Scene['status']) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">草稿</SelectItem>
                <SelectItem value="in_progress">进行中</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 提示信息 */}
          <div className="flex items-start gap-2 p-3 rounded-md bg-blue-50 border border-blue-200">
            <IconifyIcon
              icon="mdi:information"
              className="text-blue-500 mt-0.5 flex-shrink-0"
            />
            <p className="text-xs text-blue-700">
              创建场景后，你可以在编辑器中添加场景内容和对白。
            </p>
          </div>

          {/* 底部按钮 */}
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button
              type="submit"
              className="bg-[var(--brand-gold)] hover:bg-[var(--brand-gold-dark)] text-white"
            >
              {mode === 'create' ? '创建场景' : '保存修改'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
