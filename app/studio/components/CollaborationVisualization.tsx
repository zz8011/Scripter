"use client";

import { useEffect, useState } from 'react';
import { Agent, AgentType, Message } from '../types';
import { Card } from '@/components/ui/card';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Stethoscope, 
  Droplets, 
  Flame, 
  TreePine, 
  Globe,
  User,
  ArrowRight,
  MessageCircle
} from 'lucide-react';

interface CollaborationVisualizationProps {
  agents: Agent[];
  messages: Message[];
  isCollaborating: boolean;
}

const agentIcons: Record<AgentType, React.ReactNode> = {
  doctor: <Stethoscope className="w-4 h-4" />,
  coach: <Droplets className="w-4 h-4" />,
  plot: <Flame className="w-4 h-4" />,
  scene: <TreePine className="w-4 h-4" />,
  world: <Globe className="w-4 h-4" />,
};

const agentColors: Record<AgentType, string> = {
  doctor: '#FFD700',
  coach: '#3B82F6',
  plot: '#EF4444',
  scene: '#10B981',
  world: '#8B5CF6',
};

interface Activity {
  id: string;
  agentId: AgentType;
  action: 'speaking' | 'listening' | 'thinking' | 'responding';
  target?: AgentType;
  timestamp: Date;
}

export function CollaborationVisualization({
  agents,
  messages,
  isCollaborating,
}: CollaborationVisualizationProps) {
  const [activities, setActivities] = useState<Activity[]>([]);

  // 根据消息生成活动
  useEffect(() => {
    const latestMessages = messages.slice(-5);
    const newActivities: Activity[] = [];

    latestMessages.forEach((msg, idx) => {
      if (msg.type === 'agent' && msg.agentId) {
        newActivities.push({
          id: `${msg.id}_speak`,
          agentId: msg.agentId,
          action: 'speaking',
          timestamp: new Date(msg.timestamp.getTime() + idx * 100),
        });
      }
    });

    setActivities(newActivities.slice(-8));
  }, [messages]);

  const activeAgents = agents.filter(a => a.isActive);
  const centerX = 150;
  const centerY = 100;
  const radius = 80;

  const getAgentPosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  return (
    <Card className="h-full p-4 bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🕸️</span>
        <h3 className="font-semibold text-sm">协作可视化</h3>
      </div>

      <div className="relative w-full h-[200px]">
        <svg 
          viewBox="0 0 300 200" 
          className="w-full h-full"
        >
          {/* Connection Lines */}
          {isCollaborating && activeAgents.map((agent, i) => {
            const pos = getAgentPosition(i, activeAgents.length);
            return (
              <motion.line
                key={`line-${agent.id}`}
                x1={centerX}
                y1={centerY}
                x2={pos.x}
                y2={pos.y}
                stroke={agentColors[agent.id]}
                strokeWidth="1"
                strokeDasharray="4 4"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.3 }}
                transition={{ duration: 1, delay: i * 0.1 }}
              />
            );
          })}

          {/* Center - User/Gateway */}
          <motion.g
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <circle
              cx={centerX}
              cy={centerY}
              r="25"
              fill="hsl(var(--primary))"
              opacity="0.2"
            />
            <circle
              cx={centerX}
              cy={centerY}
              r="15"
              fill="hsl(var(--primary))"
            />
            <text
              x={centerX}
              y={centerY + 5}
              textAnchor="middle"
              fill="hsl(var(--primary-foreground))"
              fontSize="12"
            >
              👤
            </text>
          </motion.g>

          {/* Agents */}
          {activeAgents.map((agent, index) => {
            const pos = getAgentPosition(index, activeAgents.length);
            const isThinking = agent.status === 'thinking' || agent.status === 'working';
            const isCompleted = agent.status === 'completed';
            
            // 检查是否有活动
            const hasActivity = activities.some(a => a.agentId === agent.id);

            return (
              <motion.g
                key={agent.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  x: isThinking ? [0, -2, 2, -2, 2, 0] : 0,
                }}
                transition={{ 
                  scale: { duration: 0.5, delay: index * 0.1 },
                  opacity: { duration: 0.5, delay: index * 0.1 },
                  x: { duration: 0.5, repeat: isThinking ? Infinity : 0, repeatDelay: 1 }
                }}
              >
                {/* Agent Circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="20"
                  fill={agent.color}
                  opacity={isCompleted ? 0.8 : 1}
                  stroke={isThinking ? '#fff' : 'none'}
                  strokeWidth={isThinking ? 3 : 0}
                />

                {/* Activity Indicator */}
                {hasActivity && (
                  <motion.circle
                    cx={pos.x}
                    cy={pos.y}
                    r="25"
                    fill="none"
                    stroke={agent.color}
                    strokeWidth="2"
                    initial={{ scale: 0.8, opacity: 1 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}

                {/* Status Badge */}
                {(isThinking || isCompleted) && (
                  <circle
                    cx={pos.x + 12}
                    cy={pos.y - 12}
                    r="6"
                    fill={isThinking ? '#F59E0B' : '#10B981'}
                  />
                )}

                {/* Agent Label */}
                <text
                  x={pos.x}
                  y={pos.y + 35}
                  textAnchor="middle"
                  fill="currentColor"
                  fontSize="10"
                  className="text-foreground"
                >
                  {agent.name}
                </text>
              </motion.g>
            );
          })}
        </svg>

        {/* Activity Log */}
        <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
          <AnimatePresence mode="popLayout">
            {activities.slice(-3).map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center gap-2 text-xs text-muted-foreground mb-1"
              >
                <span 
                  className="font-medium"
                  style={{ color: agentColors[activity.agentId] }}
                >
                  {agents.find(a => a.id === activity.agentId)?.name}
                </span>
                <span>正在发言...</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );
}


