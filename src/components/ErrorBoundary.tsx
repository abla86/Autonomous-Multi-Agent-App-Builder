import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Terminal, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { clientErrorHandler } from '../services/clientErrorHandler';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
  showDetails: boolean;
  traceId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false,
    showDetails: false,
    traceId: '',
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      traceId: `tr-rct-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    clientErrorHandler.reportError(error, {
      component: 'ReactErrorBoundary',
      action: 'RENDER_ERROR_INTERCEPTED',
      fallbackAvailable: true,
      onRetry: () => this.handleReset(),
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
      showDetails: false,
    });
  };

  private copyDiagnostics = () => {
    const text = `Trace ID: ${this.state.traceId}\nTimestamp: ${new Date().toISOString()}\nError: ${this.state.error?.name}: ${this.state.error?.message}\n\nStack:\n${this.state.error?.stack}\n\nComponent Stack:\n${this.state.errorInfo?.componentStack}`;
    navigator.clipboard.writeText(text);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="my-6 p-6 rounded-2xl bg-slate-900 border border-rose-500/30 shadow-2xl text-slate-100 max-w-4xl mx-auto">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 flex-shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  Graceful Degradation Active
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Trace ID: <span className="text-indigo-400">{this.state.traceId}</span>
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mt-1">
                {this.props.fallbackTitle || 'Component Encountered a Render Interruption'}
              </h3>
              <p className="text-sm text-slate-300 mt-1">
                {this.props.fallbackMessage ||
                  'The component safely halted rendering to protect your workspace state. Other subsystems and editor files remain secure.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <button
                  onClick={this.handleReset}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try Recovering View</span>
                </button>

                <button
                  onClick={() => window.location.reload()}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
                >
                  Reload Workspace
                </button>

                <button
                  onClick={this.copyDiagnostics}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
                >
                  {this.state.copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{this.state.copied ? 'Diagnostics Copied' : 'Copy Diagnostics'}</span>
                </button>

                <button
                  onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                  className="flex items-center space-x-1 px-3 py-2 text-xs text-slate-400 hover:text-slate-200 transition"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>{this.state.showDetails ? 'Hide Stack Trace' : 'View Stack Trace'}</span>
                  {this.state.showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Collapsible Technical Stack Trace */}
              {this.state.showDetails && (
                <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-rose-300 overflow-x-auto space-y-2">
                  <div className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                    Technical Exception Details:
                  </div>
                  <div className="text-rose-400 font-bold">{this.state.error?.toString()}</div>
                  {this.state.error?.stack && (
                    <pre className="text-slate-400 text-[11px] whitespace-pre-wrap leading-relaxed">
                      {this.state.error.stack}
                    </pre>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div className="pt-2 border-t border-slate-800 text-slate-500 text-[11px]">
                      Component Stack:{this.state.errorInfo.componentStack}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
