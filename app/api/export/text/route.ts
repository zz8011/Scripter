/* ==================================================
   纯文本导出 API 路由
   Text Export API Route
   ================================================== */

import { NextRequest, NextResponse } from 'next/server';
import { getProject } from '@/lib/db/queries/projects';
import { getScenes } from '@/lib/db/queries/scenes';
import { toPlainText, toFountain } from '@/lib/utils/script-export';
import { getSessionWithDev } from '@/lib/session';

/* ==================================================
   POST /api/export/text
   导出剧本为纯文本格式
   ================================================== */

export async function POST(request: NextRequest) {
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
    const { projectId, format = 'txt', options = {} } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: '缺少项目ID' },
        { status: 400 }
      );
    }

    // 获取项目数据
    const project = await getProject(projectId);
    if (!project) {
      return NextResponse.json(
        { error: '项目不存在' },
        { status: 404 }
      );
    }

    // 权限检查
    if (project.userId !== session.user.id) {
      return NextResponse.json(
        { error: '无权访问此项目' },
        { status: 403 }
      );
    }

    // 获取场景数据
    const scenes = await getScenes(projectId);

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
