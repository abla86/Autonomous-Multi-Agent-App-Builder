import React, { useState, useEffect, useRef } from 'react';
import { Play, CheckCircle2, RefreshCw, Terminal, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import { Project, AgentLogEntry, AgentResult } from '../types';

interface LiveSwarmRunnerProps {
  project: Project;
  isRunning: boolean;
  onTriggerRun: () => void;
  logs: AgentLogEntry[];
  results: Record<string, AgentResult> | null;
  executionTimeMs?: number;
}

export const LiveSwarmRunner: React.FC<LiveSwarmRunnerProps> = ({
  project,
  isRunning,
  onTriggerRun,
  logs,
  results,
  executionTimeMs,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'errors' | 'success'>('all');

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const phases = [
    { id: 'scan', label: '1. FILES', desc: 'Stored file metadata and structure' },
    { id: 'diagnose', label: '2. SOURCE', desc: 'Selected text-pattern checks' },
    { id: 'parallel', label: '3. INTEGRITY', desc: 'Duplicate IDs, paths and descriptors' },
    { id: 'integrate', label: '4. TEST EVIDENCE', desc: 'Check whether test files are present' },
    { id: 'test', label: '5. DOCUMENTATION', desc: 'Check README presence' },
    { id: 'qa', label: '6. LIMITATIONS', desc: 'Build, runtime and E2E remain unverified' },
  ];

  const currentPhaseIndex = isRunning ? 0 : -1;

  const filteredLogs = logs.filter((log) => {
    if (activeFilter === 'errors') return log.level === 'error' || log.level === 'warn';
    if (activeFilter === 'success') return log.level === 'success';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Master Orchestrator Control Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
              <h2 className="text-lg font-bold text-white tracking-tight">Project Static Analysis</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Project: <strong className="text-slate-200">{project.name}</strong> · Files: {project.files.length} · Status: <span className="uppercase text-indigo-400 font-mono">{project.status}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {executionTimeMs && (
              <div className="text-right">
                <span className="text-[11px] text-slate-500 block font-mono">CYCLE RUNTIME</span>
                <span className="text-sm font-bold text-slate-200 font-mono">{executionTimeMs}ms</span>
              </div>
            )}

            <button
              id="btn-execute-swarm-cycle"
              onClick={onTriggerRun}
              disabled={isRunning}
              className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-xs font-semibold shadow-md transition ${
                isRunning
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-wait'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
              }`}
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Inspecting Source...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Generate 20-Role Simulation Report</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Phase Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-6 pt-5 border-t border-slate-800">
          {phases.map((p, idx) => {
            const isCompleted = isRunning && idx < currentPhaseIndex;
            const isCurrent = isRunning && idx === currentPhaseIndex;

            return (
              <div
                key={p.id}
                className={`p-3 rounded-lg border text-xs transition ${
                  isCompleted
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-200'
                    : isCurrent
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                    : 'bg-slate-950 border-slate-800/80 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between font-mono font-semibold mb-1">
                  <span>{p.label}</span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : isCurrent ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  ) : null}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Terminal Logs & Telemetry */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-md">
        <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-mono font-medium text-slate-200">Swarm Telemetry Stream</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              {logs.length} events
            </span>
          </div>

          <div className="flex items-center space-x-1">
            {(['all', 'success', 'errors'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`text-[11px] px-2 py-0.5 rounded capitalize font-medium transition ${
                  activeFilter === filter
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div
          ref={terminalRef}
          id="swarm-terminal-output"
          className="p-4 font-mono text-xs text-slate-300 h-80 overflow-y-auto space-y-1.5 selection:bg-indigo-900/50"
        >
          {filteredLogs.length === 0 ? (
            <div className="text-slate-500 py-12 text-center font-sans text-xs">
              This endpoint currently produces simulation-only role reports. It does not execute agents or modify project source files.
            </div>
          ) : (
            filteredLogs.map((entry, idx) => {
              const color =
                entry.level === 'error'
                  ? 'text-rose-400'
                  : entry.level === 'warn'
                  ? 'text-amber-400'
                  : entry.level === 'success'
                  ? 'text-emerald-400'
                  : 'text-slate-400';

              return (
                <div key={idx} className="flex items-start space-x-2 leading-relaxed">
                  <span className="text-slate-600 flex-shrink-0 select-none">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="text-indigo-400 font-semibold flex-shrink-0">
                    [{entry.agentId}]
                  </span>
                  <span className={color}>{entry.message}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
