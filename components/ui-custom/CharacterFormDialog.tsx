/* ==================================================
   人物表单弹窗组件 Character Form Dialog Component
   Character Form Dialog Component
   ================================================== */

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IconifyIcon } from '@/components/IconifyIcon';
import { useCharacterStore } from '@/lib/stores/characterStore';
import type { Character } from '@/lib/types';

/* ==================================================
   组件接口 Component Interface
   ================================================== */

interface CharacterFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character?: Character | null;
  projectId: string;
}

/* ==================================================
   人物表单弹窗 Character Form Dialog Component
   ================================================== */

export function CharacterFormDialog({
  open,
  onOpenChange,
  character,
  projectId,
}: CharacterFormDialogProps) {
  const { addCharacter, updateCharacter } = useCharacterStore();

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    age: '',
    gender: 'other' as 'male' | 'female' | 'other',
    personality: '',
    speechStyle: '',
    behaviorPattern: '',
    backstory: '',
    poem: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);

  // 初始化表单数据
  useEffect(() => {
    if (character) {
      setFormData({
        name: character.name || '',
        nickname: character.nickname || '',
        age: character.age?.toString() || '',
        gender: character.gender || 'other',
        personality: character.personality?.join(', ') || '',
        speechStyle: character.speechStyle || '',
        behaviorPattern: character.behaviorPattern || '',
        backstory: character.backstory || '',
        poem: character.poem || '',
      });
    } else {
      setFormData({
        name: '',
        nickname: '',
        age: '',
        gender: 'other',
        personality: '',
        speechStyle: '',
        behaviorPattern: '',
        backstory: '',
        poem: '',
      });
    }
  }, [character, open]);

  // 处理表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const personalityArray = formData.personality
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const characterData: Partial<Character> = {
      projectId,
      name: formData.name,
      nickname: formData.nickname || undefined,
      age: formData.age ? parseInt(formData.age) : undefined,
      gender: formData.gender,
      personality: personalityArray.length > 0 ? personalityArray : undefined,
      speechStyle: formData.speechStyle || undefined,
      behaviorPattern: formData.behaviorPattern || undefined,
      backstory: formData.backstory || undefined,
      poem: formData.poem || undefined,
    };

    if (character) {
      // 更新现有人物
      updateCharacter(character.id, characterData);
    } else {
      // 添加新人物
      const newCharacter: Character = {
        id: `char-${Date.now()}`,
        ...characterData,
      } as Character;
      addCharacter(newCharacter);
    }

    onOpenChange(false);
  };

  // 生成诗号
  const handleGeneratePoem = async () => {
    if (!formData.name) {
      alert('请先输入人物姓名');
      return;
    }

    setIsGenerating(true);

    try {
      // 模拟 AI API 调用
      // TODO: 替换为实际的 AI API 调用
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 模拟生成的诗号
      const mockPoems = [
        `风起云涌天地间，${formData.name}独步江湖前。`,
        `剑气纵横三万里，${formData.name}一剑光寒十九州。`,
        `莫问前程何处去，${formData.name}自在心中游。`,
        `千山万水独行路，${formData.name}回首已是百年身。`,
      ];

      const randomPoem = mockPoems[Math.floor(Math.random() * mockPoems.length)];
      setFormData({ ...formData, poem: randomPoem });
    } catch (error) {
      console.error('生成诗号失败:', error);
      alert('生成诗号失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle
            className="text-xl font-bold"
            style={{ color: 'var(--ink-black)', fontFamily: 'var(--font-display)' }}
          >
            {character ? '编辑人物' : '创建人物'}
          </DialogTitle>
          <DialogDescription style={{ color: 'var(--text-muted)' }}>
            {character ? '修改人物信息' : '创建新的人物角色'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <div className="space-y-4">
            <h3
              className="text-base font-semibold"
              style={{ color: 'var(--ink-black)' }}
            >
              基本信息
            </h3>

            {/* 姓名 */}
            <div className="space-y-2">
              <Label htmlFor="name" style={{ color: 'var(--ink-black)' }}>
                姓名 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="输入人物姓名"
                required
                className="bg-white dark:bg-gray-900/60"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* 昵称 */}
              <div className="space-y-2">
                <Label htmlFor="nickname" style={{ color: 'var(--ink-black)' }}>
                  昵称
                </Label>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={(e) =>
                    setFormData({ ...formData, nickname: e.target.value })
                  }
                  placeholder="输入昵称（可选）"
                  className="bg-white dark:bg-gray-900/60"
                />
              </div>

              {/* 年龄 */}
              <div className="space-y-2">
                <Label htmlFor="age" style={{ color: 'var(--ink-black)' }}>
                  年龄
                </Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: e.target.value })
                  }
                  placeholder="输入年龄"
                  min="0"
                  className="bg-white dark:bg-gray-900/60"
                />
              </div>
            </div>

            {/* 性别 */}
            <div className="space-y-2">
              <Label htmlFor="gender" style={{ color: 'var(--ink-black)' }}>
                性别
              </Label>
              <Select
                value={formData.gender}
                onValueChange={(value: 'male' | 'female' | 'other') =>
                  setFormData({ ...formData, gender: value })
                }
              >
                <SelectTrigger className="bg-white dark:bg-gray-900/60">
                  <SelectValue placeholder="选择性别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">男</SelectItem>
                  <SelectItem value="female">女</SelectItem>
                  <SelectItem value="other">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 性格标签 */}
          <div className="space-y-2">
            <Label htmlFor="personality" style={{ color: 'var(--ink-black)' }}>
              性格标签
            </Label>
            <Input
              id="personality"
              value={formData.personality}
              onChange={(e) =>
                setFormData({ ...formData, personality: e.target.value })
              }
              placeholder="用逗号分隔，例如：勇敢, 热情, 冲动"
              className="bg-white dark:bg-gray-900/60"
            />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              多个标签用逗号分隔
            </p>
          </div>

          {/* 说话风格 */}
          <div className="space-y-2">
            <Label htmlFor="speechStyle" style={{ color: 'var(--ink-black)' }}>
              说话风格
            </Label>
            <Textarea
              id="speechStyle"
              value={formData.speechStyle}
              onChange={(e) =>
                setFormData({ ...formData, speechStyle: e.target.value })
              }
              placeholder="描述人物的说话方式、口头禅等"
              rows={3}
              className="bg-white dark:bg-gray-900/60"
            />
          </div>

          {/* 行为模式 */}
          <div className="space-y-2">
            <Label htmlFor="behaviorPattern" style={{ color: 'var(--ink-black)' }}>
              行为模式
            </Label>
            <Textarea
              id="behaviorPattern"
              value={formData.behaviorPattern}
              onChange={(e) =>
                setFormData({ ...formData, behaviorPattern: e.target.value })
              }
              placeholder="描述人物的行为习惯、动作特点等"
              rows={3}
              className="bg-white dark:bg-gray-900/60"
            />
          </div>

          {/* 背景故事 */}
          <div className="space-y-2">
            <Label htmlFor="backstory" style={{ color: 'var(--ink-black)' }}>
              背景故事
            </Label>
            <Textarea
              id="backstory"
              value={formData.backstory}
              onChange={(e) =>
                setFormData({ ...formData, backstory: e.target.value })
              }
              placeholder="描述人物的身世、经历、动机等"
              rows={4}
              className="bg-white dark:bg-gray-900/60"
            />
          </div>

          {/* 诗号 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="poem" style={{ color: 'var(--ink-black)' }}>
                诗号
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGeneratePoem}
                disabled={isGenerating || !formData.name}
                className="gap-1"
              >
                <IconifyIcon
                  icon={isGenerating ? 'mdi:loading' : 'mdi:magic-staff'}
                  className={cn(
                    'text-base',
                    isGenerating && 'animate-spin'
                  )}
                />
                {isGenerating ? '生成中...' : '生成诗号'}
              </Button>
            </div>
            <Textarea
              id="poem"
              value={formData.poem}
              onChange={(e) =>
                setFormData({ ...formData, poem: e.target.value })
              }
              placeholder="输入人物诗号（可选）或点击按钮生成"
              rows={2}
              className="bg-white dark:bg-gray-900/60"
              style={{ fontFamily: 'var(--font-display)' }}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={!formData.name}
              className="gap-1"
              style={{
                backgroundColor: 'var(--brand-gold)',
                color: 'white',
              }}
            >
              <IconifyIcon icon="mdi:check" className="text-base" />
              {character ? '保存' : '创建'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
