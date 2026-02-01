"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Send, Loader2, Sparkles } from 'lucide-react';

interface InputAreaProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function InputArea({
  onSend,
  isLoading = false,
  disabled = false,
  placeholder = "输入你的问题或需求，Agent 团队将协作为你服务...",
}: InputAreaProps) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim() || isLoading || disabled) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="p-3 bg-card/50 backdrop-blur-sm">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            className={cn(
              "min-h-[60px] max-h-[200px] pr-10 resize-none",
              "bg-background/50 border-border/50",
              "focus:border-primary/50 focus:ring-primary/20",
              "placeholder:text-muted-foreground/60"
            )}
            rows={2}
          />
          <div className="absolute bottom-2 right-2 text-[10px] text-muted-foreground">
            {input.length} / 2000
          </div>
        </div>

        <Button
          onClick={handleSend}
          disabled={!input.trim() || isLoading || disabled}
          size="icon"
          className={cn(
            "h-[60px] w-12 shrink-0",
            "bg-primary hover:bg-primary/90",
            "disabled:opacity-50"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
        <span className="text-xs text-muted-foreground shrink-0">
          <Sparkles className="w-3 h-3 inline mr-1" />
          快速指令:
        </span>
        
        {[
          '分析剧本结构',
          '优化人物对白',
          '设计剧情反转',
          '完善场景描写',
          '检查设定一致性',
        ].map((quickAction) => (
          <button
            key={quickAction}
            onClick={() => {
              setInput(quickAction);
            }}
            disabled={disabled || isLoading}
            className={cn(
              "px-3 py-1 text-xs rounded-full",
              "bg-muted hover:bg-muted/80",
              "text-muted-foreground hover:text-foreground",
              "transition-colors whitespace-nowrap",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {quickAction}
          </button>
        ))}
      </div>
    </Card>
  );
}
