import { GlobalErrorEvent } from '../types';
import { clientLogger } from './clientLogger';
import { api } from './api';

export interface ClientErrorNotification {
  id: string;
  traceId: string;
  title: string;
  userFriendlyMessage: string;
  suggestedRemedy: string;
  technicalDetails?: string;
  source: 'frontend' | 'backend';
  statusCode?: number;
  timestamp: string;
  fallbackAvailable: boolean;
  onRetry?: () => void;
  onFallback?: () => void;
}

type ErrorListener = (errors: ClientErrorNotification[]) => void;

class ClientErrorHandler {
  private activeErrors: ClientErrorNotification[] = [];
  private listeners: Set<ErrorListener> = new Set();

  public subscribe(listener: ErrorListener): () => void {
    this.listeners.add(listener);
    listener([...this.activeErrors]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const list = [...this.activeErrors];
    for (const listener of this.listeners) {
      try {
        listener(list);
      } catch (e) {
        console.error('Error in error notification listener:', e);
      }
    }
  }

  public reportError(
    err: any,
    context?: {
      component?: string;
      action?: string;
      fallbackAvailable?: boolean;
      onRetry?: () => void;
      onFallback?: () => void;
    }
  ): ClientErrorNotification {
    const traceId = err?.traceId || `tr-cli-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const technicalMessage = err?.message || String(err);
    const statusCode = err?.statusCode || (err?.status ? Number(err.status) : undefined);

    let title = 'Action Interrupted';
    let userFriendlyMessage = 'An unexpected issue occurred while processing your request.';
    let suggestedRemedy = 'You can retry the action or reload the workspace.';

    // Intelligent diagnosis based on error shape
    if (technicalMessage.toLowerCase().includes('failed to fetch') || technicalMessage.toLowerCase().includes('networkerror')) {
      title = 'Network Connection Interrupted';
      userFriendlyMessage = 'The application could not reach the server API. Safe local fallback mode is active.';
      suggestedRemedy = 'Check your connection or wait for the server container to respond. Cached data remains accessible.';
    } else if (statusCode === 404) {
      title = 'Resource Not Found';
      userFriendlyMessage = err.userFriendlyMessage || 'The requested file or project entity could not be found.';
      suggestedRemedy = err.suggestedRemedy || 'Select an active project or check the current file tree in the editor.';
    } else if (statusCode === 422 || statusCode === 400) {
      title = 'Validation Notice';
      userFriendlyMessage = err.userFriendlyMessage || 'The input parameters failed system sanity checks.';
      suggestedRemedy = err.suggestedRemedy || 'Review the submitted fields and ensure all values are valid.';
    } else if (statusCode && statusCode >= 500) {
      title = 'Server Operation Guarded';
      userFriendlyMessage = err.userFriendlyMessage || 'The backend encountered a server error. Graceful degradation preserved your session.';
      suggestedRemedy = err.suggestedRemedy || 'Try clicking Retry or review system diagnostics in the Observability tab.';
    } else if (context?.component) {
      title = `Component Error: ${context.component}`;
      userFriendlyMessage = `An issue occurred in the ${context.component} view. The rest of the workbench remains unaffected.`;
      suggestedRemedy = 'Click "Reset View" or switch tabs to continue working.';
    }

    const notification: ClientErrorNotification = {
      id: `err-ntf-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      traceId,
      title,
      userFriendlyMessage,
      suggestedRemedy,
      technicalDetails: technicalMessage + (err?.stack ? `\n\nStack:\n${err.stack}` : ''),
      source: statusCode ? 'backend' : 'frontend',
      statusCode,
      timestamp: new Date().toISOString(),
      fallbackAvailable: context?.fallbackAvailable ?? false,
      onRetry: context?.onRetry,
      onFallback: context?.onFallback,
    };

    this.activeErrors.unshift(notification);
    if (this.activeErrors.length > 8) this.activeErrors.pop();
    this.notify();

    // Log structured event to backend
    clientLogger.error(
      context?.action || 'GLOBAL_ERROR_CAPTURED',
      technicalMessage,
      {
        name: err?.name || 'ClientError',
        message: technicalMessage,
        stack: err?.stack,
        code: err?.code,
      },
      {
        traceId,
        component: context?.component,
        statusCode,
        userFriendlyMessage,
      }
    );

    return notification;
  }

  public dismiss(id: string): void {
    this.activeErrors = this.activeErrors.filter((e) => e.id !== id);
    this.notify();
  }

  public clearAll(): void {
    this.activeErrors = [];
    this.notify();
  }
}

export const clientErrorHandler = new ClientErrorHandler();
