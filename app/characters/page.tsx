"use client";

import { useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { CharacterCard } from '@/components/ui-custom/CharacterCard';
import { CharacterFormDialog } from '@/components/ui-custom/CharacterFormDialog';
import { Button } from '@/components/ui/button';
import { IconifyIcon } from '@/components/IconifyIcon';
import { useCharacterStore } from '@/lib/stores/characterStore';
import { useProjectStore } from '@/lib/stores/projectStore';
import type { Character } from '@/lib/types';

export default function CharactersPage() {
  const { currentProject } = useProjectStore();
  const {
    characters,
    deleteCharacter,
    getCharactersByProject,
  } = useCharacterStore();

  // 本地状态
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);

  // 获取当前项目的人物列表
  const projectCharacters = currentProject
    ? getCharactersByProject(currentProject.id)
    : characters;

  // 处理创建人物
  const handleCreateCharacter = () => {
    setEditingCharacter(null);
    if (!currentProject) {
      alert('请先选择一个项目');
      return;
    }
    setIsDialogOpen(true);
  };

  // 处理编辑人物
  const handleEditCharacter = (character: Character) => {
    setEditingCharacter(character);
    setIsDialogOpen(true);
  };

  // 处理删除人物
  const handleDeleteCharacter = (character: Character) => {
    if (confirm(`确定要删除人物"${character.name}"吗？`)) {
      deleteCharacter(character.id);
    }
  };

  return (
    <MainLayout
      header={
        <div className="flex items-center justify-between">
          <h1
            className="font-display font-bold text-lg"
            style={{ color: 'var(--ink-black)' }}
          >
            人物管理 Characters
          </h1>

          {/* 创建人物按钮 */}
          <Button
            onClick={handleCreateCharacter}
            disabled={!currentProject}
            className="gap-2"
            style={{
              backgroundColor: 'var(--brand-gold)',
              color: 'white',
            }}
          >
            <IconifyIcon icon="mdi:plus" className="text-lg" />
            创建人物
          </Button>
        </div>
      }
    >
      <div className="p-10">
        {/* 项目提示 */}
        {!currentProject && (
          <div
            className="flex flex-col items-center justify-center rounded-lg p-12"
            style={{
              backgroundColor: 'var(--paper-bg)',
              border: '1px dashed var(--brand-gold)',
            }}
          >
            <IconifyIcon
              icon="mdi:folder-open-outline"
              className="text-6xl mb-4"
              style={{ color: 'var(--brand-gold)' }}
            />
            <h2
              className="text-xl font-semibold mb-2"
              style={{ color: 'var(--ink-black)' }}
            >
              请先选择项目
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              选择一个项目后即可管理该项目的人物
            </p>
          </div>
        )}

        {/* 人物列表 */}
        {currentProject && projectCharacters.length === 0 && (
          <div
            className="flex flex-col items-center justify-center rounded-lg p-12"
            style={{
              backgroundColor: 'var(--paper-bg)',
              border: '1px dashed var(--brand-gold)',
            }}
          >
            <IconifyIcon
              icon="mdi:account-multiple-outline"
              className="text-6xl mb-4"
              style={{ color: 'var(--brand-gold)' }}
            />
            <h2
              className="text-xl font-semibold mb-2"
              style={{ color: 'var(--ink-black)' }}
            >
              还没有人物
            </h2>
            <p className="mb-4" style={{ color: 'var(--text-muted)' }}>
              点击右上角&ldquo;创建人物&rdquo;按钮开始添加
            </p>
          </div>
        )}

        {currentProject && projectCharacters.length > 0 && (
          <div
            className="grid gap-6"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            }}
          >
            {projectCharacters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onEdit={() => handleEditCharacter(character)}
                onDelete={() => handleDeleteCharacter(character)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 人物表单弹窗 */}
      {currentProject && (
        <CharacterFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          character={editingCharacter}
          projectId={currentProject.id}
        />
      )}
    </MainLayout>
  );
}
