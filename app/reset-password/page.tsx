/* ==================================================
   重置密码页面 Reset Password Page
   剧灵 Scripter
   ================================================== */

'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { IconifyIcon } from '@/components/IconifyIcon';
import {
  getFriendlyErrorMessage,
  getPasswordStrengthColor,
  checkPasswordStrength,
} from '@/lib/auth-client';

/* ==================================================
   密码强度指示器 Password Strength Indicator
   ================================================== */

interface PasswordStrengthIndicatorProps {
  strength: 'weak' | 'medium' | 'strong';
  score: number;
  message: string;
}

function PasswordStrengthIndicator({
  strength,
  score,
  message,
}: PasswordStrengthIndicatorProps) {
  const color = getPasswordStrengthColor(strength);

  return (
    <div className="space-y-2 mt-2">
      <div className="flex gap-1 h-1">
        <div
          className="flex-1 rounded-full transition-all duration-300"
          style={{
            backgroundColor: score >= 25 ? color : 'var(--border-color)',
          }}
        />
        <div
          className="flex-1 rounded-full transition-all duration-300"
          style={{
            backgroundColor: score >= 50 ? color : 'var(--border-color)',
          }}
        />
        <div
          className="flex-1 rounded-full transition-all duration-300"
          style={{
            backgroundColor: score >= 75 ? color : 'var(--border-color)',
          }}
        />
      </div>
      <div className="flex items-center justify-between text-xs">
        <span style={{ color }}>{message}</span>
        <span style={{ color: 'var(--text-muted)' }}>{score}/100</span>
      </div>
    </div>
  );
}

/* ==================================================
   重置密码表单 Reset Password Form
   ================================================== */

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  const passwordStrength = checkPasswordStrength(password);

  // 入场动画
  useEffect(() => {
    setMounted(true);
  }, []);

  // 验证 Token
  useEffect(() => {
    if (!token) {
      setServerError('重置链接无效或已过期，请重新申请');
    }
  }, [token]);

  /**
   * 验证表单
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      newErrors.password = '请输入新密码';
    } else if (password.length < 8) {
      newErrors.password = '密码至少需要8位';
    } else if (!/[a-zA-Z]/.test(password)) {
      newErrors.password = '密码必须包含字母';
    } else if (!/\d/.test(password)) {
      newErrors.password = '密码必须包含数字';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = '请确认新密码';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [password, confirmPassword]);

  /**
   * 处理提交
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setServerError('重置链接无效或已过期，请重新申请');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setServerError(null);

    try {
      // TODO: 调用重置密码 API
      // const response = await fetch('/api/auth/reset-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token, password }),
      // });

      // if (!response.ok) {
      //   const error = await response.json();
      //   throw new Error(error.code || 'default');
      // }

      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 1500));

      setIsSuccess(true);
    } catch (err) {
      const errorCode = err instanceof Error ? err.message : 'default';
      setServerError(getFriendlyErrorMessage(errorCode));
    } finally {
      setIsLoading(false);
    }
  }, [token, password, validateForm]);

  // 成功状态
  if (isSuccess) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          backgroundColor: 'var(--paper-bg)',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.5s ease-out',
        }}
      >
        <Card
          className="w-full max-w-md border-0 shadow-2xl"
          style={{
            backgroundColor: 'var(--white-bg)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
          }}
        >
          <CardHeader className="text-center pb-2">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgba(127, 168, 112, 0.15)' }}
            >
              <IconifyIcon icon="lucide:check-circle" className="text-3xl" style={{ color: 'var(--success-green)' }} />
            </div>
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-black)' }}
            >
              密码重置成功
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              您的密码已成功更新
            </p>
          </CardHeader>

          <CardContent className="text-center pt-4">
            <p className="text-sm" style={{ color: 'var(--ink-secondary)' }}>
              请使用新密码登录您的账号
            </p>
          </CardContent>

          <CardFooter className="pt-0">
            <Button
              onClick={() => router.push('/login')}
              className="w-full h-11 text-base font-medium"
              style={{
                backgroundColor: 'var(--brand-gold)',
                color: 'var(--button-text-on-dark)',
              }}
            >
              前往登录
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: 'var(--paper-bg)',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.5s ease-out',
      }}
    >
      <Card
        className="w-full max-w-md border-0 shadow-2xl"
        style={{
          backgroundColor: 'var(--white-bg)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        }}
      >
        <CardHeader className="space-y-1 pb-2">
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: 'var(--brand-gold)',
                boxShadow: '0 8px 32px rgba(201, 169, 98, 0.3)',
              }}
            >
              <IconifyIcon icon="lucide:lock" className="text-3xl text-white" />
            </div>
            <div className="text-center">
              <h1
                className="text-3xl font-bold tracking-tight"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--ink-black)',
                }}
              >
                重置密码
              </h1>
              <p
                className="text-sm mt-1"
                style={{ color: 'var(--text-muted)' }}
              >
                请输入您的新密码
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 pt-6">
          {/* 错误提示 */}
          {serverError && (
            <Alert
              variant="destructive"
              className="border"
              style={{
                backgroundColor: 'rgba(201, 98, 98, 0.08)',
                borderColor: 'rgba(201, 98, 98, 0.2)',
              }}
            >
              <div className="flex items-start gap-2">
                <IconifyIcon
                  icon="lucide:alert-circle"
                  className="shrink-0 mt-0.5"
                  style={{ color: 'var(--error-red)' }}
                />
                <AlertDescription className="flex-1 text-sm" style={{ color: 'var(--error-red)' }}>
                  {serverError}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 新密码 */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                新密码
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <IconifyIcon
                    icon="lucide:lock"
                    className="text-lg"
                    style={{ color: errors.password ? 'var(--error-red)' : 'var(--text-muted)' }}
                  />
                </div>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="请输入新密码（至少8位，包含字母和数字）"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) {
                      setErrors(prev => ({ ...prev, password: undefined }));
                    }
                  }}
                  disabled={isLoading || !token}
                  className="pl-10 pr-10 h-11"
                  style={{
                    borderColor: errors.password ? 'var(--error-red)' : undefined,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  tabIndex={-1}
                >
                  <IconifyIcon
                    icon={showPassword ? 'lucide:eye-off' : 'lucide:eye'}
                    className="text-lg"
                  />
                </button>
              </div>
              {errors.password && (
                <p className="text-xs flex items-center gap-1" style={{ color: 'var(--error-red)' }}>
                  <IconifyIcon icon="lucide:alert-circle" className="text-xs" />
                  {errors.password}
                </p>
              )}
              {password.length > 0 && (
                <PasswordStrengthIndicator {...passwordStrength} />
              )}
            </div>

            {/* 确认密码 */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                确认密码
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <IconifyIcon
                    icon="lucide:lock"
                    className="text-lg"
                    style={{ color: errors.confirmPassword ? 'var(--error-red)' : 'var(--text-muted)' }}
                  />
                </div>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="请再次输入新密码"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) {
                      setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                    }
                  }}
                  disabled={isLoading || !token}
                  className="pl-10 pr-10 h-11"
                  style={{
                    borderColor: errors.confirmPassword ? 'var(--error-red)' : undefined,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  tabIndex={-1}
                >
                  <IconifyIcon
                    icon={showConfirmPassword ? 'lucide:eye-off' : 'lucide:eye'}
                    className="text-lg"
                  />
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs flex items-center gap-1" style={{ color: 'var(--error-red)' }}>
                  <IconifyIcon icon="lucide:alert-circle" className="text-xs" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading || !token}
              className="w-full h-11 text-base font-medium mt-2"
              style={{
                backgroundColor: 'var(--brand-gold)',
                color: 'var(--button-text-on-dark)',
              }}
            >
              {isLoading ? (
                <>
                  <IconifyIcon icon="lucide:loader-2" className="animate-spin mr-2" />
                  重置中...
                </>
              ) : (
                '重置密码'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center pt-0">
          <Link
            href="/login"
            className="text-sm flex items-center gap-1 hover:underline transition-colors"
            style={{ color: 'var(--brand-gold)' }}
          >
            <IconifyIcon icon="lucide:arrow-left" className="text-sm" />
            返回登录
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

/* ==================================================
   加载中组件 Loading State
   ================================================== */

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--paper-bg)' }}>
      <div className="text-center">
        <IconifyIcon
          icon="lucide:loader-2"
          className="animate-spin text-4xl mb-4"
          style={{ color: 'var(--brand-gold)' }}
        />
        <p style={{ color: 'var(--text-muted)' }}>加载中...</p>
      </div>
    </div>
  );
}

/* ==================================================
   页面导出 Page Export
   ================================================== */

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
