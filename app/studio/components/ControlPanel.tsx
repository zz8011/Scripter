"use client";

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ControlAction, AgentStatus } from '../types';
import { cn } from '@/lib/utils';
import {
  Pause,
  Play,
  Hand,
  SkipForward,
  RotateCcw,
  Settings,
  Wifi,
  WifiOff,
  Users,
  Clock
} from 'lucide-react';

interface ControlPanelProps {
  isCollaborating: boolean;
  isPaused: boolean;
  isConnected: boolean;
  activeAgentCount: number;
  agentStatuses: AgentStatus[];
  onAction: (action: ControlAction) => void;
}

export function ControlPanel({
  isCollaborating,
  isPaused,
  isConnected,
  activeAgentCount,
  agentStatuses,
  onAction,
}: ControlPanelProps) {
  const workingCount = agentStatuses.filter(s => s === 'working' || s === 'thinking').length;
  const completedCount = agentStatuses.filter(s => s === 'completed').length;

  return (
    <Card className="p-4 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Left: Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎛️</span>
            <span className="font-semibold">控制面板</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Connection Status */}
            <Badge 
              variant={isConnected ? "default" : "destructive"}
              className="text-xs"
            >
              {isConnected ? (
                <><Wifi className="w-3 h-3 mr-1" /> 已连接</>
              ) : (
                <><WifiOff className="w-3 h-3 mr-1" /> 未连接</>
              )}
            </Badge>

            {/* Collaboration Status */}
            {isCollaborating && (
              <Badge 
                variant={isPaused ? "secondary" : "default"}
                className={cn(
                  "text-xs",
                  !isPaused && "bg-blue-500 hover:bg-blue-500 animate-pulse"
                )}
              >
                <Clock className="w-3 h-3 mr-1" />
                {isPaused ? '已暂停' : '协作中'}
              </Badge>
            )}

            {/* Agent Status */}
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {activeAgentCount} 个 Agent
              </span>
              {workingCount > 0 && (
                <span className="text-xs text-blue-500">
                  ({workingCount} 工作中)
                </span>
              )}
              {completedCount > 0 && (
                <span className="text-xs text-green-500">
                  ({completedCount} 完成)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          {isCollaborating ? (
            <>
              {/* Pause/Resume */}
              <Button
                variant={isPaused ? "default" : "secondary"}
                size="sm"
                onClick={() => onAction(isPaused ? 'resume' : 'pause')}
              >
                {isPaused ? (
                  <><Play className="w-4 h-4 mr-1" /> 恢复</>
                ) : (
                  <><Pause className="w-4 h-4 mr-1" /> 暂停</>
                )}
              </Button>

              {/* Intervene */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAction('intervene')}
              >
                <Hand className="w-4 h-4 mr-1" /> 介入
              </Button>

              {/* Skip */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAction('skip')}
              >
                <SkipForward className="w-4 h-4 mr-1" /> 跳过
              </Button>

              {/* Reset */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAction('reset')}
              >
                <RotateCcw className="w-4 h-4 mr-1" /> 重置
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAction('reset')}
              >
                <RotateCcw className="w-4 h-4 mr-1" /> 重置
              </Button>
            </>
          )}

          {/* Settings */}
          <Button
            variant="ghost"
            size="sm"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
