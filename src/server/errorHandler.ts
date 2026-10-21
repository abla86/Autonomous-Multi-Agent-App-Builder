import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { GlobalErrorEvent } from '../types';
import { addLog } from './logger';

const DATA_DIR = path.join(process.cwd(), 'data');
const ERRORS_FILE = path.join(DATA_DIR, 'error-history.json');

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public userFriendlyMessage: string;
  public suggestedRemedy: string;
  public isOperational: boolean;
  public fallbackData?: any;

  constructor(
    message: string,
    statusCode = 500,
    options: {
      code?: string;
      userFriendlyMessage?: string;
      suggestedRemedy?: string;
      fallbackData?: any;
      isOperational?: boolean;
    } = {}
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = options.code || 'INTERNAL_SERVER_ERROR';
    this.userFriendlyMessage = options.userFriendlyMessage || 'An unexpected system error occurred. Operations can continue normally.';
    this.suggestedRemedy = options.suggestedRemedy || 'Check network connection, retry the request, or check the system logs in Observability tab.';
    this.fallbackData = options.fallbackData;
    this.isOperational = options.isOperational ?? true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// In-memory global error registry
let errorRegistry: GlobalErrorEvent[] = [];

// Seed initial errors for demonstration
function seedInitialErrors(): GlobalErrorEvent[] {
  return [
    {
      id: 'err-seed-01',
      traceId: 'tr-err-8109',
      timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      source: 'backend',
      type: 'operational_error',
      statusCode: 422,
      endpoint: '/api/projects/proj-swarm-core/rollback/simulate-merge',
      name: 'AssertionError',
      message: 'Critical test assertion failed: Priority P0 violated in orchestrator.ts',
      userFriendlyMessage: 'The automated test guard prevented broken code from being merged into main branch.',
      suggestedRemedy: 'Review the failing test assertions in Test Studio or inspect the snapshot diff.',
      fallbackActivated: true,
      fallbackDescription: 'Automated rollback triggered: Clean baseline snapshot restored automatically.',
      resolved: true,
      resolvedAt: new Date(Date.now() - 1000 * 60 * 34).toISOString(),
    },
    {
      id: 'err-seed-02',
      traceId: 'tr-err-2401',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      source: 'backend',
      type: 'api_error',
      statusCode: 404,
      endpoint: '/api/projects/non-existent-proj/files',
      name: 'NotFoundError',
      message: 'Project non-existent-proj was not found in persistent store.',
      userFriendlyMessage: 'The requested project could not be located in the system registry.',
      suggestedRemedy: 'Verify the project ID or select an active project from the dropdown.',
      fallbackActivated: true,
      fallbackDescription: 'Defaulted to current active project: SwarmForge Autonomous Engine.',
      resolved: false,
    },
  ];
}

function loadErrors(): void {
  try {
    if (fs.existsSync(ERRORS_FILE)) {
      const data = JSON.parse(fs.readFileSync(ERRORS_FILE, 'utf-8'));
      if (Array.isArray(data)) errorRegistry = data;
    } else {
      errorRegistry = seedInitialErrors();
      saveErrors();
    }
  } catch (e) {
    console.error('Failed to load error registry from disk:', e);
    errorRegistry = seedInitialErrors();
  }
}

function saveErrors(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(ERRORS_FILE, JSON.stringify(errorRegistry.slice(0, 200), null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save error registry to disk:', e);
  }
}

loadErrors();

export function recordGlobalError(entry: Partial<GlobalErrorEvent>): GlobalErrorEvent {
  const newErr: GlobalErrorEvent = {
    id: entry.id || `err-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    traceId: entry.traceId || `tr-${Math.random().toString(36).substring(2, 8)}`,
    timestamp: entry.timestamp || new Date().toISOString(),
    source: entry.source || 'backend',
    type: entry.type || 'operational_error',
    message: entry.message || 'Unknown exception',
    name: entry.name || 'Error',
    stack: entry.stack,
    endpoint: entry.endpoint,
    statusCode: entry.statusCode || 500,
    componentStack: entry.componentStack,
    userFriendlyMessage: entry.userFriendlyMessage || 'An unexpected operational issue was caught safely.',
    suggestedRemedy: entry.suggestedRemedy || 'Retry the action or review detailed logs in Observability tab.',
    fallbackActivated: entry.fallbackActivated ?? false,
    fallbackDescription: entry.fallbackDescription,
    resolved: entry.resolved ?? false,
  };

  errorRegistry.unshift(newErr);
  if (errorRegistry.length > 200) errorRegistry.pop();
  saveErrors();

  // Add structured log entry
  addLog({
    level: 'error',
    category: 'error',
    source: newErr.source,
    action: `ERROR_${newErr.type.toUpperCase()}`,
    message: `[${newErr.type}] ${newErr.name}: ${newErr.message}`,
    statusCode: newErr.statusCode,
    path: newErr.endpoint,
    traceId: newErr.traceId,
    errorDetails: {
      name: newErr.name,
      message: newErr.message,
      stack: newErr.stack,
      componentStack: newErr.componentStack,
    },
    metadata: {
      userFriendlyMessage: newErr.userFriendlyMessage,
      fallbackActivated: newErr.fallbackActivated,
    },
  });

  return newErr;
}

export function getGlobalErrors(): GlobalErrorEvent[] {
  return [...errorRegistry];
}

export function resolveGlobalError(id: string): boolean {
  const found = errorRegistry.find((e) => e.id === id);
  if (found) {
    found.resolved = true;
    found.resolvedAt = new Date().toISOString();
    saveErrors();
    addLog({
      level: 'info',
      category: 'error',
      source: 'backend',
      action: 'ERROR_RESOLVED',
      message: `Error event ${found.id} (trace: ${found.traceId}) marked as resolved.`,
      traceId: found.traceId,
    });
    return true;
  }
  return false;
}

export function clearResolvedErrors(): void {
  errorRegistry = errorRegistry.filter((e) => !e.resolved);
  saveErrors();
}

// Global Express Error Middleware
export function globalErrorMiddleware(err: any, req: Request, res: Response, next: NextFunction): void {
  const traceId = (req.headers['x-request-id'] as string) || `tr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const statusCode = err.statusCode || (err.status ? Number(err.status) : 500);

  // Derive user friendly messaging
  let userFriendly = 'The server encountered an unexpected error while processing your request.';
  let remedy = 'Try refreshing the page or checking your network connection.';
  let fallbackActivated = false;
  let fallbackDescription = undefined;

  if (statusCode === 404) {
    userFriendly = 'The requested resource or endpoint could not be found.';
    remedy = 'Check the URL path or select a valid project item.';
  } else if (statusCode === 400 || statusCode === 422) {
    userFriendly = 'The request parameters were invalid or failed schema validation.';
    remedy = 'Review input values or feature flag configuration.';
  } else if (statusCode >= 500) {
    userFriendly = 'An internal subsystem experienced an issue. Safe fallback was maintained.';
    remedy = 'Use the Retry button or review the Observability Center for diagnostics.';
    if (err.fallbackData) {
      fallbackActivated = true;
      fallbackDescription = 'Supplied cached safe fallback payload.';
    }
  }

  // Record error
  recordGlobalError({
    traceId,
    source: 'backend',
    type: statusCode >= 500 ? 'operational_error' : 'api_error',
    message: err.message || 'Internal Server Error',
    name: err.name || 'Error',
    stack: err.stack,
    endpoint: `${req.method} ${req.originalUrl || req.url}`,
    statusCode,
    userFriendlyMessage: err.userFriendlyMessage || userFriendly,
    suggestedRemedy: err.suggestedRemedy || remedy,
    fallbackActivated,
    fallbackDescription,
  });

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error',
    code: err.code || 'SERVER_ERROR',
    statusCode,
    traceId,
    timestamp: new Date().toISOString(),
    userFriendlyMessage: err.userFriendlyMessage || userFriendly,
    suggestedRemedy: err.suggestedRemedy || remedy,
    fallbackActivated,
    fallbackData: err.fallbackData,
  });
}

// Node process-level uncaught exceptions & unhandled rejections
export function setupProcessErrorHandlers(): void {
  process.on('uncaughtException', (err: Error) => {
    console.error('[UNCAUGHT EXCEPTION CAUGHT SAFELY]:', err);
    recordGlobalError({
      source: 'backend',
      type: 'uncaught_exception',
      message: err.message,
      name: err.name,
      stack: err.stack,
      userFriendlyMessage: 'A background runtime exception was caught by the global error supervisor without server crash.',
      suggestedRemedy: 'Review stack trace in Observability Center and check affected subsystems.',
      fallbackActivated: true,
      fallbackDescription: 'Process error supervisor maintained server execution on port 3000.',
    });
  });

  process.on('unhandledRejection', (reason: any) => {
    console.error('[UNHANDLED PROMISE REJECTION CAUGHT SAFELY]:', reason);
    const message = reason instanceof Error ? reason.message : String(reason);
    const stack = reason instanceof Error ? reason.stack : undefined;
    recordGlobalError({
      source: 'backend',
      type: 'unhandled_rejection',
      message: `Unhandled promise rejection: ${message}`,
      name: 'UnhandledRejection',
      stack,
      userFriendlyMessage: 'An asynchronous operation failed without a catch handler; safely intercepted.',
      suggestedRemedy: 'Inspect async task stack trace or retry the background operation.',
      fallbackActivated: true,
      fallbackDescription: 'Promise supervisor prevented unhandled termination.',
    });
  });
}
