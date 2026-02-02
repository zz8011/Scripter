/* ==================================================
   客户端认证工具 Client Auth Utilities
   ================================================== */

'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * 用户类型
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

/**
 * 认证状态
 */
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * 登录表单数据
 */
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

/**
 * 注册表单数据
 */
export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  nickname: string;
}

/**
 * 验证错误类型
 */
export interface ValidationErrors {
  [key: string]: string;
}

/* ==================================================
   表单验证函数 Form Validation
   ================================================== */

/**
 * 验证邮箱格式
 */
export function validateEmail(email: string): string | null {
  if (!email) {
    return '请输入邮箱地址';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return '邮箱格式不正确';
  }
  return null;
}

/**
 * 验证密码
 */
export function validatePassword(password: string): string | null {
  if (!password) {
    return '请输入密码';
  }
  if (password.length < 6) {
    return '密码至少需要6位';
  }
  return null;
}

/**
 * 验证注册密码（带强度要求）
 */
export function validateRegisterPassword(password: string): string | null {
  if (!password) {
    return '请输入密码';
  }
  if (password.length < 8) {
    return '密码至少需要8位';
  }
  if (!/[a-zA-Z]/.test(password)) {
    return '密码必须包含字母';
  }
  if (!/\d/.test(password)) {
    return '密码必须包含数字';
  }
  return null;
}

/**
 * 验证确认密码
 */
export function validateConfirmPassword(password: string, confirmPassword: string): string | null {
  if (!confirmPassword) {
    return '请确认密码';
  }
  if (password !== confirmPassword) {
    return '两次输入的密码不一致';
  }
  return null;
}

/**
 * 验证昵称
 */
export function validateNickname(nickname: string): string | null {
  if (!nickname) {
    return '请输入昵称';
  }
  if (nickname.length < 2) {
    return '昵称至少需要2个字符';
  }
  if (nickname.length > 20) {
    return '昵称不能超过20个字符';
  }
  return null;
}

/* ==================================================
   密码强度检查 Password Strength
   ================================================== */

export type PasswordStrength = 'weak' | 'medium' | 'strong';

export interface PasswordStrengthResult {
  strength: PasswordStrength;
  score: number; // 0-100
  message: string;
}

/**
 * 检查密码强度
 */
export function checkPasswordStrength(password: string): PasswordStrengthResult {
  let score = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  // 基础分数
  if (checks.length) score += 20;
  if (checks.lowercase) score += 15;
  if (checks.uppercase) score += 15;
  if (checks.numbers) score += 25;
  if (checks.special) score += 25;

  // 额外加分
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;

  // 确保分数不超过100
  score = Math.min(score, 100);

  let strength: PasswordStrength;
  let message: string;

  if (score < 40) {
    strength = 'weak';
    message = '弱 - 建议增加密码复杂度';
  } else if (score < 70) {
    strength = 'medium';
    message = '中 - 可以继续加强';
  } else {
    strength = 'strong';
    message = '强 - 密码强度良好';
  }

  return { strength, score, message };
}

/**
 * 获取密码强度颜色
 */
export function getPasswordStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak':
      return '#C96262'; // 红色
    case 'medium':
      return '#E8A858'; // 橙色
    case 'strong':
      return '#7FA870'; // 绿色
    default:
      return '#8B7355';
  }
}

/* ==================================================
   登录表单 Hook Login Form Hook
   ================================================== */

export function useLoginForm() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const updateField = useCallback(<K extends keyof LoginFormData>(
    field: K,
    value: LoginFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    setServerError(null);
  }, [errors]);

  return {
    formData,
    errors,
    isLoading,
    serverError,
    setIsLoading,
    setServerError,
    validateForm,
    updateField,
  };
}

/* ==================================================
   注册表单 Hook Register Form Hook
   ================================================== */

export function useRegisterForm() {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrengthResult>({
    strength: 'weak',
    score: 0,
    message: '',
  });

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validateRegisterPassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    const confirmError = validateConfirmPassword(formData.password, formData.confirmPassword);
    if (confirmError) newErrors.confirmPassword = confirmError;

    const nicknameError = validateNickname(formData.nickname);
    if (nicknameError) newErrors.nickname = nicknameError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const updateField = useCallback(<K extends keyof RegisterFormData>(
    field: K,
    value: RegisterFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 更新密码强度
    if (field === 'password') {
      setPasswordStrength(checkPasswordStrength(value as string));
    }
    
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    setServerError(null);
  }, [errors]);

  return {
    formData,
    errors,
    isLoading,
    serverError,
    passwordStrength,
    setIsLoading,
    setServerError,
    validateForm,
    updateField,
  };
}

/* ==================================================
   用户认证 Hook User Auth Hook
   ================================================== */

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    // 检查本地存储的记住我状态
    const checkAuth = async () => {
      try {
        // 实际项目中这里应该调用 API 验证会话
        // 暂时通过检查 cookie 或其他方式判断
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setAuthState({
            user: data.user,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } catch {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    checkAuth();
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  return {
    ...authState,
    logout,
  };
}

/* ==================================================
   错误处理 Error Handling
   ================================================== */

/**
 * 友好的错误消息映射
 */
const ERROR_MESSAGES: Record<string, string> = {
  missing_params: '认证参数缺失，请重试',
  missing_verifier: '安全验证失败，请重试',
  auth_failed: '认证失败，请检查账户信息',
  user_denied: '您已取消授权',
  network_error: '网络连接失败，请检查网络',
  timeout: '请求超时，请稍后重试',
  server_error: '服务器繁忙，请稍后重试',
  invalid_credentials: '邮箱或密码错误',
  account_locked: '账户已被锁定，请联系客服',
  email_not_verified: '邮箱未验证，请先验证邮箱',
  default: '登录过程中发生错误，请重试',
};

/**
 * 获取友好的错误消息
 */
export function getFriendlyErrorMessage(errorCode: string): string {
  return ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.default;
}

/**
 * 解析 URL 错误参数
 */
export function parseUrlError(searchParams: URLSearchParams): string | null {
  const errorParam = searchParams.get('error');
  if (!errorParam) return null;
  return getFriendlyErrorMessage(errorParam);
}

/* ==================================================
   Token 刷新 Token Refresh
   ================================================== */

/**
 * Token 刷新管理器
 */
class TokenRefreshManager {
  private refreshPromise: Promise<boolean> | null = null;
  private lastRefreshTime: number = 0;
  private readonly REFRESH_INTERVAL = 5 * 60 * 1000; // 5分钟

  /**
   * 检查是否需要刷新
   */
  shouldRefresh(): boolean {
    const now = Date.now();
    return now - this.lastRefreshTime > this.REFRESH_INTERVAL;
  }

  /**
   * 刷新 Token
   */
  async refresh(): Promise<boolean> {
    // 如果已经在刷新中，返回现有的 Promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.doRefresh();
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async doRefresh(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        this.lastRefreshTime = Date.now();
        return true;
      }

      // 刷新失败，可能需要重新登录
      if (response.status === 401) {
        window.location.href = '/login?error=session_expired';
      }
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }
}

export const tokenRefreshManager = new TokenRefreshManager();

/**
 * 启动自动刷新
 */
export function startTokenRefresh(intervalMinutes: number = 5): () => void {
  const intervalMs = intervalMinutes * 60 * 1000;
  
  const intervalId = setInterval(() => {
    tokenRefreshManager.refresh();
  }, intervalMs);

  // 返回清理函数
  return () => clearInterval(intervalId);
}
