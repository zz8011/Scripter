/**
 * API 错误响应统一格式
 *
 * 用于标准化所有 API 路由的错误响应
 */

export interface ApiErrorResponse {
  error: string;
  details?: Record<string, any>;
  code?: string;
  statusCode?: number;
}

/**
 * API 错误类
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly details?: Record<string, any>;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // 保持正确的原型链
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * 转换为 JSON 响应格式
   */
  toJSON(): ApiErrorResponse {
    return {
      error: this.message,
      code: this.code,
      details: this.details,
      statusCode: this.statusCode,
    };
  }

  /**
   * 转换为 Next.js Response 对象
   */
  toResponse(): Response {
    return Response.json(this.toJSON(), {
      status: this.statusCode,
    });
  }
}

/**
 * 常见错误工厂函数
 */
export const ApiErrors = {
  /**
   * 400 - 请求参数错误
   */
  badRequest(message: string = '请求参数错误', details?: Record<string, any>): ApiError {
    return new ApiError(message, 400, 'BAD_REQUEST', details);
  },

  /**
   * 401 - 未授权
   */
  unauthorized(message: string = '请先登录', details?: Record<string, any>): ApiError {
    return new ApiError(message, 401, 'UNAUTHORIZED', details);
  },

  /**
   * 403 - 禁止访问
   */
  forbidden(message: string = '没有权限访问此资源', details?: Record<string, any>): ApiError {
    return new ApiError(message, 403, 'FORBIDDEN', details);
  },

  /**
   * 404 - 资源不存在
   */
  notFound(message: string = '资源不存在', details?: Record<string, any>): ApiError {
    return new ApiError(message, 404, 'NOT_FOUND', details);
  },

  /**
   * 409 - 冲突
   */
  conflict(message: string = '资源冲突', details?: Record<string, any>): ApiError {
    return new ApiError(message, 409, 'CONFLICT', details);
  },

  /**
   * 422 - 验证失败
   */
  validationFailed(message: string = '数据验证失败', details?: Record<string, any>): ApiError {
    return new ApiError(message, 422, 'VALIDATION_FAILED', details);
  },

  /**
   * 429 - 请求过多
   */
  tooManyRequests(message: string = '请求过于频繁，请稍后再试', details?: Record<string, any>): ApiError {
    return new ApiError(message, 429, 'TOO_MANY_REQUESTS', details);
  },

  /**
   * 500 - 服务器内部错误
   */
  internal(message: string = '服务器内部错误', details?: Record<string, any>): ApiError {
    return new ApiError(message, 500, 'INTERNAL_ERROR', details);
  },

  /**
   * 503 - 服务不可用
   */
  serviceUnavailable(message: string = '服务暂时不可用', details?: Record<string, any>): ApiError {
    return new ApiError(message, 503, 'SERVICE_UNAVAILABLE', details);
  },
};

/**
 * 错误处理中间件辅助函数
 *
 * 用于在 API 路由中统一处理错误
 */
export function handleApiError(error: unknown): Response {
  // 如果是 ApiError，直接返回
  if (error instanceof ApiError) {
    return error.toResponse();
  }

  // 如果是普通 Error
  if (error instanceof Error) {
    // 开发环境返回详细错误信息
    if (process.env.NODE_ENV === 'development') {
      return Response.json(
        {
          error: error.message,
          details: {
            stack: error.stack,
            name: error.name,
          },
        },
        { status: 500 }
      );
    }

    // 生产环境返回通用错误
    return Response.json(
      {
        error: '服务器内部错误',
      },
      { status: 500 }
    );
  }

  // 未知错误
  return Response.json(
    {
      error: '未知错误',
    },
    { status: 500 }
  );
}

/**
 * API 路由包装器
 *
 * 自动捕获错误并返回统一格式
 */
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
