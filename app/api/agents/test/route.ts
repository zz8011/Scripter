/* ==================================================
   Agent 测试 API
   Agent Test API
   ================================================== */

import { NextRequest, NextResponse } from 'next/server';
import { AgentManager } from '@/lib/agents';
import { Context } from '@/lib/agents/core/types';

/**
 * GET /api/agents/test - 测试多 Agent 系统
 */
export async function GET(_request: NextRequest) {
  try {
    // 动态初始化 Agent Manager（避免构建时执行）
    const agentManager = AgentManager.getInstance();
    
    // 初始化 Agent
    await agentManager.initializeDefaultAgents();
    
    // 获取所有 Agent
    const agents = agentManager.getAllAgents();
    
    // 构建测试上下文
    const context: Context = {
      taskId: 'test-task-001',
      projectId: 'test-project-001',
      userId: 'test-user-001',
      script: {
        content: `第一场：咖啡馆 - 日

小明（30岁，程序员）坐在角落里，盯着电脑屏幕。

小明
（自言自语）
这个 bug 怎么这么难找...

小红（28岁，设计师）走过来，坐在他对面。

小红
怎么了？又遇到难题了？

小明
是啊，这个项目太复杂了。

小红
别急，慢慢来。我帮你看看。

两人凑近屏幕，开始讨论代码。`,
        metadata: {
          wordCount: 150,
          sceneCount: 1,
          characterCount: 2,
        },
      },
      projectSettings: {
        genre: ['剧情', '都市'],
        scriptType: 'movie',
        targetEpisodes: 1,
      },
      agentStates: new Map(),
      conversationHistory: [],
    };
    
    // 调度器执行 Agent
    const scheduler = agentManager.getAgentScheduler();
    const results = await scheduler.scheduleParallel(agents, context);
    
    // 返回结果
    return NextResponse.json({
      success: true,
      stats: agentManager.getStats(),
      results: results.map((r: { agent: { name: string }; thought: { analysis: string; insights: string[]; suggestions: string[]; confidence: number }; action: { type: string; target: string; reason: string } }) => ({
        agent: r.agent.name,
        thought: {
          analysis: r.thought.analysis.slice(0, 200) + '...',
          insights: r.thought.insights,
          suggestions: r.thought.suggestions,
          confidence: r.thought.confidence,
        },
        action: {
          type: r.action.type,
          target: r.action.target,
          reason: r.action.reason,
        },
      })),
    });
  } catch (error) {
    console.error('[API] Agent 测试失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

