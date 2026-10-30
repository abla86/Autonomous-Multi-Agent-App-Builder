import React, { useState } from 'react';
import {
  Flame,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Layers,
  FileCode,
  Info,
  Maximize2,
  Filter,
  Sparkles,
  Zap,
} from 'lucide-react';
import { AGENT_REGISTRY } from '../data/agents';
import { AgentDefinition, AgentResult, Project } from '../types';

interface AgentHeatmapProps {
  project: Project;
  lastResults: Record<string, AgentResult> | null;
  isRunningSwarm: boolean;
}

type HeatmapMetric = 'operations' | 'latency' | 'findings' | 'health';

interface CellData {
  agent: AgentDefinition;
  targetFile: string;
  targetName: string;
  value: number;
  label: string;
  level: 'none' | 'low' | 'medium' | 'high' | 'critical';
  details: {
    findings: string[];
    repairs: string[];
    durationMs: number;
    status: string;
  };
}

export const AgentHeatmap: React.FC<AgentHeatmapProps> = ({
  project,
  lastResults,
  isRunningSwarm,
}) => {
  const [metric, setMetric] = useState<HeatmapMetric>('operations');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeCell, setActiveCell] = useState<CellData | null>(null);

  // Results are role-level only; the backend does not map findings to individual files.
  const targets = [{ id: 'role-result', path: 'Role-level source inspection', name: 'Inspection result' }];

  // Filter agents by category
  const filteredAgents = AGENT_REGISTRY.filter((a) => {
    return selectedCategory === 'all' || a.category === selectedCategory;
  });

  // Calculate cell value from recorded results only; never fabricate a baseline.
  const getCellData = (agent: AgentDefinition, target: { id: string; path: string; name: string }): CellData => {
    const res = lastResults ? lastResults[agent.id] : null;
    if (!res) {
      return {
        agent,
        targetFile: target.path,
        targetName: target.name,
        value: 0,
        label: '—',
        level: 'none',
        details: {
          findings: ['No run result recorded; this cell has not been assessed.'],
          repairs: [],
          durationMs: 0,
          status: 'not_run',
        },
      };
    }

    let value = 0;
    let label = '';
    let level: 'none' | 'low' | 'medium' | 'high' | 'critical' = 'none';

    const baseFindings = res?.findings || ['No result recorded for this role.'];
    const baseFindings = res?.findings || ['No result recorded for this agent; no finding has been verified.'];
    const baseRepairs = res?.repairsApplied || [];
    const durationMs = res?.durationMs || 0;
    const status = res?.status || 'warning';

    if (metric === 'operations') {
      // Count only recorded findings and repairs; this is not a count of executed operations.
      const repairsCount = res?.repairsApplied.length || 0;
      const findingsCount = res?.findings.length || 0;
      value = res ? repairsCount + findingsCount : 0;
      value = res ? repairsCount * 2 + findingsCount : 0;

      label = `${value} items`;
      if (value > 6) level = 'critical';
      else if (value > 4) level = 'high';
      else if (value > 2) level = 'medium';
      else if (value > 0) level = 'low';
      else level = 'none';

    } else if (metric === 'latency') {
      // Metric: Latency (ms)
      value = durationMs;
      label = `${value}ms`;
      if (value > 75) level = 'critical';
      else if (value > 55) level = 'high';
      else if (value > 35) level = 'medium';
      else level = 'low';

    } else if (metric === 'findings') {
      // Metric: Findings & Warnings
      const findingsCount = res?.findings.length || 0;
      value = findingsCount;
      const isWarn = status === 'warning';
      value = isWarn ? findingsCount + 3 : findingsCount;
      label = `${value} findings`;
      if (value >= 5) level = 'critical';
      else if (value >= 3) level = 'high';
      else if (value >= 2) level = 'medium';
      else level = 'low';

    } else {
      // Report the recorded status, not a fabricated numeric health score.
      if (status === 'passed') {
        value = 1;
        level = 'low';
        label = 'PASS';
      } else if (status === 'fixed') {
        value = 1;
        level = 'medium';
        label = 'FIXED';
      } else if (status === 'warning') {
        value = 0;
        level = 'high';
        label = 'WARN';
      } else {
        value = 0;
        level = 'critical';
        label = 'ERROR';
      }
    }

    return {
      agent,
      targetFile: target.path,
      targetName: target.name,
      value,
      label,
      level,
      details: {
        findings: baseFindings,
        repairs: baseRepairs,
        durationMs,
        status,
      },
    };
  };

  // Color mapping based on intensity level
  const getCellColor = (level: CellData['level']) => {
    switch (level) {
      case 'critical':
        return 'bg-rose-500/80 hover:bg-rose-500 text-white border-rose-400 font-bold';
      case 'high':
        return 'bg-amber-500/70 hover:bg-amber-500 text-slate-900 border-amber-400 font-semibold';
      case 'medium':
        return 'bg-indigo-600/60 hover:bg-indigo-600 text-white border-indigo-500';
      case 'low':
        return 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700';
      default:
        return 'bg-slate-950/60 hover:bg-slate-900 text-slate-500 border-slate-900';
    }
  };

  // Aggregated Bottlenecks
  const resultsList: AgentResult[] = lastResults ? (Object.values(lastResults) as AgentResult[]) : [];
  const activeRepairsCount: number = resultsList.reduce((acc: number, r: AgentResult) => acc + (r.repairsApplied ? r.repairsApplied.length : 0), 0);
  const avgLatency: number | null = resultsList.length > 0
    ? Math.round(resultsList.reduce((acc: number, r: AgentResult) => acc + (r.durationMs || 0), 0) / resultsList.length)
    : null;

  return (
    <div id="agent-heatmap-container" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
      {/* Header & Metric Controls */}
      <p className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
        Role-level findings are not mapped to individual files. Empty cells mean no result was recorded; this view is not a file-by-file audit.
      </p>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Flame className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Recorded Role Results
            </h3>
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
              20 DEFINED ROLES
            </span>
            {isRunningSwarm && (
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono animate-pulse">
                INSPECTION RUNNING
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Results from the current static inspection, grouped by defined role. This view does not show independent agent execution or file-by-file results.
          </p>
        </div>

        {/* Metric Selector Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 space-x-1">
            <button
              id="metric-btn-operations"
              onClick={() => setMetric('operations')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-medium transition ${
                metric === 'operations'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Findings &amp; Repairs</span>
            </button>
            <button
              id="metric-btn-latency"
              onClick={() => setMetric('latency')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-medium transition ${
                metric === 'latency'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Latency (ms)</span>
            </button>
            <button
              id="metric-btn-findings"
              onClick={() => setMetric('findings')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-medium transition ${
                metric === 'findings'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Attention Hotspots</span>
            </button>
            <button
              id="metric-btn-health"
              onClick={() => setMetric('health')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-medium transition ${
                metric === 'health'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Recorded Status</span>
            </button>
          </div>
        </div>
      </div>

      {/* Heatmap Category Filter & Legend Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Category Filters */}
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-400">Pillar:</span>
          {['all', 'core', 'quality', 'infrastructure', 'product'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-0.5 rounded capitalize font-medium transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-2 font-mono text-[11px] text-slate-400">
          <span>Result indicator:</span>
          <div className="flex items-center space-x-1">
            <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-900 text-slate-500">Idle</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Low</span>
            <span className="px-1.5 py-0.5 rounded bg-indigo-600/70 border border-indigo-500 text-white">Moderate</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/80 border border-amber-400 text-slate-900 font-bold">High</span>
            <span className="px-1.5 py-0.5 rounded bg-rose-500 border border-rose-400 text-white font-bold">Intense</span>
          </div>
        </div>
      </div>

      {/* HEATMAP MATRIX TABLE */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950">
        <table className="w-full border-collapse text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 text-[11px]">
              <th className="p-3 sticky left-0 z-20 bg-slate-900 border-r border-slate-800 w-56">
                Agent / Role
              </th>
              {targets.map((target) => (
                <th key={target.id} className="p-3 text-center border-r border-slate-800/80 min-w-[120px] font-semibold text-slate-300">
                  <div className="flex flex-col items-center">
                    <FileCode className="w-3.5 h-3.5 text-indigo-400 mb-1" />
                    <span className="truncate max-w-[110px]">{target.name}</span>
                    <span className="text-[9px] text-slate-500 font-normal truncate max-w-[110px]">{target.path}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAgents.map((agent) => (
              <tr key={agent.id} className="border-b border-slate-800/60 hover:bg-slate-900/40 transition">
                {/* Agent Label Header Column */}
                <td className="p-2.5 sticky left-0 z-10 bg-slate-950 border-r border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-400 text-[10px] font-bold">
                      {agent.badge}
                    </span>
                    <div className="truncate">
                      <div className="text-slate-200 font-semibold text-xs truncate">{agent.name}</div>
                      <div className="text-[10px] text-slate-500 capitalize">{agent.category}</div>
                    </div>
                  </div>
                </td>

                {/* Data Cells */}
                {targets.map((target) => {
                  const cell = getCellData(agent, target);
                  const isSelected = activeCell?.agent.id === agent.id && activeCell?.targetFile === target.path;

                  return (
                    <td key={target.id} className="p-1.5 border-r border-slate-800/50 text-center">
                      <button
                        onClick={() => setActiveCell(cell)}
                        className={`w-full py-2 px-1 rounded-md text-[11px] border transition flex flex-col items-center justify-center space-y-0.5 cursor-pointer ${getCellColor(
                          cell.level
                        )} ${isSelected ? 'ring-2 ring-indigo-400 scale-105 z-10' : ''}`}
                        title={`${agent.name} on ${target.name}: ${cell.label}`}
                      >
                        <span>{cell.label}</span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recorded inspection summary; no unmeasured telemetry is displayed. */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center space-x-3">
          <div className="p-2 rounded bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-slate-400 font-mono text-[11px] block">Recorded findings and repairs</span>
            <span className="text-slate-100 font-bold text-sm">{resultsList.reduce((sum, r) => sum + (r.findings?.length || 0), 0)} findings · {activeRepairsCount} repairs</span>
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center space-x-3">
          <div className="p-2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-slate-400 font-mono text-[11px] block">Mean recorded result duration</span>
            <span className="text-slate-100 font-bold text-sm">{avgLatency} ms / module</span>
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center space-x-3">
          <div className="p-2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="text-slate-400 font-mono text-[11px] block">Execution and contention metrics</span>
            <span className="text-slate-300 font-bold text-sm">Not measured by this inspection</span>
          </div>
        </div>
      </div>

      {/* INSPECTION MODAL: CLICKED CELL DETAIL */}
      {activeCell && (
        <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/40 space-y-3 animate-in fade-in">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                {activeCell.agent.badge}
              </span>
              <div>
                <h4 className="text-sm font-bold text-white">
                  {activeCell.agent.name} <span className="text-slate-400 font-normal">role result for</span> {activeCell.targetName}
                </h4>
                <p className="text-xs text-indigo-300 font-mono">{activeCell.targetFile}</p>
              </div>
            </div>

            <button
              onClick={() => setActiveCell(null)}
              className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition"
            >
              ✕ Close Detail
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-800">
            {/* Findings */}
            <div>
              <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                Recorded Findings:
              </span>
              <ul className="space-y-1">
                {activeCell.details.findings.map((finding, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Repairs */}
            <div>
              <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                Repairs Reported:
              </span>
              <ul className="space-y-1">
                {activeCell.details.repairs.map((repair, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5 text-indigo-300">
                    <Zap className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <span>{repair}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 text-[11px] font-mono text-slate-400">
                Execution overhead: <span className="text-white font-bold">{activeCell.details.durationMs}ms</span> · Status: <span className="text-emerald-400 uppercase">{activeCell.details.status}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
