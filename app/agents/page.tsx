/* ==================================================
   Agent Dashboard 页面
   Agent Dashboard Page
   ================================================== */

'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { IconifyIcon } from '@/components/IconifyIcon';
import { Card } from '@/components/ui/card';

interface AgentInfo {
  id: string;
  name: string;
  role: string;
  state: string;
}

interface AgentResult {
  agent: string;
  thought: {
    analysis: string;
    insights: string[];
    suggestions: string[];
    confidence: number;
  };
  action: {
    type: string;
    target: string;
    reason: string;
  };
}

interface TestResponse {
  success: boolean;
  stats: {
    agentCount: number;
    agents: AgentInfo[];
  };
  results: AgentResult[];
}

export default function AgentDashboardPage() {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  // 运行 Agent 测试
  const runAgentTest = async () => {
    try {
      setLoading(true);
      setError(null);
      setTestResults(null);

      const response = await fetch('/api/agents/test');
      const data: TestResponse = await response.json();

      if (data.success) {
        setTestResults(data);
      } else {
        setError('测试失败');
      }
    } catch (err) {
      console.error('Agent 测试失败:', err);
      setError('测试失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 渲染头部
  const header = (
    <div className="flex items-center justify-between">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Agent 工作台
        </h1>
        <p
          className="text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          多 Agent 协作系统
        </p>
      </div>

      <Button
        onClick={runAgentTest}
        disabled={loading}
        style={{
          backgroundColor: 'var(--brand-gold)',
          color: 'var(--button-text-on-dark)',
        }}
      >
        <IconifyIcon icon="mdi:play" className="mr-2" />
        {loading ? '运行中...' : '运行测试'}
      </Button>
    </div>
  );

  // 获取 Agent 角色对应的颜色
  const getAgentColor = (role: string) => {
    const colors: Record<string, string> = {
      'script-doctor': '#3B82F6',    // 蓝色
      'character-coach': '#8B5CF6',  // 紫色
      'scene-designer': '#F97316',    // 橙色
      'director': '#1A1A1A',         // 黑色
      'screenwriter': '#10B981',      // 绿色
      'reader': '#06B6D4',           // 青色
      'producer': '#C9A962',         // 金色
    };
    return colors[role] || '#6B7280';
  };

  // 获取 Agent 角色对应的图标
  const getAgentIcon = (role: string) => {
    const icons: Record<string, string> = {
      'script-doctor': 'mdi:stethoscope',
      'character-coach': 'mdi:mask',
      'scene-designer': 'mdi:palette',
      'director': 'mdi:film-strip',
      'screenwriter': 'mdi:pen',
      'reader': 'mdi:book-open',
      'producer': 'mdi:coins',
    };
    return icons[role] || 'mdi:robot';
  };

  return (
    <MainLayout header={header}>
      <div className="p-8 space-y-8">
        {/* 错误提示 */}
        {error && (
          <div
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: 'var(--error-bg)',
              borderColor: 'var(--error-border)',
              color: 'var(--error)text)',
            }}
          >
            <div className="flex items-center gap-2">
              <IconifyIcon icon="mdi:alert-circle" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Agent 概览 */}
        {testResults && (
          <div>
            <h2
              className="text-xl font-semibold mb-4"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Agent 概览
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {testResults.stats.agents.map((agent) => (
                <Card
                  key={agent.id}
                  className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedAgent(agent.id)}
                  style={{
                    borderLeft: `4px solid ${getAgentColor(agent.role)}`,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{
                        backgroundColor: `${getAgentColor(agent.role)}20`,
                      }}
                    >
                      <IconifyIcon
                        icon={getAgentIcon(agent.role)}
                        className="text-2xl"
                        style={{ color: getAgentColor(agent.role) }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{agent.name}</h3>
                      <p
                        className="text-xs mt-1"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {agent.role}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded text-xs"
                          style={{
                            backgroundColor:
                              agent.state === 'idle'
                                ? 'var(--success-bg)'
                                : 'var(--info-bg)',
                            color:
                              agent.state === 'idle'
                                ? 'var(--success-text)'
                                : 'var(--info-text)',
                          }}
                        >
                          {agent.state}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Agent 结果详情 */}
        {testResults && selectedAgent && (
          <div>
            <h2
              className="text-xl font-semibold mb-4"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Agent 分析结果
            </h2>
            {testResults.results
              .filter((r) => r.agent.includes(selectedAgent))
              .map((result, index) => (
                <Card key={index} className="p-6 mb-4">
                  <div className="space-y-4">
                    {/* 思考结果 */}
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <IconifyIcon icon="mdi:brain" />
                        思考结果
                      </h3>
                      <div
                        className="p-4 rounded-lg"
                        style={{
                          backgroundColor: 'var(--hover-bg)',
                        }}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {result.thought.analysis}
                        </p>
                      </div>
                    </div>

                    {/* 洞察 */}
                    {result.thought.insights.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <IconifyIcon icon="mdi:lightbulb" />
                          洞察
                        </h3>
                        <ul className="space-y-2">
                          {result.thought.insights.map((insight, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm"
                            >
                              <span
                                className="mt-1"
                                style={{ color: 'var(--brand-gold)' }}
                              >
                                •
                              </span>
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 建议 */}
                    {result.thought.suggestions.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <IconifyIcon icon="mdi:lightbulb-on" />
                          建议
                        </h3>
                        <ul className="space-y-2">
                          {result.thought.suggestions.map((suggestion, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm"
                            >
                              <span
                                className="mt-1"
                                style={{ color: 'var(--brand-gold)' }}
                              >
                                •
                              </span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 置信度 */}
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <IconifyIcon icon="mdi:gauge" />
                        置信度
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${result.thought.confidence * 100}%`,
                              backgroundColor: 'var(--brand-gold)',
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {(result.thought.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    {/* 行动 */}
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <IconifyIcon icon="mdi:run" />
                        行动
                      </h3>
                      <div
                        className="p-4 rounded-lg"
                        style={{
                          backgroundColor: 'var(--hover-bg)',
                        }}
                      >
                        <div className="space-y-2 text-sm">
                          <div>
                            <span
                              style={{ color: 'var(--text-muted)' }}
                            >
                              类型：
                            </span>{' '}
                            {result.action.type}
                          </div>
                          <div>
                            <span
                              style={{ color: 'var(--text-muted)' }}
                            >
                              目标：
                            </span>{' '}
                            {result.action.target}
                          </div>
                          <div>
                            <span
                              style={{ color: 'var(--text-muted)' }}
                            >
                              原因：
                            </span>{' '}
                            {result.action.reason}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        )}

        {/* 空状态 */}
        {!testResults && !loading && (
          <div
            className="text-center py-16 rounded-lg border-2 border-dashed"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <IconifyIcon
              icon="mdi:robot"
              className="text-6xl mx-auto mb-4"
              style={{ color: 'var(--text-muted)' }}
            />
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: 'var(--ink-black)' }}
            >
              多 Agent 协作系统
            </h3>
            <p
              className="text-sm mb-6"
              style={{ color: 'var(--text-muted)' }}
            >
              点击"运行测试"按钮，启动 Agent 协作
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

