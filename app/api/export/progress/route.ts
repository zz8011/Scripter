/* ==================================================
   导出进度 SSE API 路由
   Export Progress SSE API Route
   ================================================== */

import { NextRequest } from 'next/server';
import { getSessionWithDev } from '@/lib/session';
import { logger } from '@/lib/logger';
import { updateExportProgress, getExportProgress, type ExportProgressData } from '@/lib/export-progress';

/* ==================================================
   GET /api/export/progress
   SSE 端点，实时推送导出进度
   ================================================== */

export async function GET(request: NextRequest) {
  try {
    // 认证检查
    const session = await getSessionWithDev();
    if (!session?.user) {
      return new Response(
        JSON.stringify({ error: '未授权访问' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 获取项目 ID
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return new Response(
        JSON.stringify({ error: '缺少项目ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 创建 SSE 流
    const stream = new ReadableStream({
      start(controller) {
        // 发送初始状态
        const sendProgress = (data: ExportProgressData) => {
          const message = `data: ${JSON.stringify({
            status: data.status,
            progress: data.progress,
            message: data.message,
          })}\n\n`;
          
          controller.enqueue(new TextEncoder().encode(message));
        };

        // 立即发送当前状态
        const currentProgress = getExportProgress(projectId);
        if (currentProgress) {
          sendProgress(currentProgress);

          // 如果已完成或出错，关闭流
          if (currentProgress.status === 'completed' || 
              currentProgress.status === 'error' ||
              currentProgress.status === 'cancelled') {
            controller.close();
            return;
          }
        } else {
          // 发送初始状态
          sendProgress({
            projectId,
            userId: session.user.id,
            status: 'idle',
            progress: 0,
            message: '等待开始...',
            timestamp: Date.now(),
          });
        }

        // 设置轮询检查进度
        const intervalId = setInterval(() => {
          const progress = getExportProgress(projectId);
          
          if (progress) {
            sendProgress(progress);

            // 如果已完成或出错，关闭流
            if (progress.status === 'completed' || 
                progress.status === 'error' ||
                progress.status === 'cancelled') {
              clearInterval(intervalId);
              controller.close();
            }
          }
        }, 500); // 每 500ms 检查一次

        // 处理客户端断开连接
        request.signal.addEventListener('abort', () => {
          clearInterval(intervalId);
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    logger.error('SSE progress error:', error instanceof Error ? error : undefined);
    
    return new Response(
      JSON.stringify({ 
        error: '获取进度失败',
        details: error instanceof Error ? error.message : '未知错误'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/* ==================================================
   POST /api/export/progress
   更新导出进度（供其他 API 调用）
   ================================================== */

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionWithDev();
    if (!session?.user) {
      return new Response(
        JSON.stringify({ error: '未授权访问' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { projectId, status, progress, message } = body;

    if (!projectId) {
      return new Response(
        JSON.stringify({ error: '缺少项目ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    updateExportProgress(projectId, session.user.id, {
      status,
      progress,
      message,
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    logger.error('Update progress error:', error instanceof Error ? error : undefined);
    
    return new Response(
      JSON.stringify({ error: '更新进度失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/* ==================================================
   配置
   ================================================== */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
