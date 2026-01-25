/* ==================================================
   世界观设定表单弹窗组件 Worldview Form Dialog Component
   Worldview Form Dialog Component
   ================================================== */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { IconifyIcon } from '@/components/IconifyIcon';
import { useWorldviewStore } from '@/lib/stores/worldviewStore';
import type { WorldviewItem } from '@/lib/types';

/* ==================================================
   组件接口 Component Interface
   ================================================== */

interface WorldviewFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: WorldviewItem | null;
  projectId: string;
}

/* ==================================================
   世界观设定表单弹窗 Worldview Form Dialog Component
   ================================================== */

export function WorldviewFormDialog({
  open,
  onOpenChange,
  item,
  projectId,
}: WorldviewFormDialogProps) {
  const { addItem, updateItem, getCategoriesByProject, addCategory } =
    useWorldviewStore();

  // 表单状态
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // 自定义分类状态
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // 获取当前项目的所有分类
  const allCategories = getCategoriesByProject(projectId);

  // 初始化表单
  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description);
      setCategory(item.category);
      setTags(item.tags || []);
    } else {
      // 如果没有选中分类，默认选择第一个分类
      if (!category && allCategories.length > 0) {
        setCategory(allCategories[0].id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, allCategories]);

  // 重置表单
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setTags([]);
    setTagInput('');
    setIsAddingCategory(false);
    setNewCategoryName('');
  };

  // 处理对话框关闭
  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  // 处理提交
  const handleSubmit = () => {
    if (!title.trim()) {
      alert('请输入标题');
      return;
    }

    if (!category) {
      alert('请选择分类');
      return;
    }

    const itemData = {
      projectId,
      category,
      title: title.trim(),
      description: description.trim(),
      tags: tags.length > 0 ? tags : undefined,
    };

    if (item) {
      updateItem(item.id, itemData);
    } else {
      addItem(itemData);
    }

    handleClose();
  };

  // 添加标签
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  // 删除标签
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // 处理回车添加标签
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // 添加新分类
  const handleAddCategory = () => {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) {
      alert('请输入分类名称');
      return;
    }

    // 检查是否已存在同名分类
    const exists = allCategories.some((cat) => cat.name === trimmedName);
    if (exists) {
      alert('该分类已存在');
      return;
    }

    addCategory({
      name: trimmedName,
      isDefault: false,
    });

    // 选择新创建的分类
    const newCategory = allCategories.find((cat) => cat.name === trimmedName);
    if (newCategory) {
      setCategory(newCategory.id);
    }

    setIsAddingCategory(false);
    setNewCategoryName('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {item ? '编辑世界观设定' : '创建世界观设定'}
          </DialogTitle>
          <DialogDescription>
            {item
              ? '修改世界观设定的详细信息'
              : '为你的故事世界添加新的设定'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {/* 标题 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">
              标题 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：灵气复苏大灾变"
              maxLength={100}
            />
          </div>

          {/* 分类 */}
          <div className="flex flex-col gap-2">
            <Label>
              分类 <span className="text-red-500">*</span>
            </Label>

            {/* 分类选择 */}
            {!isAddingCategory ? (
              <div className="flex gap-2">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          {cat.icon && (
                            <IconifyIcon icon={cat.icon} className="text-base" />
                          )}
                          <span>{cat.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setIsAddingCategory(true)}
                  title="添加新分类"
                >
                  <IconifyIcon icon="mdi:plus" className="text-base" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="输入新分类名称"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddCategory}
                  title="确认添加"
                >
                  <IconifyIcon icon="mdi:check" className="text-base" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setIsAddingCategory(false);
                    setNewCategoryName('');
                  }}
                  title="取消"
                >
                  <IconifyIcon icon="mdi:close" className="text-base" />
                </Button>
              </div>
            )}
          </div>

          {/* 描述 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="详细描述这个设定..."
              rows={6}
              maxLength={1000}
            />
            <div className="text-xs text-right text-muted-foreground">
              {description.length} / 1000
            </div>
          </div>

          {/* 标签 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="tags">标签</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="添加标签后按回车"
                maxLength={50}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
              >
                添加
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="gap-1 pl-2 pr-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-500"
                    >
                      <IconifyIcon icon="mdi:close" className="text-xs" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            取消
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim() || !category}
            style={{
              backgroundColor: 'var(--brand-gold)',
              color: 'white',
            }}
          >
            {item ? '保存修改' : '创建设定'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
