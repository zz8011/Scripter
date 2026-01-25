/**
 * 自定义错误类
 */

export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number = 500,
    message: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super('UNAUTHORIZED', 401, message)
    this.name = 'UnauthorizedError'
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super('NOT_FOUND', 404, message)
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super('VALIDATION_ERROR', 400, message)
    this.name = 'ValidationError'
  }
}

export class QuotaExceededError extends AppError {
  constructor(message = 'AI quota exceeded', public remaining?: number, public resetAt?: Date) {
    super('QUOTA_EXCEEDED', 429, message)
    this.name = 'QuotaExceededError'
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super('DATABASE_ERROR', 500, message)
    this.name = 'DatabaseError'
  }
}

/**
 * 错误响应格式
 */
export interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: any
  }
}

/**
 * 将错误转换为 API 响应
 */
export function errorToResponse(error: unknown): ErrorResponse {
  if (error instanceof AppError) {
    return {
      error: {
        code: error.code,
        message: error.message,
        details: error instanceof QuotaExceededError
          ? { remaining: error.remaining, resetAt: error.resetAt }
          : undefined,
      }
    }
  }

  if (error instanceof Error) {
    return {
      error: {
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
      }
    }
  }

  return {
    error: {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
    }
  }
}
