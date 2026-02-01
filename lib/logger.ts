/**
 * 日志工具
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, unknown>
  error?: Error
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, context, error } = entry
    const contextStr = context ? ` ${JSON.stringify(context)}` : ''
    const errorStr = error ? `\n${error.stack || error.message}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}${errorStr}`
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    }

    const formatted = this.formatLog(entry)

    switch (level) {
      case 'error':
        console.error(formatted)
        break
      case 'warn':
        console.warn(formatted)
        break
      case 'debug':
        if (this.isDevelopment) {
          console.debug(formatted)
        }
        break
      default:
        console.log(formatted)
    }

    // TODO: 发送到日志服务（如 Sentry、DataDog）
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context)
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context)
  }

  error(message: string, error?: Error, context?: Record<string, unknown>) {
    this.log('error', message, context, error)
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log('debug', message, context)
  }

  // 专用日志方法
  apiRequest(method: string, path: string, userId?: string) {
    this.info('API Request', { method, path, userId })
  }

  apiResponse(method: string, path: string, statusCode: number, duration: number) {
    this.info('API Response', { method, path, statusCode, duration })
  }

  dbQuery(operation: string, table: string, duration: number) {
    this.debug('DB Query', { operation, table, duration })
  }

  aiRequest(model: string, tokensUsed: number, userId: string) {
    this.info('AI Request', { model, tokensUsed, userId })
  }
}

export const logger = new Logger()
