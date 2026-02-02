/* ==================================================
   纯文本导出 API 路由
   Text Export API Route
   ================================================== */

import { NextRequest, NextResponse } from 'next/server';
import { getProjectById } from '@/lib/db/queries/projects';
import { getScenesByProjectId } from '@/lib/db/queries/scenes';
import { toPlainText, toFountain } from '@/lib/utils/script-export';
import { getSessionWithDev } from '@/lib/session';
import { updateExportProgress } from '../progress/route';

/* ==================================================
   POST /api/export/text
   导出剧本为纯文本格式
   ================================================== */

export async function POST(request: NextRequest) {
  let projectId = '';
  
  try {
    // 认证检查
    const session = await getSessionWithDev();
    if (!session?.user) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    // 解析请求体
    const body = await request.json();
    const { projectId: pid, format = 'txt', options = {} } = body;
    projectId = pid;

    if (!projectId) {
      return NextResponse.json(
        { error: '缺少项目ID' },
        { status: 400 }
      );
    }

    // 更新进度 - 准备中
    updateExportProgress(projectId, session.user.id, {
      status: 'preparing',
      progress: 20,
      message: '准备导出数据...',
    });

    // 获取项目数据
    const project = await getProjectById(projectId);
    if (!project) {
      updateExportProgress(projectId, session.user.id, {
        status: 'error',
        progress: 0,
        message: '项目不存在',
      });
      return NextResponse.json(
        { error: '项目不存在' },
        { status: 404 }
      );
    }

    // 权限检查
    if (project.userId !== session.user.id) {
      updateExportProgress(projectId, session.user.id, {
        status: 'error',
        progress: 0,
        message: '无权访问此项目',
      });
      return NextResponse.json(
        { error: '无权访问此项目' },
        { status: 403 }
      );
    }

    // 更新进度 - 获取数据中
    updateExportProgress(projectId, session.user.id, {
      status: 'preparing',
      progress: 40,
      message: '获取场景数据...',
    });

    // 获取场景数据
    const scenes = await getScenesByProjectId(projectId);

    // 更新进度 - 生成内容
    updateExportProgress(projectId, session.user.id, {
      status: 'generating',
      progress: 70,
      message: `生成 ${format.toUpperCase()} 内容...`,
    });

    let content: string;
    let fileName: string;
    let contentType: string;

    switch (format) {
      case 'fountain':
        content = toFountain(project, scenes, options);
        fileName = `${project.name}-剧本.fountain`;
        contentType = 'text/plain';
        break;
      case 'txt':
      default:
        content = toPlainText(project, scenes, options);
        fileName = `${project.name}-剧本.txt`;
        contentType = 'text/plain; charset=utf-8';
        break;
    }

    // 更新进度 - 完成
    updateExportProgress(projectId, session.user.id, {
      status: 'completed',
      progress: 100,
      message: '导出完成',
    });

    // 生成 Buffer
    const buffer = Buffer.from(content, 'utf-8');
    const encodedFileName = encodeURIComponent(fileName);

    // 返回文本文件
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`,
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Text export error:', error);
    
    // 更新错误进度
    if (projectId) {
      updateExportProgress(projectId, '', {
        status: 'error',
        progress: 0,
        message: '文本导出失败',
      });
    }
    
    return NextResponse.json(
      { 
        error: '文本导出失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

/* ==================================================
   配置
   ================================================== */

export const runtime = 'nodejs';
