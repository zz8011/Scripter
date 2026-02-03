/**
 * 八字配置页面
 * 
 * 用户设置生辰八字，决定 AI 助手"剧灵"的性格和说话风格
 * 
 * @module app/juling/bazi
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { MainLayout } from '@/components/MainLayout';
import { IconifyIcon } from '@/components/IconifyIcon';

// ============================================
// 类型定义
// ============================================

interface BaziConfig {
  id: string;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  bazi: string;
  wuxing: string;
  shiho: string | null;
  personality?: {
    coreTraits: {
      traits: string[];
    };
    speechStyle: {
      tone: string;
    };
  };
}

// ============================================
// 常量
// ============================================

const YEARS = Array.from({ length: 100 }, (_, i) => 1925 + i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const HOURS = [
  { value: 0, label: '子时 (23:00-01:00)' },
  { value: 1, label: '丑时 (01:00-03:00)' },
  { value: 2, label: '丑时 (01:00-03:00)' },
  { value: 3, label: '寅时 (03:00-05:00)' },
  { value: 4, label: '寅时 (03:00-05:00)' },
  { value: 5, label: '卯时 (05:00-07:00)' },
  { value: 6, label: '卯时 (05:00-07:00)' },
  { value: 7, label: '辰时 (07:00-09:00)' },
  { value: 8, label: '辰时 (07:00-09:00)' },
  { value: 9, label: '巳时 (09:00-11:00)' },
  { value: 10, label: '巳时 (09:00-11:00)' },
  { value: 11, label: '午时 (11:00-13:00)' },
  { value: 12, label: '午时 (11:00-13:00)' },
  { value: 13, label: '未时 (13:00-15:00)' },
  { value: 14, label: '未时 (13:00-15:00)' },
  { value: 15, label: '申时 (15:00-17:00)' },
  { value: 16, label: '申时 (15:00-17:00)' },
  { value: 17, label: '酉时 (17:00-19:00)' },
  { value: 18, label: '酉时 (17:00-19:00)' },
  { value: 19, label: '戌时 (19:00-21:00)' },
  { value: 20, label: '戌时 (19:00-21:00)' },
  { value: 21, label: '亥时 (21:00-23:00)' },
  { value: 22, label: '亥时 (21:00-23:00)' },
  { value: 23, label: '子时 (23:00-01:00)' },
];

const WUXING_COLORS: Record<string, string> = {
  '金': '#C9A962',
  '木': '#4A7C59',
  '水': '#2E5C8A',
  '火': '#C94A4A',
  '土': '#8B6914',
};

// ============================================
// 组件
// ============================================

export default function BaziConfigPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [config, setConfig] = useState<BaziConfig | null>(null);
  
  // 表单状态
  const [year, setYear] = useState<string>('');
  const [month, setMonth] = useState<string>('');
  const [day, setDay] = useState<string>('');
  const [hour, setHour] = useState<string>('');

  // 加载现有配置
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/bazi');
      
      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          setConfig(result.data);
          setYear(result.data.birthYear.toString());
          setMonth(result.data.birthMonth.toString());
          setDay(result.data.birthDay.toString());
          setHour(result.data.birthHour.toString());
        }
      }
    } catch (err) {
      console.error('Load config error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // 验证
    if (!year || !month || !day || !hour) {
      setError('请填写完整的出生时间');
      return;
    }

    try {
      setIsSaving(true);
      
      const response = await fetch('/api/bazi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: parseInt(year),
          month: parseInt(month),
          day: parseInt(day),
          hour: parseInt(hour),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setConfig(result.data);
        setSuccess(result.message);
        
        // 3秒后刷新页面显示完整结果
        setTimeout(() => {
          router.refresh();
        }, 3000);
      } else {
        setError(result.error || '保存失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除八字配置吗？这将重置你的剧灵性格。')) {
      return;
    }

    try {
      setIsSaving(true);
      
      const response = await fetch('/api/bazi', {
        method: 'DELETE',
      });

      if (response.ok) {
        setConfig(null);
        setYear('');
        setMonth('');
        setDay('');
        setHour('');
        setSuccess('八字配置已删除');
      } else {
        const result = await response.json();
        setError(result.error || '删除失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="container max-w-4xl py-8">
        {/* 页面标题 */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--ink-black)' }}>
            配置你的剧灵
          </h1>
          <p className="text-muted-foreground">
            设置生辰八字，让 AI 助手拥有与你契合的性格
          </p>
        </div>

        {/* 说明卡片 */}
        <Card className="mb-6 border-amber-200 bg-amber-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <IconifyIcon 
                icon="lucide:info" 
                className="text-xl mt-0.5" 
                style={{ color: 'var(--brand-gold)' }}
              />
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">
                  <strong>什么是剧灵？</strong>
                </p>
                <p className="mb-2">
                  剧灵是你的 AI 创作伙伴，它的性格和说话风格由你的生辰八字决定。
                  金木水火土五行对应不同的性格特质：
                </p>
                <div className="grid grid-cols-5 gap-2 mt-3 text-center">
                  <div className="p-2 rounded bg-white/60">
                    <div className="font-bold text-amber-600">金</div>
                    <div className="text-xs">理性直接</div>
                  </div>
                  <div className="p-2 rounded bg-white/60">
                    <div className="font-bold text-green-600">木</div>
                    <div className="text-xs">温和启发</div>
                  </div>
                  <div className="p-2 rounded bg-white/60">
                    <div className="font-bold text-blue-600">水</div>
                    <div className="text-xs">灵活幽默</div>
                  </div>
                  <div className="p-2 rounded bg-white/60">
                    <div className="font-bold text-red-600">火</div>
                    <div className="text-xs">热情活泼</div>
                  </div>
                  <div className="p-2 rounded bg-white/60">
                    <div className="font-bold text-yellow-700">土</div>
                    <div className="text-xs">稳重踏实</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 错误/成功提示 */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* 配置表单 */}
        <Card>
          <CardHeader>
            <CardTitle>出生时间</CardTitle>
            <CardDescription>
              请填写你的出生年月日时（农历或公历均可，系统会自动转换）
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                {/* 年 */}
                <div className="space-y-2">
                  <Label htmlFor="year">年</Label>
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger id="year">
                      <SelectValue placeholder="选择年份" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {YEARS.map((y) => (
                        <SelectItem key={y} value={y.toString()}>
                          {y}年
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 月 */}
                <div className="space-y-2">
                  <Label htmlFor="month">月</Label>
                  <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger id="month">
                      <SelectValue placeholder="选择月份" />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((m) => (
                        <SelectItem key={m} value={m.toString()}>
                          {m}月
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 日 */}
                <div className="space-y-2">
                  <Label htmlFor="day">日</Label>
                  <Select value={day} onValueChange={setDay}>
                    <SelectTrigger id="day">
                      <SelectValue placeholder="选择日期" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map((d) => (
                        <SelectItem key={d} value={d.toString()}>
                          {d}日
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 时 */}
                <div className="space-y-2">
                  <Label htmlFor="hour">时</Label>
                  <Select value={hour} onValueChange={setHour}>
                    <SelectTrigger id="hour">
                      <SelectValue placeholder="选择时辰" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {HOURS.map((h) => (
                        <SelectItem key={h.value} value={h.value.toString()}>
                          {h.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1"
                  style={{ backgroundColor: 'var(--brand-gold)' }}
                >
                  {isSaving ? '保存中...' : config ? '更新配置' : '创建配置'}
                </Button>
                {config && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDelete}
                    disabled={isSaving}
                  >
                    删除
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 结果显示 */}
        {config && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>你的剧灵画像</CardTitle>
              <CardDescription>
                基于你的八字 {config.bazi}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 八字和五行 */}
              <div className="flex items-center gap-4">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                  style={{ backgroundColor: WUXING_COLORS[config.wuxing] || '#666' }}
                >
                  {config.wuxing}
                </div>
                <div>
                  <div className="text-2xl font-bold">{config.bazi}</div>
                  <div className="text-muted-foreground">
                    日主五行：<span className="font-medium">{config.wuxing}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* 诗号 */}
              {config.shiho && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">诗号</h3>
                  <blockquote className="text-xl font-serif italic pl-4 border-l-4" style={{ borderColor: 'var(--brand-gold)' }}>
                    "{config.shiho}"
                  </blockquote>
                </div>
              )}

              <Separator />

              {/* 性格特质 */}
              {config.personality && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">性格特质</h3>
                  <div className="flex flex-wrap gap-2">
                    {config.personality.coreTraits.traits.map((trait, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 rounded-full text-sm"
                        style={{ backgroundColor: 'rgba(201, 169, 98, 0.2)' }}
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* 说话风格 */}
              {config.personality?.speechStyle && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">说话风格</h3>
                  <p>{config.personality.speechStyle.tone}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href="/juling">
                <Button variant="outline">
                  返回剧灵设置
                </Button>
              </Link>
              <Link href="/editor">
                <Button style={{ backgroundColor: 'var(--brand-gold)' }}>
                  开始创作
                </Button>
              </Link>
            </CardFooter>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
