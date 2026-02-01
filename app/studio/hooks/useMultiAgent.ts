"use client";

import { useState, useCallback, useRef } from 'react';
import { Agent, Message, CollaborationSession, AgentType, AgentStatus, MessageType, ControlAction } from '../types';

// 默认 Agent 配置
const DEFAULT_AGENTS: Agent[] = [
  {
    id: 'doctor',
    name: '剧本医生',
    title: 'Doctor',
    element: '金',
    color: '#FFD700',
    icon: 'medical-icon:doctor',
    description: '格式检查、结构优化、逻辑审查',
    personality: '精准、严谨、直接',
    status: 'idle',
    isActive: true,
  },
  {
    id: 'coach',
    name: '角色教练',
    title: 'Coach',
    element: '水',
    color: '#3B82F6',
    icon: 'game-icons:teacher',
    description: '人物塑造、对白优化、性格一致性',
    personality: '智慧、灵活、深邃',
    status: 'idle',
    isActive: true,
  },
  {
    id: 'plot',
    name: '情节策划',
    title: 'Plotter',
    element: '火',
    color: '#EF4444',
    icon: 'game-icons:fireflake',
    description: '剧情设计、冲突构建、反转构思',
    personality: '热情、大胆、启发',
    status: 'idle',
    isActive: true,
  },
  {
    id: 'scene',
    name: '场景设计',
    title: 'Scenic',
    element: '木',
    color: '#10B981',
    icon: 'game-icons:forest',
    description: '场景描写、氛围营造、视觉呈现',
    personality: '温和、成长、创造力',
    status: 'idle',
    isActive: true,
  },
  {
    id: 'world',
    name: '世界观构建',
    title: 'World',
    element: '土',
    color: '#8B5CF6',
    icon: 'game-icons:world',
    description: '设定整理、一致性检查、背景完善',
    personality: '稳重、可靠、包容',
    status: 'idle',
    isActive: true,
  },
];

export function useMultiAgent() {
  const [agents, setAgents] = useState<Agent[]>(DEFAULT_AGENTS);
  const [messages, setMessages] = useState<Message[]>([]);
  const [session, setSession] = useState<CollaborationSession | null>(null);
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const messageIdRef = useRef(0);

  const generateMessageId = () => {
    messageIdRef.current += 1;
    return `msg_${Date.now()}_${messageIdRef.current}`;
  };

  // 更新 Agent 状态
  const updateAgentStatus = useCallback((agentId: AgentType, status: AgentStatus) => {
    setAgents(prev =>
      prev.map(agent =>
        agent.id === agentId ? { ...agent, status } : agent
      )
    );
  }, []);

  // 切换 Agent 激活状态
  const toggleAgent = useCallback((agentId: AgentType) => {
    setAgents(prev =>
      prev.map(agent =>
        agent.id === agentId ? { ...agent, isActive: !agent.isActive } : agent
      )
    );
  }, []);

  // 添加消息
  const addMessage = useCallback((type: MessageType, content: string, agentId?: AgentType, metadata?: Message['metadata']) => {
    const newMessage: Message = {
      id: generateMessageId(),
      type,
      agentId,
      content,
      timestamp: new Date(),
      metadata,
    };
    
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  // 发送用户消息
  const sendUserMessage = useCallback((content: string) => {
    addMessage('user', content);
    
    // 触发协作流程
    if (!isCollaborating) {
      startCollaboration();
    }
  }, [addMessage, isCollaborating]);

  // 开始协作
  const startCollaboration = useCallback(() => {
    setIsCollaborating(true);
    setIsPaused(false);
    
    // 创建新会话
    const newSession: CollaborationSession = {
      id: `session_${Date.now()}`,
      title: '多 Agent 协作会话',
      agents: agents.filter(a => a.isActive).map(a => a.id),
      messages: [],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setSession(newSession);
    
    // 添加系统消息
    addMessage('system', '多 Agent 协作已开始，正在分析问题...');
    
    // 模拟激活的 Agents 开始工作
    const activeAgents = agents.filter(a => a.isActive);
    activeAgents.forEach((agent, index) => {
      setTimeout(() => {
        updateAgentStatus(agent.id, 'thinking');
      }, index * 500);
    });
  }, [agents, addMessage, updateAgentStatus]);

  // 结束协作
  const endCollaboration = useCallback(() => {
    setIsCollaborating(false);
    setIsPaused(false);
    
    // 重置所有 Agent 状态
    setAgents(prev =>
      prev.map(agent => ({ ...agent, status: 'idle' }))
    );
    
    if (session) {
      setSession({ ...session, status: 'completed', updatedAt: new Date() });
    }
    
    addMessage('system', '协作会话已结束');
  }, [session, addMessage]);

  // 控制操作
  const handleControlAction = useCallback((action: ControlAction) => {
    switch (action) {
      case 'pause':
        setIsPaused(true);
        addMessage('system', '协作已暂停');
        break;
      case 'resume':
        setIsPaused(false);
        addMessage('system', '协作已恢复');
        break;
      case 'intervene':
        addMessage('system', '用户介入，等待用户输入...');
        break;
      case 'skip':
        addMessage('system', '跳过当前步骤');
        break;
      case 'reset':
        setMessages([]);
        setIsCollaborating(false);
        setIsPaused(false);
        setAgents(prev => prev.map(a => ({ ...a, status: 'idle' })));
        addMessage('system', '会话已重置');
        break;
    }
  }, [addMessage]);

  // 模拟接收 Agent 消息（用于演示）
  const simulateAgentResponse = useCallback((agentId: AgentType, content: string) => {
    updateAgentStatus(agentId, 'working');
    
    setTimeout(() => {
      addMessage('agent', content, agentId);
      updateAgentStatus(agentId, 'completed');
    }, 1000);
  }, [addMessage, updateAgentStatus]);

  // 模拟协作讨论
  const simulateCollaboration = useCallback(() => {
    const activeAgents = agents.filter(a => a.isActive);
    
    // 模拟协作流程
    const collaborationFlow = [
      { agentId: 'doctor' as AgentType, content: '从结构上看，这个场景的开头可以更紧凑一些，建议删减冗余的描述。', delay: 1000 },
      { agentId: 'coach' as AgentType, content: '我同意剧本医生的看法。同时，主角的动机在这里可以更明确，建议增加内心独白。', delay: 2500 },
      { agentId: 'scene' as AgentType, content: '关于场景氛围，我建议增加一些光影描写，让情绪更有层次感。', delay: 4000 },
      { agentId: 'world' as AgentType, content: '设定上没有问题，这个场景符合我们之前建立的世界观。', delay: 5500 },
      { agentId: 'plot' as AgentType, content: '综合大家的建议，我认为这里可以设置一个小反转，让主角的动机在最后一刻揭晓。', delay: 7000 },
    ];
    
    collaborationFlow.forEach(({ agentId, content, delay }) => {
      if (activeAgents.find(a => a.id === agentId)) {
        setTimeout(() => {
          if (!isPaused) {
            simulateAgentResponse(agentId, content);
          }
        }, delay);
      }
    });
    
    // 结束协作
    setTimeout(() => {
      if (!isPaused) {
        addMessage('system', '多 Agent 协作完成，已生成综合建议');
        setIsCollaborating(false);
        setAgents(prev => prev.map(a => ({ ...a, status: 'idle' })));
      }
    }, 9000);
  }, [agents, isPaused, addMessage, simulateAgentResponse]);

  return {
    agents,
    messages,
    session,
    isCollaborating,
    isPaused,
    updateAgentStatus,
    toggleAgent,
    addMessage,
    sendUserMessage,
    startCollaboration,
    endCollaboration,
    handleControlAction,
    simulateAgentResponse,
    simulateCollaboration,
  };
}
