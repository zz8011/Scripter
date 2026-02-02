/* ==================================================
   制作准备文档导出 API 路由
   Production Documents Export API Route
   ================================================== */

import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getProjectById } from '@/lib/db/queries/projects';
import { getScenesByProjectId } from '@/lib/db/queries/scenes';
import { getCharactersByProjectId } from '@/lib/db/queries/characters';
import { getSessionWithDev } from '@/lib/session';
import { logger } from '@/lib/logger';

/* ==================================================
   类型定义
   ================================================== */

interface CharacterRow {
  '序号': number;
  '角色名': string;
  '性别': string;
  '年龄': string;
  '职业': string;
  '性格特点': string;
  '戏份': string;
  '备注': string;
}

interface SceneRow {
  '场次': string;
  '集数': number;
  '场景号': number;
  '内外景': string;
  '时间': string;
  '地点': string;
  '人物': string;
  '页数估算': number;
  '备注': string;
}

interface ShotListRow {
  '场次': string;
  '镜号': number;
  '景别': string;
  '摄法': string;
  '画面内容': string;
  '台词/音效': string;
  '时长(秒)': number;
  '备注': string;
}

/* ==================================================
   辅助函数
   ================================================== */

/**
 * 解析 TipTap JSON 内容提取角色名
 */
function extractCharactersFromContent(content: unknown): string[] {
  const characters = new Set<string>();
  
  if (!content || typeof content !== 'object') return [];
  
  const extract = (node: unknown): void => {
    if (!node || typeof node !== 'object') return;
    
    const n = node as { type?: string; text?: string; content?: unknown[] };
    
    if (n.type === 'character' && n.text) {
      characters.add(n.text.trim());
    }
    
    if (n.content && Array.isArray(n.content)) {
      n.content.forEach(extract);
    }
  };
  
  extract(content);
  return Array.from(characters);
}

/**
 * 计算场景页数估算
 */
function estimateScenePages(scene: { content?: unknown }): number {
  if (!scene.content) return 1;
  
  let textLength = 0;
  
  const extractText = (node: unknown): void => {
    if (!node || typeof node !== 'object') return;
    
    const n = node as { type?: string; text?: string; content?: unknown[] };
    
    if (n.text) {
      textLength += n.text.length;
    }
    
    if (n.content && Array.isArray(n.content)) {
      n.content.forEach(extractText);
    }
  };
  
  extractText(scene.content);
  
  // 每页约 450 字
  return Math.max(0.5, Math.round((textLength / 450) * 10) / 10);
}

/**
 * 生成角色清单
 */
async function generateCharacterList(projectId: string): Promise<CharacterRow[]> {
  const characters = await getCharactersByProjectId(projectId);
  
  return characters.map((char, index) => ({
    '序号': index + 1,
    '角色名': char.name,
    '性别': char.basicInfo?.gender === 'male' ? '男' : char.basicInfo?.gender === 'female' ? '女' : '其他',
    '年龄': char.basicInfo?.age ? `${char.basicInfo.age}岁` : '-',
    '职业': char.basicInfo?.occupation || '-',
    '性格特点': char.personality?.join('、') || '-',
    '戏份': '-', // 数据库中没有戏份字段
    '备注': char.speechStyle ? `说话风格: ${char.speechStyle.slice(0, 20)}...` : '-',
  }));
}

/**
 * 生成场景列表
 */
async function generateSceneList(projectId: string): Promise<SceneRow[]> {
  const scenes = await getScenesByProjectId(projectId);
  
  return scenes.map((scene) => {
    const characters = extractCharactersFromContent(scene.content);
    
    return {
      '场次': `${scene.episodeNumber}-${scene.sceneNumber}`,
      '集数': scene.episodeNumber,
      '场景号': scene.sceneNumber,
      '内外景': scene.intExt === 'interior' ? '内景' : scene.intExt === 'exterior' ? '外景' : '内外景',
      '时间': scene.timeOfDay === 'day' ? '日' : scene.timeOfDay === 'night' ? '夜' : scene.timeOfDay === 'dawn' ? '晨' : '昏',
      '地点': scene.location || '-',
      '人物': characters.join('、') || '-',
      '页数估算': estimateScenePages(scene),
      '备注': '-',
    };
  });
}

/**
 * 生成场记表模板
 */
async function generateShotList(projectId: string): Promise<ShotListRow[]> {
  const scenes = await getScenesByProjectId(projectId);
  
  // 为每个场景生成示例分镜
  const rows: ShotListRow[] = [];
  
  for (const scene of scenes.slice(0, 5)) { // 只取前5场作为示例
    const sceneKey = `${scene.episodeNumber}-${scene.sceneNumber}`;
    
    // 为每个场景生成3个示例分镜
    for (let i = 1; i <= 3; i++) {
      rows.push({
        '场次': sceneKey,
        '镜号': i,
        '景别': i === 1 ? '全景' : i === 2 ? '中景' : '特写',
        '摄法': i === 1 ? '固定' : i === 2 ? '推' : '固定',
        '画面内容': `示例画面内容 ${i}`,
        '台词/音效': i === 2 ? '示例台词' : '环境音',
        '时长(秒)': i === 1 ? 5 : i === 2 ? 8 : 3,
        '备注': '示例数据，请根据实际情况修改',
      });
    }
  }
  
  return rows;
}

/* ==================================================
   POST /api/export/production
   导出制作准备文档（Excel 格式）
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
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: '缺少项目ID' },
        { status: 400 }
      );
    }

    // 获取项目数据
    const project = await getProjectById(projectId);
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

    // 生成各工作表数据
    const characterList = await generateCharacterList(projectId);
    const sceneList = await generateSceneList(projectId);
    const shotList = await generateShotList(projectId);

    // 创建工作簿
    const workbook = XLSX.utils.book_new();

    // 1. 角色清单表
    const characterSheet = XLSX.utils.json_to_sheet(characterList);
    // 设置列宽
    characterSheet['!cols'] = [
      { wch: 6 },   // 序号
      { wch: 12 },  // 角色名
      { wch: 8 },   // 性别
      { wch: 8 },   // 年龄
      { wch: 12 },  // 职业
      { wch: 20 },  // 性格特点
      { wch: 8 },   // 戏份
      { wch: 15 },  // 备注
    ];
    XLSX.utils.book_append_sheet(workbook, characterSheet, '角色清单');

    // 2. 场景列表表
    const sceneSheet = XLSX.utils.json_to_sheet(sceneList);
    sceneSheet['!cols'] = [
      { wch: 8 },   // 场次
      { wch: 6 },   // 集数
      { wch: 8 },   // 场景号
      { wch: 8 },   // 内外景
      { wch: 6 },   // 时间
      { wch: 15 },  // 地点
      { wch: 20 },  // 人物
      { wch: 10 },  // 页数估算
      { wch: 15 },  // 备注
    ];
    XLSX.utils.book_append_sheet(workbook, sceneSheet, '场景列表');

    // 3. 场记表模板
    const shotSheet = XLSX.utils.json_to_sheet(shotList);
    shotSheet['!cols'] = [
      { wch: 8 },   // 场次
      { wch: 6 },   // 镜号
      { wch: 8 },   // 景别
      { wch: 10 },  // 摄法
      { wch: 25 },  // 画面内容
      { wch: 20 },  // 台词/音效
      { wch: 10 },  // 时长
      { wch: 20 },  // 备注
    ];
    XLSX.utils.book_append_sheet(workbook, shotSheet, '场记表模板');

    // 4. 项目信息表
    const projectInfo = [
      { '项目': '项目名称', '内容': project.name },
      { '项目': '项目类型', '内容': project.scriptType === 'movie' ? '电影' : project.scriptType === 'series' ? '连续剧' : '短剧' },
      { '项目': '创建时间', '内容': new Date(project.createdAt).toLocaleDateString('zh-CN') },
      { '项目': '总场景数', '内容': sceneList.length },
      { '项目': '总角色数', '内容': characterList.length },
      { '项目': '预计总页数', '内容': sceneList.reduce((sum, s) => sum + s['页数估算'], 0).toFixed(1) },
      { '项目': '导出时间', '内容': new Date().toLocaleString('zh-CN') },
    ];
    const infoSheet = XLSX.utils.json_to_sheet(projectInfo);
    infoSheet['!cols'] = [{ wch: 15 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(workbook, infoSheet, '项目信息');

    // 生成 Excel 文件
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // 生成文件名
    const fileName = `${project.name}-制作准备文档.xlsx`;
    const encodedFileName = encodeURIComponent(fileName);

    // 返回 Excel 文件
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`,
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error) {
    logger.error('Production export error:', error instanceof Error ? error : undefined);
    
    return NextResponse.json(
      { 
        error: '制作准备文档导出失败',
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
