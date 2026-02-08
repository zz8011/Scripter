/* ==================================================
   Word 导出 API 路由
   Word Export API Route
   ================================================== */

import { NextRequest, NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, PageBreak } from 'docx';
import { getProjectById } from '@/lib/db/queries/projects';
import { getScenesByProjectId } from '@/lib/db/queries/scenes';
import { toWordParagraphs } from '@/lib/utils/script-export';
import { getSessionWithDev } from '@/lib/session';
import { updateExportProgress } from '@/lib/export-progress';
import { ApiErrors, handleApiError } from '@/lib/errors/api-error';

/* ==================================================
   POST /api/export/word
   导出剧本为 Word 格式
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

    // 更新进度 - 转换数据
    updateExportProgress(projectId, session.user.id, {
      status: 'preparing',
      progress: 40,
      message: '转换文档格式...',
    });

    // 转换为 Word 段落结构
    const paragraphData = toWordParagraphs(
      { ...project, createdAt: project.createdAt.toISOString(), updatedAt: project.updatedAt.toISOString() },
      scenes.map(s => ({ ...s, createdAt: s.createdAt.toISOString() })), {
      includeTitlePage: options.includeTitlePage ?? true,
      includeSceneNumbers: options.includeSceneNumbers ?? true,
    });

    // 更新进度 - 构建文档
    updateExportProgress(projectId, session.user.id, {
      status: 'generating',
      progress: 60,
      message: '构建 Word 文档...',
    });

    // 构建 Word 段落
    const paragraphs: Paragraph[] = [];
    
    for (const data of paragraphData) {
      switch (data.type) {
        case 'title':
          paragraphs.push(
            new Paragraph({
              text: data.content,
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            })
          );
          break;
          
        case 'sceneHeading':
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: data.content,
                  bold: true,
                  size: 24, // 12pt
                }),
              ],
              spacing: { before: 400, after: 200 },
              shading: {
                fill: 'F5F5F5',
              },
            })
          );
          break;
          
        case 'character':
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: data.content,
                  bold: true,
                  size: 24,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 300, after: 100 },
            })
          );
          break;
          
        case 'dialogue':
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: data.content,
                  size: 24,
                }),
              ],
              indent: {
                left: 1440, // 1 inch = 1440 twips
                right: 1440,
              },
              spacing: { after: 200 },
            })
          );
          break;
          
        case 'parenthetical':
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: data.content,
                  italics: true,
                  size: 24,
                }),
              ],
              alignment: AlignmentType.CENTER,
              indent: {
                left: 1800,
                right: 1800,
              },
              spacing: { after: 100 },
            })
          );
          break;
          
        case 'action':
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: data.content,
                  size: 24,
                }),
              ],
              spacing: { after: 200 },
            })
          );
          break;
          
        case 'pageBreak':
          paragraphs.push(
            new Paragraph({
              children: [new PageBreak()],
            })
          );
          break;
          
        default:
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: data.content,
                  size: 24,
                }),
              ],
              spacing: { after: 100 },
            })
          );
      }
    }

    // 更新进度 - 生成文件
    updateExportProgress(projectId, session.user.id, {
      status: 'generating',
      progress: 80,
      message: '生成 Word 文件...',
    });

    // 创建 Word 文档
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440,    // 1 inch
                right: 1152,  // 0.8 inch
                bottom: 1440, // 1 inch
                left: 1152,   // 0.8 inch
              },
            },
          },
          children: paragraphs,
        },
      ],
    });

    // 生成 Word 文件
    const buffer = await Packer.toBuffer(doc);

    // 更新进度 - 完成
    updateExportProgress(projectId, session.user.id, {
      status: 'completed',
      progress: 100,
      message: '导出完成',
    });

    // 生成文件名
    const fileName = `${project.name}-剧本.docx`;
    const encodedFileName = encodeURIComponent(fileName);

    // 返回 Word 文件
    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`,
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Word export error:', error);

    // 更新错误进度
    if (projectId) {
      updateExportProgress(projectId, '', {
        status: 'error',
        progress: 0,
        message: 'Word导出失败',
      });
    }

    return handleApiError(error);
  }
}

/* ==================================================
   配置
   ================================================== */

export const runtime = 'nodejs';
export const maxDuration = 30; // 最大执行时间 30 秒
