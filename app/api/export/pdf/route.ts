/* ==================================================
   PDF 导出 API 路由
   PDF Export API Route
   ================================================== */

import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { getProjectById } from '@/lib/db/queries/projects';
import { getScenesByProjectId } from '@/lib/db/queries/scenes';
import { toHTML } from '@/lib/utils/script-export';
import { getSessionWithDev } from '@/lib/session';
import { logger } from '@/lib/logger';
import { updateExportProgress } from '@/lib/export-progress';
import { ApiErrors, handleApiError } from '@/lib/errors/api-error';

/* ==================================================
   POST /api/export/pdf
   导出剧本为 PDF 格式
   ================================================== */

export async function POST(request: NextRequest) {
  let projectId = '';
  
  try {
    // 认证检查
    const session = await getSessionWithDev();
    if (!session?.user) {
      throw ApiErrors.unauthorized('请先登录后再导出剧本');
    }

    // 解析请求体
    const body = await request.json();
    const { projectId: pid, options = {} } = body;
    projectId = pid;

    if (!projectId) {
      throw ApiErrors.badRequest('缺少项目ID参数');
    }

    // 更新进度 - 准备中
    updateExportProgress(projectId, session.user.id, {
      status: 'preparing',
      progress: 10,
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
      throw ApiErrors.notFound('项目不存在');
    }

    // 权限检查
    if (project.userId !== session.user.id) {
      updateExportProgress(projectId, session.user.id, {
        status: 'error',
        progress: 0,
        message: '无权访问此项目',
      });
      throw ApiErrors.forbidden('无权访问此项目');
    }

    // 更新进度 - 获取数据中
    updateExportProgress(projectId, session.user.id, {
      status: 'preparing',
      progress: 25,
      message: '获取场景数据...',
    });

    // 获取场景数据
    const scenes = await getScenesByProjectId(projectId);

    // 更新进度 - 生成内容
    updateExportProgress(projectId, session.user.id, {
      status: 'generating',
      progress: 40,
      message: '生成 PDF 内容...',
    });

    // 生成 HTML 内容
    const htmlContent = toHTML(project, scenes, {
      includeTitlePage: options.includeTitlePage ?? true,
      includeSceneNumbers: options.includeSceneNumbers ?? true,
      pageSize: options.pageSize ?? 'A4',
    });

    // 更新进度 - 启动浏览器
    updateExportProgress(projectId, session.user.id, {
      status: 'generating',
      progress: 60,
      message: '启动渲染引擎...',
    });

    // 启动 Puppeteer
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    try {
      const page = await browser.newPage();
      
      // 设置 HTML 内容
      await page.setContent(htmlContent, {
        waitUntil: ['networkidle0', 'domcontentloaded'],
      });

      // 等待字体加载
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 更新进度 - 生成 PDF
      updateExportProgress(projectId, session.user.id, {
        status: 'generating',
        progress: 80,
        message: '生成 PDF 文件...',
      });

      // 生成 PDF
      const pdfBuffer = await page.pdf({
        format: options.pageSize === 'US-Letter' ? 'Letter' : 'A4',
        printBackground: true,
        margin: {
          top: '2.5cm',
          right: '2cm',
          bottom: '2.5cm',
          left: '2cm',
        },
      });

      // 更新进度 - 完成
      updateExportProgress(projectId, session.user.id, {
        status: 'completed',
        progress: 100,
        message: '导出完成',
      });

      // 生成文件名
      const fileName = `${project.name}-剧本.pdf`;
      const encodedFileName = encodeURIComponent(fileName);

      // 返回 PDF 文件
      return new NextResponse(pdfBuffer as unknown as BodyInit, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`,
          'Content-Length': pdfBuffer.length.toString(),
        },
      });
    } finally {
      await browser.close();
    }

  } catch (error) {
    logger.error('PDF export error:', error instanceof Error ? error : undefined);

    // 更新错误进度
    if (projectId) {
      updateExportProgress(projectId, '', {
        status: 'error',
        progress: 0,
        message: 'PDF导出失败',
      });
    }

    return handleApiError(error);
  }
}

/* ==================================================
   配置
   ================================================== */

export const runtime = 'nodejs';
export const maxDuration = 60; // 最大执行时间 60 秒


