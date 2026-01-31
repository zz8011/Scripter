/* ==================================================
   Word 导出 API 路由
   Word Export API Route
   ================================================== */

import { NextRequest, NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, PageBreak } from 'docx';
import { getProject } from '@/lib/db/queries/projects';
import { getScenes } from '@/lib/db/queries/scenes';
import { toWordParagraphs } from '@/lib/utils/script-export';
import { getSessionWithDev } from '@/lib/session';

/* ==================================================
   POST /api/export/word
   导出剧本为 Word 格式
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

    // 转换为 Word 段落结构
    const paragraphData = toWordParagraphs(project, scenes, {
      includeTitlePage: options.includeTitlePage ?? true,
      includeSceneNumbers: options.includeSceneNumbers ?? true,
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

    // 生成文件名
    const fileName = `${project.name}-剧本.docx`;
    const encodedFileName = encodeURIComponent(fileName);

    // 返回 Word 文件
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`,
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Word export error:', error);
    
    return NextResponse.json(
      { 
        error: 'Word导出失败',
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
export const maxDuration = 30; // 最大执行时间 30 秒
