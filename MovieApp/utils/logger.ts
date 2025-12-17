// Logger Utility - Centralized logging with environment awareness

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
}

class Logger {
  private isDevelopment = __DEV__;

  private formatMessage(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true;
    
    // In production, only log warnings and errors
    return level === 'warn' || level === 'error';
  }

  private log(level: LogLevel, message: string, data?: any): void {
    if (!this.shouldLog(level)) return;

    const logEntry = this.formatMessage(level, message, data);
    
    switch (level) {
      case 'debug':
        console.log(`[DEBUG] ${logEntry.timestamp} - ${message}`, data);
        break;
      case 'info':
        console.info(`[INFO] ${logEntry.timestamp} - ${message}`, data);
        break;
      case 'warn':
        console.warn(`[WARN] ${logEntry.timestamp} - ${message}`, data);
        break;
      case 'error':
        console.error(`[ERROR] ${logEntry.timestamp} - ${message}`, data);
        break;
    }
  }

  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: any): void {
    this.log('error', message, data);
  }

  // Specialized logging methods
  apiCall(endpoint: string, method: string, data?: any): void {
    this.debug(`API ${method.toUpperCase()} ${endpoint}`, data);
  }

  apiResponse(endpoint: string, status: number, data?: any): void {
    const level = status >= 400 ? 'error' : 'debug';
    this.log(level, `API Response ${status} ${endpoint}`, data);
  }

  userAction(action: string, data?: any): void {
    this.debug(`User Action: ${action}`, data);
  }

  performance(operation: string, duration: number): void {
    this.debug(`Performance: ${operation} took ${duration}ms`);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export individual methods for convenience
export const { debug, info, warn, error, apiCall, apiResponse, userAction, performance } = logger;




