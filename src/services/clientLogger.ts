import { LogLevel, LogCategory, StructuredLog } from '../types';
import { api } from './api';

class ClientLogger {
  private queue: Partial<StructuredLog>[] = [];
  private flushTimeout: NodeJS.Timeout | null = null;
  private isInitialized = false;

  public init(): void {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // Window global uncaught error listener
    window.addEventListener('error', (event) => {
      this.error(
        'WINDOW_UNCAUGHT_ERROR',
        event.message || 'Script error occurred',
        {
          name: event.error?.name || 'Error',
          message: event.message,
          stack: event.error?.stack,
        },
        { filename: event.filename, lineno: event.lineno, colno: event.colno }
      );
    });

    // Window unhandled promise rejection listener
    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason;
      const message = reason instanceof Error ? reason.message : String(reason);
      const stack = reason instanceof Error ? reason.stack : undefined;

      this.error(
        'UNHANDLED_PROMISE_REJECTION',
        `Unhandled promise rejection: ${message}`,
        {
          name: 'UnhandledPromiseRejection',
          message,
          stack,
        }
      );
    });

    this.info('CLIENT_INITIALIZED', 'Frontend logging & monitoring client supervisor started.');
  }

  public log(
    level: LogLevel,
    category: LogCategory,
    action: string,
    message: string,
    errorDetails?: StructuredLog['errorDetails'],
    metadata?: Record<string, any>
  ): void {
    const entry: Partial<StructuredLog> = {
      timestamp: new Date().toISOString(),
      level,
      category,
      source: 'frontend',
      action,
      message,
      errorDetails,
      metadata,
    };

    // Print to browser console with appropriate level
    if (level === 'error' || level === 'fatal') {
      console.error(`[SWARM ${action}]`, message, errorDetails || metadata || '');
    } else if (level === 'warn') {
      console.warn(`[SWARM ${action}]`, message, metadata || '');
    } else {
      console.log(`[SWARM ${action}]`, message, metadata || '');
    }

    this.enqueue(entry);
  }

  public info(action: string, message: string, metadata?: Record<string, any>): void {
    this.log('info', 'user_action', action, message, undefined, metadata);
  }

  public warn(action: string, message: string, metadata?: Record<string, any>): void {
    this.log('warn', 'error', action, message, undefined, metadata);
  }

  public error(
    action: string,
    message: string,
    errorDetails?: StructuredLog['errorDetails'],
    metadata?: Record<string, any>
  ): void {
    this.log('error', 'error', action, message, errorDetails, metadata);
  }

  public userAction(action: string, description: string, metadata?: Record<string, any>): void {
    this.log('info', 'user_action', action, description, undefined, metadata);
  }

  private enqueue(entry: Partial<StructuredLog>): void {
    this.queue.push(entry);

    if (this.queue.length >= 10) {
      this.flush();
    } else if (!this.flushTimeout) {
      this.flushTimeout = setTimeout(() => {
        this.flush();
      }, 1500);
    }
  }

  private async flush(): Promise<void> {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = null;
    }

    if (this.queue.length === 0) return;

    const itemsToSend = [...this.queue];
    this.queue = [];

    // Send in background without blocking
    try {
      for (const item of itemsToSend) {
        await api.sendLog(item);
      }
    } catch (e) {
      // In case server is unreachable, silently drop to avoid recursive failures
      console.debug('Failed to flush client logs to backend:', e);
    }
  }
}

export const clientLogger = new ClientLogger();
