/* ==================================================
   编辑器 AI Hook
   Editor AI Hook
   ================================================== */

'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

/* ==================================================
   类型定义 Type Definitions
   ================================================== */

export interface PolishResult {
  original: string;
  polished: string;
  alternatives: string[];
  explanation: string;
}

export interface ExpandResult {
  original: string;
  expanded: string;
  additions: Array<{
    type: string;
    content: string;
    position: 'before' | 'after' | 'inline';
  }>;
  explanation: string;
}

export interface FixResult {
  fixed: boolean;
  content: string;
  errors: Array<{
    type: string;
    line: number;
    message: string;
    suggestion: string;
  }>;
  changes: string[];
}

/* ==================================================
   useEditorAI Hook
   ================================================== */

export function useEditorAI() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  /**
   * 润色对白
   */
  const polishDialogue = useCallback(
    async (
      dialogue: string,
      characterName: string,
      options?: {
        style?: 'natural' | 'dramatic' | 'concise' | 'poetic';
        projectId?: string;
      }
    ): Promise<PolishResult | null> => {
      setIsLoading(true);

      try {
        // TODO: 替换为真实 API 调用
        // const response = await fetch('/api/ai/skills', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     skillId: 'dialogue-polish',
        //     input: {
        //       dialogue,
        //       characterName,
        //       style: options?.style || 'natural',
        //     },
        //     editorState: {
        //       projectId: options?.projectId || 'unknown',
        //     },
        //   }),
        // });

        // Mock 数据（用于 UI 测试）
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const mockResult: PolishResult = {
          original: dialogue,
          polished: `${dialogue}（已润色）`,
          alternatives: [
            `${dialogue}（备选方案1）`,
            `${dialogue}（备选方案2）`,
            `${dialogue}（备选方案3）`,
          ],
          explanation: '这是一个 Mock 润色结果，等待真实 API 接入。',
        };

        toast({
          title: '润色完成',
          description: '已生成润色建议，请查看预览',
          variant: 'default',
        });

        return mockResult;
      } catch (error) {
        console.error('Polish dialogue failed:', error);
        toast({
          title: '润色失败',
          description: error instanceof Error ? error.message : '无法连接到 AI 服务',
          variant: 'destructive',
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  /**
   * 扩展场景
   */
  const expandScene = useCallback(
    async (
      sceneContent: string,
      options?: {
        expandType?: 'action' | 'description' | 'emotion' | 'dialogue';
        targetLength?: 'short' | 'medium' | 'long';
        projectId?: string;
      }
    ): Promise<ExpandResult | null> => {
      setIsLoading(true);

      try {
        // TODO: 替换为真实 API 调用
        // const response = await fetch('/api/ai/skills', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     skillId: 'scene-expand',
        //     input: {
        //       sceneContent,
        //       expandType: options?.expandType || 'action',
        //       targetLength: options?.targetLength || 'medium',
        //     },
        //     editorState: {
        //       projectId: options?.projectId || 'unknown',
        //     },
        //   }),
        // });

        // Mock 数据（用于 UI 测试）
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const mockResult: ExpandResult = {
          original: sceneContent,
          expanded: `${sceneContent}\n\n（这里是扩展的内容，增加了动作描写和环境细节）`,
          additions: [
            {
              type: 'action',
              content: '李明缓缓走进咖啡厅，目光扫过每一个角落。',
              position: 'after',
            },
            {
              type: 'description',
              content: '咖啡厅里弥漫着淡淡的咖啡香气，柔和的爵士乐在空气中流淌。',
              position: 'inline',
            },
          ],
          explanation: '这是一个 Mock 扩展结果，等待真实 API 接入。',
        };

        toast({
          title: '扩展完成',
          description: '已生成扩展内容，请查看预览',
          variant: 'default',
        });

        return mockResult;
      } catch (error) {
        console.error('Expand scene failed:', error);
        toast({
          title: '扩展失败',
          description: error instanceof Error ? error.message : '无法连接到 AI 服务',
          variant: 'destructive',
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  /**
   * 修复格式
   */
  const fixFormat = useCallback(
    async (
      content: string,
      options?: {
        format?: 'standard' | 'short-drama';
        projectId?: string;
      }
    ): Promise<FixResult | null> => {
      setIsLoading(true);

      try {
        // TODO: 替换为真实 API 调用
        // const response = await fetch('/api/ai/skills', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     skillId: 'format-fix',
        //     input: {
        //       content,
        //       format: options?.format || 'standard',
        //     },
        //     editorState: {
        //       projectId: options?.projectId || 'unknown',
        //     },
        //   }),
        // });

        // Mock 数据（用于 UI 测试）
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockResult: FixResult = {
          fixed: true,
          content: content,
          errors: [
            {
              type: 'scene-heading',
              line: 1,
              message: '场景标题格式不规范',
              suggestion: '建议使用：场1-1 日/内 咖啡厅 李明、张华',
            },
          ],
          changes: ['修复了场景标题格式', '调整了人物名称格式'],
        };

        toast({
          title: '格式检查完成',
          description: `发现 ${mockResult.errors.length} 个问题`,
          variant: mockResult.errors.length > 0 ? 'default' : 'default',
        });

        return mockResult;
      } catch (error) {
        console.error('Fix format failed:', error);
        toast({
          title: '格式检查失败',
          description: error instanceof Error ? error.message : '无法连接到 AI 服务',
          variant: 'destructive',
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  return {
    isLoading,
    polishDialogue,
    expandScene,
    fixFormat,
  };
}
