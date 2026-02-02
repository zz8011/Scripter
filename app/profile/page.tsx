/* ==================================================
   用户资料页面 Profile Page
   剧灵 Scripter
   ================================================== */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MainLayout } from '@/components/MainLayout';
import { IconifyIcon } from '@/components/IconifyIcon';

/* ==================================================
   用户资料类型 User Profile Types
   ================================================== */

interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  plan: string;
  createdAt: string;
  aiQuota: {
    monthlyLimit: number;
    used: number;
    resetAt: string;
  };
}

/* ==================================================
   资料表单组件 Profile Form
   ================================================== */

function ProfileForm() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');

  // 加载用户资料
  useEffect(() => {
    const loadProfile = async () => {
      try {
        // TODO: 调用获取用户资料 API
        // const response = await fetch('/api/auth/me');
        // const data = await response.json();

        // 模拟数据
        await new Promise(resolve => setTimeout(resolve, 500));
        const mockProfile: UserProfile = {
          id: 'user-123',
          email: 'user@example.com',
          name: '剧灵用户',
          avatar: undefined,
          plan: 'creator',
          createdAt: '2024-01-15T00:00:00Z',
          aiQuota: {
            monthlyLimit: 2000000,
            used: 450000,
            resetAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          },
        };

        setProfile(mockProfile);
        setNickname(mockProfile.name);
      } catch {
        setError('加载用户资料失败');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  // 保存资料
  const handleSave = useCallback(async () => {
    if (!profile) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: 调用更新用户资料 API
      // const response = await fetch('/api/auth/profile', {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name: nickname }),
      // });

      // if (!response.ok) throw new Error('保存失败');

      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 800));

      setProfile(prev => prev ? { ...prev, name: nickname } : null);
      setSuccess('资料已更新');
    } catch {
      setError('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  }, [profile, nickname]);

  // 计算 AI 配额使用百分比
  const quotaPercentage = profile
    ? Math.min(100, Math.round((profile.aiQuota.used / profile.aiQuota.monthlyLimit) * 100))
    : 0;

  // 格式化日期
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 格式化数字
  const formatNumber = (num: number) => {
    return num.toLocaleString('zh-CN');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <IconifyIcon
          icon="lucide:loader-2"
          className="animate-spin text-3xl"
          style={{ color: 'var(--brand-gold)' }}
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <Alert variant="destructive">
        <AlertDescription>无法加载用户资料</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* 成功/错误提示 */}
      {success && (
        <Alert
          className="border"
          style={{
            backgroundColor: 'rgba(127, 168, 112, 0.08)',
            borderColor: 'rgba(127, 168, 112, 0.2)',
          }}
        >
          <div className="flex items-center gap-2">
            <IconifyIcon icon="lucide:check-circle" style={{ color: 'var(--success-green)' }} />
            <AlertDescription style={{ color: 'var(--success-green)' }}>{success}</AlertDescription>
          </div>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 基本信息卡片 */}
      <Card style={{ borderColor: 'var(--border-color)' }}>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'var(--font-display)' }}>基本信息</CardTitle>
          <CardDescription>管理您的个人资料</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 头像区域 */}
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile.avatar} alt={profile.name} />
              <AvatarFallback
                className="text-2xl"
                style={{ backgroundColor: 'var(--brand-gold-light)', color: 'var(--brand-gold-dark)' }}
              >
                {profile.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="font-medium">头像</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                支持 JPG、PNG 格式，最大 2MB
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <IconifyIcon icon="lucide:upload" className="mr-2" />
                上传头像
              </Button>
            </div>
          </div>

          <Separator style={{ backgroundColor: 'var(--border-color)' }} />

          {/* 表单字段 */}
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                value={profile.email}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                邮箱地址无法修改
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nickname">昵称</Label>
              <Input
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="请输入昵称"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSaving || nickname === profile.name}
              style={{
                backgroundColor: 'var(--brand-gold)',
                color: 'var(--button-text-on-dark)',
              }}
            >
              {isSaving ? (
                <>
                  <IconifyIcon icon="lucide:loader-2" className="animate-spin mr-2" />
                  保存中...
                </>
              ) : (
                <>
                  <IconifyIcon icon="lucide:save" className="mr-2" />
                  保存修改
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 账户信息卡片 */}
      <Card style={{ borderColor: 'var(--border-color)' }}>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'var(--font-display)' }}>账户信息</CardTitle>
          <CardDescription>查看您的账户状态和配额</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 当前套餐 */}
          <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--paper-bg)' }}>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--brand-gold-light)' }}
              >
                <IconifyIcon icon="lucide:crown" style={{ color: 'var(--brand-gold)' }} />
              </div>
              <div>
                <p className="font-medium">当前套餐</p>
                <p className="text-sm capitalize" style={{ color: 'var(--text-muted)' }}>
                  {profile.plan === 'free' && '免费版'}
                  {profile.plan === 'creator' && '创作者版'}
                  {profile.plan === 'pro' && '专业版'}
                  {profile.plan === 'admin' && '管理员'}
                </p>
              </div>
            </div>
            <Button variant="outline" style={{ borderColor: 'var(--border-color)' }}>
              升级套餐
            </Button>
          </div>

          {/* AI 配额 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconifyIcon icon="lucide:sparkles" style={{ color: 'var(--brand-gold)' }} />
                <span className="font-medium">AI 配额</span>
              </div>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {formatNumber(profile.aiQuota.used)} / {formatNumber(profile.aiQuota.monthlyLimit)} tokens
              </span>
            </div>

            {/* 进度条 */}
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border-color)' }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${quotaPercentage}%`,
                  backgroundColor: quotaPercentage > 90 ? 'var(--error-red)' : 'var(--brand-gold)',
                }}
              />
            </div>

            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              配额将于 {formatDate(profile.aiQuota.resetAt)} 重置
            </p>
          </div>

          <Separator style={{ backgroundColor: 'var(--border-color)' }} />

          {/* 注册时间 */}
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <IconifyIcon icon="lucide:calendar" />
            <span>注册时间：{formatDate(profile.createdAt)}</span>
          </div>
        </CardContent>
      </Card>

      {/* 安全设置卡片 */}
      <Card style={{ borderColor: 'var(--border-color)' }}>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'var(--font-display)' }}>安全设置</CardTitle>
          <CardDescription>管理您的账户安全</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--paper-bg)' }}
              >
                <IconifyIcon icon="lucide:key" style={{ color: 'var(--ink-secondary)' }} />
              </div>
              <div>
                <p className="font-medium">修改密码</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  定期修改密码以保护账户安全
                </p>
              </div>
            </div>
            <Button variant="outline" style={{ borderColor: 'var(--border-color)' }}>
              修改
            </Button>
          </div>

          <Separator style={{ backgroundColor: 'var(--border-color)' }} />

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--paper-bg)' }}
              >
                <IconifyIcon icon="lucide:link" style={{ color: 'var(--ink-secondary)' }} />
              </div>
              <div>
                <p className="font-medium">第三方账号绑定</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  绑定其他账号以便快速登录
                </p>
              </div>
            </div>
            <Button variant="outline" style={{ borderColor: 'var(--border-color)' }}>
              管理
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ==================================================
   页面导出 Page Export
   ================================================== */

export default function ProfilePage() {
  const header = (
    <div className="flex items-center justify-between">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          个人资料
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          管理您的账户信息和设置
        </p>
      </div>
    </div>
  );

  return (
    <MainLayout header={header}>
      <div className="p-8 max-w-3xl mx-auto">
        <ProfileForm />
      </div>
    </MainLayout>
  );
}
