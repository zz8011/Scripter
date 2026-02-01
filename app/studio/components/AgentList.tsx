"use client";

import { Agent, AgentType } from '../types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Stethoscope, 
  Droplets, 
  Flame, 
  TreePine, 
  Globe,
  Plus,
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface AgentListProps {
  agents: Agent[];
  onToggleAgent: (agentId: AgentType) => void;
}

const agentIcons: Record<AgentType, React.ReactNode> = {
  doctor: <Stethoscope className="w-5 h-5" />,
  coach: <Droplets className="w-5 h-5" />,
  plot: <Flame className="w-5 h-5" />,
  scene: <TreePine className="w-5 h-5" />,
  world: <Globe className="w-5 h-5" />,
};

const statusConfig = {
  idle: { label: '待机', color: 'bg-gray-500', icon: null },
  thinking: { label: '思考中', color: 'bg-yellow-500', icon: <Loader2 className="w-3 h-3 animate-spin" /> },
  working: { label: '工作中', color: 'bg-blue-500', icon: <Loader2 className="w-3 h-3 animate-spin" /> },
  completed: { label: '完成', color: 'bg-green-500', icon: <Check className="w-3 h-3" /> },
  error: { label: '错误', color: 'bg-red-500', icon: <AlertCircle className="w-3 h-3" /> },
};

export function AgentList({ agents, onToggleAgent }: AgentListProps) {
  const activeCount = agents.filter(a => a.isActive).length;

  return (
    <Card className="h-full flex flex-col bg-card/50 backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-xl">🎭</span>
            Agent 团队
          </h2>
          <Badge variant="secondary" className="text-xs">
            {activeCount}/{agents.length} 在线
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          选择参与协作的 Agent
        </p>
      </div>

      {/* Agent List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {agents.map((agent) => {
          const status = statusConfig[agent.status];
          
          return (
            <div
              key={agent.id}
              onClick={() => onToggleAgent(agent.id)}
              className={cn(
                "group relative p-3 rounded-lg border cursor-pointer transition-all duration-200",
                agent.isActive 
                  ? "bg-primary/5 border-primary/30 hover:border-primary/50" 
                  : "bg-muted/30 border-transparent hover:bg-muted/50 opacity-60"
              )}
            >
              <div className="flex items-start gap-3">
                {/* Icon & Element */}
                <div 
                  className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold relative overflow-hidden"
                  style={{ backgroundColor: agent.color }}
                >
                  {agentIcons[agent.id]}
                  <span className="absolute -bottom-1 -right-1 text-[10px] opacity-80">
                    {agent.element}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">
                      {agent.name}
                    </span>
                    {agent.isActive && (
                      <div className={cn("w-2 h-2 rounded-full", status.color)} />
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {agent.description}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    {agent.isActive && agent.status !== 'idle' && (
                      <Badge 
                        variant="outline" 
                        className="text-[10px] h-5 px-1.5 flex items-center gap-1"
                      >
                        {status.icon}
                        {status.label}
                      </Badge>
                    )}
                    <span className="text-[10px] text-muted-foreground italic">
                      {agent.personality}
                    </span>
                  </div>
                </div>

                {/* Checkbox */}
                <div className={cn(
                  "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                  agent.isActive 
                    ? "bg-primary border-primary" 
                    : "border-muted-foreground/30"
                )}>
                  {agent.isActive && <Check className="w-3 h-3 text-primary-foreground" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border/50">
        <Button variant="outline" className="w-full" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          添加 Agent
        </Button>
      </div>
    </Card>
  );
}
