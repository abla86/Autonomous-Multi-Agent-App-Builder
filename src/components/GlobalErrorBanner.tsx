import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  X,
  RefreshCw,
  Terminal,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { clientErrorHandler, ClientErrorNotification } from '../services/clientErrorHandler';

export const GlobalErrorBanner: React.FC = () => {
  const [errors, setErrors] = useState<ClientErrorNotification[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = clientErrorHandler.subscribe((list) => {
      setErrors(list);
    });
    return unsubscribe;
  }, []);

  if (errors.length === 0) return null;

  const handleCopy = (err: ClientErrorNotification) => {
    const text = `Trace ID: ${err.traceId}\nTimestamp: ${err.timestamp}\nTitle: ${err.title}\nMessage: ${err.userFriendlyMessage}\nRemedy: ${err.suggestedRemedy}\nDetails: ${err.technicalDetails || 'None'}`;
    navigator.clipboard.writeText(text);
    setCopiedId(err.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-lg w-full space-y-3 pointer-events-none">
      {errors.slice(0, 3).map((err) => {
        const isExpanded = expandedId === err.id;
        const isCopied = copiedId === err.id;

        return (
          <div
            key={err.id}
            className="pointer-events-auto rounded-xl bg-slate-900/95 backdrop-blur-md border border-rose-500/40 shadow-2xl p-4 text-slate-100 transition-all duration-200 animate-slide-up"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start space-x-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 flex-shrink-0 mt-0.5">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-xs text-white truncate">{err.title}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {err.source.toUpperCase()} {err.statusCode ? `· ${err.statusCode}` : ''}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-1 leading-snug">{err.userFriendlyMessage}</p>

                  <div className="mt-2 text-[11px] text-amber-300/90 flex items-start space-x-1.5 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                    <span className="font-bold flex-shrink-0">Remedy:</span>
                    <span>{err.suggestedRemedy}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400 mt-2">
                    <span>Trace:</span>
                    <code className="text-indigo-400 bg-slate-800 px-1 py-0.5 rounded">{err.traceId}</code>
                    <button
                      onClick={() => handleCopy(err)}
                      className="hover:text-slate-200 flex items-center space-x-1 transition ml-1"
                      title="Copy Trace & Error details"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => clientErrorHandler.dismiss(err.id)}
                className="text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800 transition flex-shrink-0"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Action Bar */}
            <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                {err.onRetry && (
                  <button
                    onClick={() => {
                      err.onRetry?.();
                      clientErrorHandler.dismiss(err.id);
                    }}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-sm transition"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Retry</span>
                  </button>
                )}

                {err.fallbackAvailable && err.onFallback && (
                  <button
                    onClick={() => {
                      err.onFallback?.();
                      clientErrorHandler.dismiss(err.id);
                    }}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium border border-slate-700 transition"
                  >
                    Activate Safe Fallback
                  </button>
                )}
              </div>

              {err.technicalDetails && (
                <button
                  onClick={() => setExpandedId(isExpanded ? null : err.id)}
                  className="flex items-center space-x-1 text-slate-400 hover:text-slate-200 text-[11px] transition"
                >
                  <Terminal className="w-3 h-3" />
                  <span>{isExpanded ? 'Hide Details' : 'Details'}</span>
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}
            </div>

            {/* Technical Drawer */}
            {isExpanded && err.technicalDetails && (
              <div className="mt-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-300 max-h-36 overflow-y-auto whitespace-pre-wrap">
                {err.technicalDetails}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
