import React, { useState } from 'react';
import { Bot, Send, Sparkles, AlertCircle, Check, Copy, Code, Terminal, RefreshCw } from 'lucide-react';
import { Project } from '../types';
import { api } from '../services/api';

interface AIAssistantProps {
  project: Project;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ project }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedFileId, setSelectedFileId] = useState<string>(project.files[0]?.id || '');
  const [isLoading, setIsLoading] = useState(false);
  const [responseResult, setResponseResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const quickPrompts = [
    'Audit architecture for scalability bottlenecks',
    'Generate unit regression test cases for this file',
    'Refactor for zero-allocation performance',
    'Inspect potential error conditions and add recovery',
  ];

  const handleConsult = async (customPrompt?: string) => {
    const textToSend = customPrompt || prompt;
    if (!textToSend.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setResponseResult(null);

    try {
      const data = await api.consultAI(project.id, textToSend, selectedFileId || undefined);
      setResponseResult(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to communicate with Agent 19');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">Agent 19 — AI Integration & Gemini 3.8 Flash</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Connects directly to server-side Gemini 3.8 Flash SDK for real-time automated refactoring, architecture reviews, and test generation.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Context File:</span>
            <select
              id="ai-context-file-select"
              value={selectedFileId}
              onChange={(e) => setSelectedFileId(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value="">None (Whole Project)</option>
              {project.files.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.path}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick prompts pills */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-800">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => {
                setPrompt(qp);
                handleConsult(qp);
              }}
              disabled={isLoading}
              className="text-xs px-3 py-1 rounded-full bg-slate-950 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-300 border border-slate-800 hover:border-indigo-500/30 transition flex items-center space-x-1.5"
            >
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>{qp}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input area */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
        <textarea
          id="ai-prompt-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask Agent 19 to review code, suggest optimizations, generate test assertions..."
          rows={3}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none font-sans"
        />

        <div className="flex justify-between items-center">
          <span className="text-[11px] text-slate-500 font-mono">
            Model: gemini-3.8-flash · Server-side execution only
          </span>

          <button
            id="btn-submit-ai-prompt"
            onClick={() => handleConsult()}
            disabled={isLoading || !prompt.trim()}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Agent 19 Processing...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Consult Agent 19</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error display */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Output results card */}
      {responseResult && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm space-y-4 p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Agent 19 Output ({responseResult.mode === 'gemini_live' ? 'Gemini 3.8 Live' : 'Deterministic Heuristic Mode'})
              </span>
            </div>

            {responseResult.warning && (
              <span className="text-[11px] text-amber-400 font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                Notice: Heuristic Fallback
              </span>
            )}
          </div>

          {/* Live response data */}
          {responseResult.data && (
            <div className="space-y-4">
              {responseResult.data.summary && (
                <div>
                  <span className="text-xs font-mono text-slate-400 block mb-1">Architecture Summary:</span>
                  <p className="text-xs text-slate-200 bg-slate-950 p-3 rounded-lg border border-slate-800">
                    {responseResult.data.summary}
                  </p>
                </div>
              )}

              {responseResult.data.codeSuggestion && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-slate-400">Suggested Code Implementation:</span>
                    <button
                      onClick={() => handleCopy(responseResult.data.codeSuggestion)}
                      className="flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 transition"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy Snippet'}</span>
                    </button>
                  </div>
                  <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 overflow-x-auto">
                    <code>{responseResult.data.codeSuggestion}</code>
                  </pre>
                </div>
              )}

              {responseResult.data.securityNotes && (
                <div>
                  <span className="text-xs font-mono text-slate-400 block mb-1">Security & Resilience Notes:</span>
                  <p className="text-xs text-amber-300 bg-amber-500/5 p-3 rounded-lg border border-amber-500/20">
                    {responseResult.data.securityNotes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Offline analysis fallback display */}
          {responseResult.analysis && (
            <div className="space-y-3">
              <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-300 whitespace-pre-wrap">
                {responseResult.analysis.suggestedRefactoring}
              </pre>
              <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-indigo-300 whitespace-pre-wrap">
                {responseResult.analysis.codeSnippet}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
