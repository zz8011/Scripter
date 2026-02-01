"use client";

import { useRef, useEffect } from 'react';
import { Message, Agent, AgentType } from '../types';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { 
  Stethoscope, 
  Droplets, 
  Flame, 
  TreePine, 
  Globe,
  User,
  Bot,
  Sparkles
} from 'lucide-react';

interface ChatAreaProps {
  messages: Message[];
  agents: Agent[];
}

const agentIcons: Record<AgentType, React.ReactNode> = {
  doctor: <Stethoscope className="w-4 h-4" />,
  coach: <Droplets className="w-4 h-4" />,
  plot: <Flame className="w-4 h-4" />,
  scene: <TreePine className="w-4 h-4" />,
  world: <Globe className="w-4 h-4" />,
};

const agentNames: Record<AgentType, string> = {
  doctor: '剧本医生',
  coach: '角色教练',
  plot: '情节策划',
  scene: '场景设计',
  world: '世界观构建',
};

const agentColors: Record<AgentType, string> = {
  doctor: '#FFD700',
  coach: '#3B82F6',
  plot: '#EF4444',
  scene: '#10B981',
  world: '#8B5CF6',
};

export function ChatArea({ messages, agents }: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const renderMessage = (message: Message) => {
    const isUser = message.type === 'user';
    const isSystem = message.type === 'system';
    const agent = message.agentId ? agents.find(a => a.id === message.agentId) : null;

    if (isSystem) {
      return (
        <div key={message.id} className="flex justify-center my-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-xs text-muted-foreground">
            <Sparkles className="w-3 h-3" />
            <span>{message.content}</span>
            <span className="text-muted-foreground/60">
              {format(message.timestamp, 'HH:mm', { locale: zhCN })}
            </span>
          </div>
        </div>
      );
    }

    if (isUser) {
      return (
        <div key={message.id} className="flex justify-end mb-4">
          <div className="flex items-start gap-3 max-w-[80%]">
            <div className="flex-1">
              <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3">
                <p className="text-sm">{message.content}</p>
              </div>
              <div className="text-right mt-1">
                <span className="text-[10px] text-muted-foreground">
                  {format(message.timestamp, 'HH:mm', { locale: zhCN })}
                </span>
              </div>
            </div>
            <Avatar className="w-8 h-8 border-2 border-primary">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      );
    }

    // Agent 消息
    const agentColor = message.agentId ? agentColors[message.agentId] : '#6B7280';
    const agentIcon = message.agentId ? agentIcons[message.agentId] : <Bot className="w-4 h-4" />;
    const agentName = message.agentId ? agentNames[message.agentId] : 'Agent';

    return (
      <div key={message.id} className="flex justify-start mb-4">
        <div className="flex items-start gap-3 max-w-[80%]">
          <Avatar 
            className="w-8 h-8 border-2"
            style={{ borderColor: agentColor }}
          >
            <AvatarFallback 
              className="text-white"
              style={{ backgroundColor: agentColor }}
            >
              {agentIcon}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span 
                className="text-xs font-medium"
                style={{ color: agentColor }}
              >
                {agentName}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {format(message.timestamp, 'HH:mm', { locale: zhCN })}
              </span>
            </div>
            
            <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
              <p className="text-sm text-foreground">{message.content}</p>
              
              {message.metadata?.thinking && (
                <div className="mt-2 pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground italic">
                    💭 {message.metadata.thinking}
                  </p>
                </div>
              )}
              
              {message.metadata?.suggestions && message.metadata.suggestions.length > 0 && (
                <div className="mt-2 space-y-1">
                  {message.metadata.suggestions.map((suggestion, idx) => (
                    <div 
                      key={idx}
                      className="flex items-start gap-2 text-xs text-muted-foreground"
                    >
                      <span className="text-primary">•</span>
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="h-full flex flex-col bg-card/50 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">💬</span>
          <h2 className="font-semibold">协作对话</h2>
        </div>
        <div className="text-xs text-muted-foreground">
          {messages.length} 条消息
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 opacity-50" />
            </div>
            <p className="text-sm">开始对话，Agent 团队将为你服务</p>
            <p className="text-xs mt-1 opacity-60">输入问题，多个 Agent 将协作分析</p>
          </div>
        ) : (
          messages.map(renderMessage)
        )}
      </div>
    </Card>
  );
}
