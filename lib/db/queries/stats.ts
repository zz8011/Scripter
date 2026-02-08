import { db } from '../index';
import { projects } from '../schema/projects';
import { scenes } from '../schema/scenes';
import { characters } from '../schema/characters';
import { eq, and, sql, desc, gte } from 'drizzle-orm';

/**
 * 获取用户的项目统计数据
 */
export async function getUserStats(userId: string) {
  // 获取项目总数
  const projectCountResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(projects)
    .where(eq(projects.userId, userId));

  const projectCount = projectCountResult[0]?.count || 0;

  // 获取总场景数
  const sceneCountResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(scenes)
    .innerJoin(projects, eq(scenes.projectId, projects.id))
    .where(eq(projects.userId, userId));

  const sceneCount = sceneCountResult[0]?.count || 0;

  // 获取总人物数
  const characterCountResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(characters)
    .innerJoin(projects, eq(characters.projectId, projects.id))
    .where(eq(projects.userId, userId));

  const characterCount = characterCountResult[0]?.count || 0;

  // 获取总字数（从场景内容中计算）
  const scenesWithContent = await db
    .select({ content: scenes.content })
    .from(scenes)
    .innerJoin(projects, eq(scenes.projectId, projects.id))
    .where(eq(projects.userId, userId));

  let totalWords = 0;
  for (const scene of scenesWithContent) {
    const wordCount = calculateWordCount(scene.content);
    totalWords += wordCount;
  }

  // 获取今日字数（今天更新的场景）
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayScenes = await db
    .select({ content: scenes.content })
    .from(scenes)
    .innerJoin(projects, eq(scenes.projectId, projects.id))
    .where(
      and(
        eq(projects.userId, userId),
        gte(scenes.createdAt, today)
      )
    );

  let todayWords = 0;
  for (const scene of todayScenes) {
    const wordCount = calculateWordCount(scene.content);
    todayWords += wordCount;
  }

  return {
    projectCount,
    sceneCount,
    characterCount,
    totalWords,
    todayWords,
  };
}

/**
 * 获取用户最近编辑的项目
 */
export async function getRecentProjects(userId: string, limit: number = 5) {
  const recentProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.updatedAt))
    .limit(limit);

  // 为每个项目获取统计数据
  const projectsWithStats = await Promise.all(
    recentProjects.map(async (project) => {
      // 场景数
      const sceneCountResult = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(scenes)
        .where(eq(scenes.projectId, project.id));

      const sceneCount = sceneCountResult[0]?.count || 0;

      // 人物数
      const characterCountResult = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(characters)
        .where(eq(characters.projectId, project.id));

      const characterCount = characterCountResult[0]?.count || 0;

      // 字数
      const projectScenes = await db
        .select({ content: scenes.content })
        .from(scenes)
        .where(eq(scenes.projectId, project.id));

      let wordCount = 0;
      for (const scene of projectScenes) {
        wordCount += calculateWordCount(scene.content);
      }

      return {
        ...project,
        sceneCount,
        characterCount,
        wordCount,
      };
    })
  );

  return projectsWithStats;
}

/**
 * 计算 TipTap JSON 内容的字数
 */
function calculateWordCount(content: unknown): number {
  if (!content || typeof content !== 'object') {
    return 0;
  }

  const contentObj = content as any;

  // 递归提取文本
  function extractText(node: any): string {
    if (!node) return '';

    let text = '';

    // 如果节点有 text 属性，直接返回
    if (node.text) {
      text += node.text;
    }

    // 如果节点有 content 数组，递归处理
    if (Array.isArray(node.content)) {
      for (const child of node.content) {
        text += extractText(child);
      }
    }

    return text;
  }

  const text = extractText(contentObj);

  // 计算中文字符数（不包括空格和标点）
  const chineseChars = text.match(/[\u4e00-\u9fa5]/g);
  const chineseCount = chineseChars ? chineseChars.length : 0;

  // 计算英文单词数
  const englishWords = text.match(/[a-zA-Z]+/g);
  const englishCount = englishWords ? englishWords.length : 0;

  // 总字数 = 中文字符数 + 英文单词数
  return chineseCount + englishCount;
}

/**
 * 获取项目的详细统计
 */
export async function getProjectStats(projectId: string) {
  // 场景数
  const sceneCountResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(scenes)
    .where(eq(scenes.projectId, projectId));

  const sceneCount = sceneCountResult[0]?.count || 0;

  // 人物数
  const characterCountResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(characters)
    .where(eq(characters.projectId, projectId));

  const characterCount = characterCountResult[0]?.count || 0;

  // 字数
  const projectScenes = await db
    .select({ content: scenes.content })
    .from(scenes)
    .where(eq(scenes.projectId, projectId));

  let wordCount = 0;
  for (const scene of projectScenes) {
    wordCount += calculateWordCount(scene.content);
  }

  return {
    sceneCount,
    characterCount,
    wordCount,
  };
}
