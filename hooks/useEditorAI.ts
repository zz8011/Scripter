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
        const response = await fetch('/api/ai/skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            skillId: 'dialogue-polish',
            input: {
              dialogue,
              characterName,
              style: options?.style || 'natural',
            },
            editorState: {
              projectId: options?.projectId || 'unknown',
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `API 请求失败: ${response.status}`);
        }

        const data = await response.json();

        // 转换 API 响应为 PolishResult 格式
        const result: PolishResult = {
          original: dialogue,
          polished: data.result.polished || dialogue,
          alternatives: data.result.alternatives || [],
          explanation: data.result.explanation || '',
        };

        toast({
          title: '润色完成',
          description: '已生成润色建议，请查看预览',
          variant: 'default',
        });

        return result;
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
        const response = await fetch('/api/ai/skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            skillId: 'scene-expand',
            input: {
              sceneContent,
              expandType: options?.expandType || 'action',
              targetLength: options?.targetLength || 'medium',
            },
            editorState: {
              projectId: options?.projectId || 'unknown',
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `API 请求失败: ${response.status}`);
        }

        const data = await response.json();

        // 转换 API 响应为 ExpandResult 格式
        const result: ExpandResult = {
          original: sceneContent,
          expanded: data.result.expanded || sceneContent,
          additions: data.result.additions || [],
          explanation: data.result.explanation || '',
        };

        toast({
          title: '扩展完成',
          description: '已生成扩展内容，请查看预览',
          variant: 'default',
        });

        return result;
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
        const response = await fetch('/api/ai/skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            skillId: 'format-fix',
            input: {
              content,
              format: options?.format || 'standard',
            },
            editorState: {
              projectId: options?.projectId || 'unknown',
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `API 请求失败: ${response.status}`);
        }

        const data = await response.json();

        // 转换 API 响应为 FixResult 格式
        const result: FixResult = {
          fixed: data.result.fixed || false,
          content: data.result.content || content,
          errors: data.result.errors || [],
          changes: data.result.changes || [],
        };

        toast({
          title: '格式检查完成',
          description: `发现 ${result.errors.length} 个问题`,
          variant: result.errors.length > 0 ? 'default' : 'default',
        });

        return result;
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
