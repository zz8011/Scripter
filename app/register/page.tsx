/* ==================================================
   注册页面 Register Page
   剧灵 Scripter - 一支懂你的笔
   ================================================== */

'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  useRegisterForm,
  getFriendlyErrorMessage,
  getPasswordStrengthColor,
} from '@/lib/auth-client';

/* ==================================================
   Logo 组件 Logo Component
   ================================================== */

function Logo() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg"
        style={{
          backgroundColor: 'var(--brand-gold)',
          boxShadow: '0 8px 32px rgba(201, 169, 98, 0.3)',
        }}
      >
        <IconifyIcon icon="lucide:feather" className="text-3xl text-white" />
      </div>
      <div className="text-center">
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--ink-black)',
          }}
        >
          创建账号
        </h1>
        <p
          className="text-sm mt-1"
          style={{ color: 'var(--text-muted)' }}
        >
          开启你的剧本创作之旅
        </p>
      </div>
    </div>
  );
}

/* ==================================================
   输入框组件 Input Components
   ================================================== */

interface FormInputProps {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  icon: string;
}

function FormInput({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled,
  icon,
}: FormInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <IconifyIcon
            icon={icon}
            className="text-lg"
            style={{ color: error ? 'var(--error-red)' : 'var(--text-muted)' }}
          />
        </div>
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="pl-10 h-11"
          style={{
            borderColor: error ? 'var(--error-red)' : undefined,
          }}
        />
      </div>
      {error && (
        <p className="text-xs flex items-center gap-1" style={{ color: 'var(--error-red)' }}>
          <IconifyIcon icon="lucide:alert-circle" className="text-xs" />
          {error}
        </p>
      )}
    </div>
  );
}

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
    <div className="space-y-2">
      {/* 进度条 */}
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
      
      {/* 文字说明 */}
      <div className="flex items-center justify-between text-xs">
        <span style={{ color }}>{message}</span>
        <span style={{ color: 'var(--text-muted)' }}>{score}/100</span>
      </div>
    </div>
  );
}

/* ==================================================
   密码输入框（带显示/隐藏切换）Password Input
   ================================================== */

interface PasswordInputProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  showStrength?: boolean;
  strength?: PasswordStrengthIndicatorProps;
}

function PasswordInputWithToggle({
  id,
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled,
  showStrength,
  strength,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <IconifyIcon
            icon="lucide:lock"
            className="text-lg"
            style={{ color: error ? 'var(--error-red)' : 'var(--text-muted)' }}
          />
        </div>
        <Input
          id={id}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="pl-10 pr-10 h-11"
          style={{
            borderColor: error ? 'var(--error-red)' : undefined,
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
      {error && (
        <p className="text-xs flex items-center gap-1" style={{ color: 'var(--error-red)' }}>
          <IconifyIcon icon="lucide:alert-circle" className="text-xs" />
          {error}
        </p>
      )}
      {showStrength && strength && (
        <PasswordStrengthIndicator {...strength} />
      )}
    </div>
  );
}

/* ==================================================
   注册表单组件 Register Form
   ================================================== */

function RegisterForm() {
  const router = useRouter();
  const {
    formData,
    errors,
    isLoading,
    serverError,
    passwordStrength,
    setIsLoading,
    setServerError,
    validateForm,
    updateField,
  } = useRegisterForm();
  const [mounted, setMounted] = useState(false);

  // 入场动画
  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * 处理注册提交
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setServerError(null);

    try {
      // TODO: 实现注册 API
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     email: formData.email,
      //     password: formData.password,
      //     name: formData.nickname,
      //   }),
      // });

      // if (!response.ok) {
      //   const error = await response.json();
      //   throw new Error(error.code || 'default');
      // }

      // 目前使用模拟延迟
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 注册成功，跳转到登录页
      router.push('/login?registered=true');
    } catch (err) {
      const errorCode = err instanceof Error ? err.message : 'default';
      setServerError(getFriendlyErrorMessage(errorCode));
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm, router, setIsLoading, setServerError]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 py-8"
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
          <Logo />
        </CardHeader>

        <CardContent className="space-y-5 pt-6">
          {/* 服务器错误提示 */}
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

          {/* 注册表单 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 昵称 */}
            <FormInput
              id="nickname"
              label="昵称"
              placeholder="请输入昵称"
              value={formData.nickname}
              onChange={(value) => updateField('nickname', value)}
              error={errors.nickname}
              disabled={isLoading}
              icon="lucide:user"
            />

            {/* 邮箱 */}
            <FormInput
              id="email"
              label="邮箱"
              type="email"
              placeholder="请输入邮箱地址"
              value={formData.email}
              onChange={(value) => updateField('email', value)}
              error={errors.email}
              disabled={isLoading}
              icon="lucide:mail"
            />

            {/* 密码 */}
            <PasswordInputWithToggle
              id="password"
              label="密码"
              placeholder="请输入密码（至少8位，包含字母和数字）"
              value={formData.password}
              onChange={(value) => updateField('password', value)}
              error={errors.password}
              disabled={isLoading}
              showStrength={formData.password.length > 0}
              strength={passwordStrength}
            />

            {/* 确认密码 */}
            <PasswordInputWithToggle
              id="confirmPassword"
              label="确认密码"
              placeholder="请再次输入密码"
              value={formData.confirmPassword}
              onChange={(value) => updateField('confirmPassword', value)}
              error={errors.confirmPassword}
              disabled={isLoading}
            />

            {/* 注册按钮 */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-base font-medium mt-6"
              style={{
                backgroundColor: 'var(--brand-gold)',
                color: 'var(--button-text-on-dark)',
              }}
            >
              {isLoading ? (
                <>
                  <IconifyIcon icon="lucide:loader-2" className="animate-spin mr-2" />
                  注册中...
                </>
              ) : (
                '创 建 账 号'
              )}
            </Button>
          </form>

          {/* 登录链接 */}
          <div className="text-center pt-2">
            <span style={{ color: 'var(--text-muted)' }}>已有账号？</span>
            <Link
              href="/login"
              className="ml-1 font-medium hover:underline transition-colors"
              style={{ color: 'var(--brand-gold)' }}
            >
              立即登录 →
            </Link>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-4 pt-0">
          {/* 服务条款 */}
          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            注册即表示您同意我们的
            <Link href="/terms" className="hover:underline" style={{ color: 'var(--brand-gold)' }}>
              服务条款
            </Link>
            和
            <Link href="/privacy" className="hover:underline" style={{ color: 'var(--brand-gold)' }}>
              隐私政策
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

/* ==================================================
   加载中组件 Loading State
   ================================================== */

function RegisterLoading() {
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

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterLoading />}>
      <RegisterForm />
    </Suspense>
  );
}
