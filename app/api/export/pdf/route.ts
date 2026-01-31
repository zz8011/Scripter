/* ==================================================
   PDF 导出 API 路由
   PDF Export API Route
   ================================================== */

import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { getProject } from '@/lib/db/queries/projects';
import { getScenes } from '@/lib/db/queries/scenes';
import { toHTML } from '@/lib/utils/script-export';
import { getSessionWithDev } from '@/lib/session';

/* ==================================================
   POST /api/export/pdf
   导出剧本为 PDF 格式
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
    const { projectId, options = {} } = body;

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

    // 生成 HTML 内容
    const htmlContent = toHTML(project, scenes, {
      includeTitlePage: options.includeTitlePage ?? true,
      includeSceneNumbers: options.includeSceneNumbers ?? true,
      pageSize: options.pageSize ?? 'A4',
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
      await page.waitForTimeout(1000);

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

      // 生成文件名
      const fileName = `${project.name}-剧本.pdf`;
      const encodedFileName = encodeURIComponent(fileName);

      // 返回 PDF 文件
      return new NextResponse(pdfBuffer, {
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
    console.error('PDF export error:', error);
    
    return NextResponse.json(
      { 
        error: 'PDF导出失败',
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
export const maxDuration = 60; // 最大执行时间 60 秒
