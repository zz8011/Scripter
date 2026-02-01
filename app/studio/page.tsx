"use client";

import { useCallback } from 'react';
import { AgentList } from './components/AgentList';
import { ChatArea } from './components/ChatArea';
import { ControlPanel } from './components/ControlPanel';
import { InputArea } from './components/InputArea';
import { CollaborationVisualization } from './components/CollaborationVisualization';
import { useMultiAgent } from './hooks/useMultiAgent';
import { useWebSocket } from './hooks/useWebSocket';
import { WebSocketMessage, ControlAction } from './types';

export default function StudioPage() {
  const {
    agents,
    messages,
    session,
    isCollaborating,
    isPaused,
    toggleAgent,
    sendUserMessage,
    handleControlAction,
    simulateCollaboration,
    addMessage,
    updateAgentStatus,
  } = useMultiAgent();

  // 处理 WebSocket 消息
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'agent_status': {
        const { agentId, status } = message.payload as { agentId: string; status: string };
        if (agentId && status) {
          updateAgentStatus(agentId as any, status as any);
        }
        break;
      }
      case 'agent_message': {
        const { agentId: msgAgentId, content, metadata } = message.payload as { 
          agentId: string; 
          content: string; 
          metadata?: any;
        };
        if (msgAgentId && content) {
          addMessage('agent', content, msgAgentId as any, metadata);
        }
        break;
      }
      case 'collaboration_start':
        addMessage('system', '协作会话已开始');
        break;
      case 'collaboration_end':
        addMessage('system', '协作会话已结束');
        break;
      case 'error':
        addMessage('system', `错误: ${(message.payload as any).message || '未知错误'}`);
        break;
    }
  }, [addMessage, updateAgentStatus]);

  // WebSocket 连接
  const { isConnected, sendMessage } = useWebSocket({
    url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws',
    onMessage: (message: WebSocketMessage) => {
      handleWebSocketMessage(message);
    },
    onConnect: () => {
      console.log('WebSocket connected');
    },
    onDisconnect: () => {
      console.log('WebSocket disconnected');
    },
  });

  // 发送用户消息
  const handleSendMessage = useCallback((content: string) => {
    sendUserMessage(content);
    
    // 发送到 WebSocket
    if (isConnected) {
      sendMessage({
        type: 'user_message',
        payload: { content, sessionId: session?.id },
      });
    } else {
      // 模拟协作流程（演示模式）
      simulateCollaboration();
    }
  }, [sendUserMessage, isConnected, sendMessage, session, simulateCollaboration]);

  // 处理控制操作
  const handleControl = useCallback((action: ControlAction) => {
    handleControlAction(action);
    
    // 发送到 WebSocket
    if (isConnected) {
      sendMessage({
        type: action === 'pause' || action === 'resume' ? 'collaboration_control' : 'user_message',
        payload: { action, sessionId: session?.id },
      });
    }
  }, [handleControlAction, isConnected, sendMessage, session]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border/50 flex items-center px-6 bg-card/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎭</span>
          <div>
            <h1 className="font-semibold text-lg">剧灵 - 多 Agent 创作室</h1>
            <p className="text-xs text-muted-foreground">
              AI 创作团队协作平台
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="text-xs text-muted-foreground">
            {isConnected ? (
              <span className="text-green-500">● 实时协作中</span>
            ) : (
              <span className="text-yellow-500">● 演示模式</span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Agent List */}
        <div className="w-72 shrink-0 p-4 border-r border-border/50">
          <AgentList 
            agents={agents} 
            onToggleAgent={toggleAgent} 
          />
        </div>

        {/* Center - Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 p-4 overflow-hidden">
            <ChatArea 
              messages={messages} 
              agents={agents} 
            />
          </div>

          {/* Input Area */}
          <div className="p-4 pt-0">
            <InputArea 
              onSend={handleSendMessage}
              isLoading={isCollaborating && !isPaused}
              disabled={isPaused}
            />
          </div>
        </div>

        {/* Right Sidebar - Visualization */}
        <div className="w-80 shrink-0 p-4 border-l border-border/50 space-y-4">
          <CollaborationVisualization
            agents={agents}
            messages={messages}
            isCollaborating={isCollaborating}
          />

          {/* Session Info */}
          {session && (
            <div className="p-3 rounded-lg bg-muted/50 text-xs space-y-1">
              <div className="font-medium">当前会话</div>
              <div className="text-muted-foreground">ID: {session.id.slice(0, 8)}...</div>
              <div className="text-muted-foreground">
                状态: {session.status === 'active' ? '进行中' : '已结束'}
              </div>
              <div className="text-muted-foreground">
                消息: {messages.length} 条
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Control Panel */}
      <div className="p-4 border-t border-border/50 bg-card/30 backdrop-blur-sm">
        <ControlPanel
          isCollaborating={isCollaborating}
          isPaused={isPaused}
          isConnected={isConnected}
          activeAgentCount={agents.filter(a => a.isActive).length}
          agentStatuses={agents.map(a => a.status)}
          onAction={handleControl}
        />
      </div>
    </div>
  );
}
