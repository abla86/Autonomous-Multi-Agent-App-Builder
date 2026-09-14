import React, { useState, useEffect, useMemo } from 'react';
import {
  Cpu,
  Database,
  Activity,
  Zap,
  TrendingUp,
  RefreshCw,
  Trash2,
  Server,
  Play,
  Pause,
  AlertCircle,
  Clock,
  Gauge,
  History,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  HardDrive,
  Filter,
  Maximize2
} from 'lucide-react';
import { SystemPerformanceMetrics, PerformanceHistoryPoint, SessionEvent } from '../types';
import { api } from '../services/api';
import { CanvasSparkline, CanvasSparklineDataset } from './CanvasSparkline';

interface SystemPerformanceMonitorProps {
  isSwarmRunning: boolean;
}

type ViewMode = 'live' | 'historical';
type ChartLayout = 'dual' | 'cpu' | 'memory';
type HistoricalFilter = 'all' | '5m' | '15m' | 'swarm';

export const SystemPerformanceMonitor: React.FC<SystemPerformanceMonitorProps> = ({
  isSwarmRunning,
}) => {
  const [metrics, setMetrics] = useState<SystemPerformanceMetrics | null>(null);
  const [isLive, setIsLive] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<ViewMode>('live');
  const [chartLayout, setChartLayout] = useState<ChartLayout>('dual');
  const [historicalFilter, setHistoricalFilter] = useState<HistoricalFilter>('all');
  const [sampleIntervalMs, setSampleIntervalMs] = useState<number>(1000);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isCleaningMem, setIsCleaningMem] = useState<boolean>(false);
  const [showProcessDetails, setShowProcessDetails] = useState<boolean>(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      const data = await api.getPerformanceMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to fetch performance telemetry:', err);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  // Real-time polling with variable interval
  useEffect(() => {
    if (!isLive) return;

    const timer = setInterval(() => {
      fetchMetrics();
    }, sampleIntervalMs);

    return () => clearInterval(timer);
  }, [isLive, sampleIntervalMs]);

  // When swarm triggers, immediately sync
  useEffect(() => {
    if (isSwarmRunning) {
      fetchMetrics();
    }
  }, [isSwarmRunning]);

  const handleResetPeak = async () => {
    try {
      await api.resetPerformanceTelemetry();
      setActionNotice('Peak memory watermark reset to current usage');
      setTimeout(() => setActionNotice(null), 3000);
      fetchMetrics();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerGC = async () => {
    setIsCleaningMem(true);
    try {
      const res = await api.triggerGarbageCollection();
      setActionNotice(`Memory optimized: Freed ${res.freedRssMb}MB RSS (${res.freedHeapMb}MB Heap)`);
      setTimeout(() => setActionNotice(null), 4000);
      fetchMetrics();
    } catch (err) {
      console.error(err);
    } finally {
      setIsCleaningMem(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  // Determine active data series based on viewMode ('live' vs 'historical') and filters
  const activeSeries = useMemo(() => {
    if (!metrics) return [];
    if (viewMode === 'live') {
      return metrics.history || [];
    }

    const allSession = metrics.sessionHistory || metrics.history || [];
    if (historicalFilter === 'all') {
      return allSession;
    }

    const now = Date.now();
    if (historicalFilter === '5m') {
      const cutoff = now - 5 * 60 * 1000;
      return allSession.filter((pt) => new Date(pt.timestamp).getTime() >= cutoff);
    }

    if (historicalFilter === '15m') {
      const cutoff = now - 15 * 60 * 1000;
      return allSession.filter((pt) => new Date(pt.timestamp).getTime() >= cutoff);
    }

    if (historicalFilter === 'swarm') {
      // Points where agents were active or adjacent points
      return allSession.filter((pt, idx, arr) => {
        const currentActive = pt.activeAgents > 0;
        const prevActive = idx > 0 && arr[idx - 1].activeAgents > 0;
        const nextActive = idx < arr.length - 1 && arr[idx + 1].activeAgents > 0;
        return currentActive || prevActive || nextActive;
      });
    }

    return allSession;
  }, [metrics, viewMode, historicalFilter]);

  // Labels for canvas sparklines
  const chartLabels = useMemo(() => {
    return activeSeries.map((pt) => {
      const date = new Date(pt.timestamp);
      return date.toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' });
    });
  }, [activeSeries]);

  // Datasets for CPU
  const cpuDatasets: CanvasSparklineDataset[] = useMemo(() => {
    return [
      {
        label: 'CPU Usage (%)',
        data: activeSeries.map((pt) => pt.cpuPercent),
        borderColor: '#818cf8', // Indigo-400
        backgroundColor: 'rgba(99, 102, 241, 0.25)',
        fill: true,
        borderWidth: 2,
        tension: 0.3,
      },
    ];
  }, [activeSeries]);

  // Datasets for Memory Heap
  const memoryDatasets: CanvasSparklineDataset[] = useMemo(() => {
    return [
      {
        label: 'Heap Used (MB)',
        data: activeSeries.map((pt) => pt.heapUsedMb),
        borderColor: '#10b981', // Emerald-500
        backgroundColor: 'rgba(16, 185, 129, 0.22)',
        fill: true,
        borderWidth: 2,
        tension: 0.3,
      },
      {
        label: 'RSS Memory (MB)',
        data: activeSeries.map((pt) => pt.memoryRssMb),
        borderColor: '#38bdf8', // Sky-400
        backgroundColor: 'rgba(56, 189, 248, 0.05)',
        fill: false,
        borderWidth: 1.5,
        tension: 0.25,
      },
    ];
  }, [activeSeries]);

  if (!metrics) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm flex items-center justify-center space-x-3 text-slate-400 text-xs font-mono">
        <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
        <span>Initializing Canvas Performance Engine & Telemetry Sentinel...</span>
      </div>
    );
  }

  const isSwarmActive = metrics.swarmStats.isSwarmActive || isSwarmRunning;
  const sessionSummary = metrics.sessionSummary || {
    sessionStartTime: metrics.timestamp,
    sessionUptimeSeconds: metrics.process.uptimeSeconds,
    totalSamples: activeSeries.length,
    peakCpuPercent: metrics.cpu.percent,
    minCpuPercent: 0,
    avgCpuPercent: metrics.cpu.percent,
    peakHeapUsedMb: metrics.memory.heapUsedMb,
    avgHeapUsedMb: metrics.memory.heapUsedMb,
    initialHeapUsedMb: metrics.memory.heapUsedMb,
    totalGcEvents: 0,
    totalSwarmRuns: 0,
  };

  const sessionEvents = metrics.sessionEvents || [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
      {/* Top Header & Mode Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Orchestrator Performance Sentinel & Canvas Telemetry
              </h3>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-semibold flex items-center space-x-1 ${
                  isSwarmActive
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isSwarmActive ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                <span>{isSwarmActive ? 'SWARM ACTIVE (20 WORKERS)' : 'ORCHESTRATOR IDLE'}</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Hardware & V8 process runtime metrics with hardware-accelerated HTML5 Canvas sparklines. Zero mockup.
            </p>
          </div>
        </div>

        {/* Global Controls & Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Historical vs Live Mode Toggle */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            <button
              id="btn-mode-live"
              onClick={() => setViewMode('live')}
              className={`flex items-center space-x-1.5 text-xs px-3 py-1 rounded font-medium transition ${
                viewMode === 'live'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Live Rolling (60s)</span>
            </button>

            <button
              id="btn-mode-historical"
              onClick={() => setViewMode('historical')}
              className={`flex items-center space-x-1.5 text-xs px-3 py-1 rounded font-medium transition ${
                viewMode === 'historical'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Session Historical</span>
            </button>
          </div>

          {/* Live pause toggle (only in live mode) */}
          {viewMode === 'live' && (
            <button
              id="btn-toggle-live-telemetry"
              onClick={() => setIsLive(!isLive)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                isLive
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title={isLive ? 'Pause real-time stream' : 'Resume real-time stream'}
            >
              {isLive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isLive ? 'Streaming Live' : 'Paused'}</span>
            </button>
          )}

          {/* Historical Range Filter (in historical mode) */}
          {viewMode === 'historical' && (
            <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs">
              <Filter className="w-3 h-3 text-slate-500" />
              <select
                id="select-historical-filter"
                value={historicalFilter}
                onChange={(e) => setHistoricalFilter(e.target.value as HistoricalFilter)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer font-mono"
              >
                <option value="all" className="bg-slate-900">All Session</option>
                <option value="5m" className="bg-slate-900">Last 5 min</option>
                <option value="15m" className="bg-slate-900">Last 15 min</option>
                <option value="swarm" className="bg-slate-900">Swarm Runs Only</option>
              </select>
            </div>
          )}

          {/* Sample Interval */}
          {viewMode === 'live' && (
            <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs">
              <span className="text-slate-500 text-[11px]">Interval:</span>
              <select
                id="select-sample-interval"
                value={sampleIntervalMs}
                onChange={(e) => setSampleIntervalMs(Number(e.target.value))}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer font-mono"
              >
                <option value={1000} className="bg-slate-900">1s</option>
                <option value={2000} className="bg-slate-900">2s</option>
                <option value={5000} className="bg-slate-900">5s</option>
              </select>
            </div>
          )}

          {/* Memory Optimize / GC */}
          <button
            id="btn-trigger-gc"
            onClick={handleTriggerGC}
            disabled={isCleaningMem}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
            title="Trigger V8 Garbage Collection & flush memory cache"
          >
            <Trash2 className={`w-3 h-3 ${isCleaningMem ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Flush Cache</span>
          </button>

          {/* Reset Watermark */}
          <button
            id="btn-reset-peak-watermark"
            onClick={handleResetPeak}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
            title="Reset high-water peak memory marker"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Peak</span>
          </button>

          {/* Process details toggle */}
          <button
            id="btn-toggle-process-details"
            onClick={() => setShowProcessDetails(!showProcessDetails)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
          >
            <Server className="w-3 h-3" />
            <span>PID: {metrics.process.pid}</span>
          </button>
        </div>
      </div>

      {/* Action Notice Banner */}
      {actionNotice && (
        <div className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Historical Session Summary Ribbon (when in Historical Mode) */}
      {viewMode === 'historical' && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center space-x-2">
              <History className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Session Inception Performance Audit
              </h4>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                Started {new Date(sessionSummary.sessionStartTime).toLocaleTimeString()}
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Session Elapsed: <strong className="text-white">{formatUptime(sessionSummary.sessionUptimeSeconds)}</strong> ({activeSeries.length} points analyzed)
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
            <div className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">Peak CPU Spike</span>
              <span className="text-sm font-bold text-amber-400">{sessionSummary.peakCpuPercent.toFixed(1)}%</span>
              <span className="text-[10px] text-slate-500 block">Min: {sessionSummary.minCpuPercent.toFixed(1)}%</span>
            </div>

            <div className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">Session Avg CPU</span>
              <span className="text-sm font-bold text-indigo-300">{sessionSummary.avgCpuPercent.toFixed(1)}%</span>
              <span className="text-[10px] text-slate-500 block">Across all samples</span>
            </div>

            <div className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">Peak Heap Allocation</span>
              <span className="text-sm font-bold text-rose-400">{sessionSummary.peakHeapUsedMb} MB</span>
              <span className="text-[10px] text-slate-500 block">Avg: {sessionSummary.avgHeapUsedMb} MB</span>
            </div>

            <div className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">Initial Heap</span>
              <span className="text-sm font-bold text-emerald-400">{sessionSummary.initialHeapUsedMb} MB</span>
              <span className="text-[10px] text-slate-500 block">At session boot</span>
            </div>

            <div className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">V8 GC Flushes</span>
              <span className="text-sm font-bold text-sky-400">{sessionSummary.totalGcEvents}</span>
              <span className="text-[10px] text-slate-500 block">Memory flushes</span>
            </div>

            <div className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">Swarm Cycles</span>
              <span className="text-sm font-bold text-emerald-400">{metrics.swarmStats.totalCycles}</span>
              <span className="text-[10px] text-slate-500 block">20 workers parallelized</span>
            </div>
          </div>

          {/* Session Milestones Badges */}
          {sessionEvents.length > 0 && (
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Session Milestones & Lifecycle Events ({sessionEvents.length}):</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {sessionEvents.map((evt) => {
                  const isSelected = selectedEventId === evt.id;
                  let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
                  if (evt.type === 'swarm_start') badgeColor = 'bg-amber-500/10 text-amber-300 border-amber-500/30';
                  if (evt.type === 'swarm_end') badgeColor = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
                  if (evt.type === 'gc_flush') badgeColor = 'bg-sky-500/10 text-sky-300 border-sky-500/30';
                  if (evt.type === 'test_run') badgeColor = 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';

                  return (
                    <button
                      key={evt.id}
                      onClick={() => setSelectedEventId(isSelected ? null : evt.id)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md border text-left transition flex items-center space-x-1 ${badgeColor} ${
                        isSelected ? 'ring-1 ring-white shadow-sm' : 'hover:opacity-90'
                      }`}
                      title={evt.details}
                    >
                      <span className="text-slate-400">{new Date(evt.timestamp).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })}</span>
                      <span className="font-semibold">{evt.label}</span>
                    </button>
                  );
                })}
              </div>

              {selectedEventId && (
                <div className="mt-2 p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
                  {sessionEvents.find((e) => e.id === selectedEventId)?.details}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Primary Metrics Value Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: CPU Utilization */}
        <div className="bg-slate-950 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>Process CPU</span>
            </span>
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
              {metrics.cpu.cores} Core{metrics.cpu.cores > 1 ? 's' : ''}
            </span>
          </div>

          <div className="my-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold font-mono text-white">
                {metrics.cpu.percent.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-500 font-mono">instantaneous</span>
            </div>

            {/* Gauge bar */}
            <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  metrics.cpu.percent > 70
                    ? 'bg-rose-500'
                    : metrics.cpu.percent > 30
                    ? 'bg-amber-400'
                    : 'bg-indigo-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(3, metrics.cpu.percent))}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Load: {metrics.cpu.loadAverage[0]}</span>
            <span>{metrics.cpu.model.slice(0, 16)}</span>
          </div>
        </div>

        {/* Metric 2: Process Memory (RSS & V8 Heap) */}
        <div className="bg-slate-950 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>V8 Heap / RSS</span>
            </span>
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
              Peak: {metrics.swarmStats.peakMemoryMb}MB
            </span>
          </div>

          <div className="my-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold font-mono text-white">
                {metrics.memory.heapUsedMb}
              </span>
              <span className="text-xs text-slate-500 font-mono">/ {metrics.memory.heapTotalMb} MB Heap</span>
            </div>

            {/* Heap progress */}
            <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, Math.max(3, metrics.memory.heapUsedPercent))}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>RSS: {metrics.memory.rssMb} MB</span>
            <span className="text-emerald-400 font-semibold">{metrics.memory.heapUsedPercent}% Heap Used</span>
          </div>
        </div>

        {/* Metric 3: Swarm Execution Statistics */}
        <div className="bg-slate-950 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Swarm Telemetry</span>
            </span>
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
              {metrics.swarmStats.totalCycles} Cycles
            </span>
          </div>

          <div className="my-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold font-mono text-white">
                {metrics.swarmStats.totalTasksCompleted}
              </span>
              <span className="text-xs text-slate-500 font-mono">tasks executed</span>
            </div>

            <p className="text-[11px] text-slate-400 mt-1">
              Active Workers: <strong className="text-indigo-300 font-mono">{metrics.swarmStats.activeWorkers} / 20</strong>
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Avg Latency:</span>
            <span className="text-emerald-400 font-semibold">{metrics.swarmStats.avgCycleDurationMs}ms</span>
          </div>
        </div>

        {/* Metric 4: Host System RAM */}
        <div className="bg-slate-950 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <HardDrive className="w-3.5 h-3.5 text-sky-400" />
              <span>Host System RAM</span>
            </span>
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
              {metrics.memory.systemUsedPercent}%
            </span>
          </div>

          <div className="my-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold font-mono text-white">
                {metrics.memory.systemTotalMb - metrics.memory.systemFreeMb}
              </span>
              <span className="text-xs text-slate-500 font-mono">/ {metrics.memory.systemTotalMb}MB</span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="h-full bg-sky-500 transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, Math.max(3, metrics.memory.systemUsedPercent))}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Free: {metrics.memory.systemFreeMb}MB</span>
            <span>Uptime: {formatUptime(metrics.process.uptimeSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Real-Time Canvas Sparkline Charts Section */}
      <div className="bg-slate-950 border border-slate-800/90 rounded-xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              {viewMode === 'live'
                ? `Real-Time Canvas Sparklines (Rolling ${activeSeries.length} Samples)`
                : `Historical Canvas Telemetry Timeline (${activeSeries.length} Inception Points)`}
            </span>
          </div>

          {/* Sparkline Layout Selector */}
          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              id="btn-layout-dual"
              onClick={() => setChartLayout('dual')}
              className={`text-[11px] px-2.5 py-0.5 rounded font-mono font-medium transition ${
                chartLayout === 'dual'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Side-by-Side (Both)
            </button>
            <button
              id="btn-layout-cpu"
              onClick={() => setChartLayout('cpu')}
              className={`text-[11px] px-2.5 py-0.5 rounded font-mono font-medium transition ${
                chartLayout === 'cpu'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              CPU Only
            </button>
            <button
              id="btn-layout-memory"
              onClick={() => setChartLayout('memory')}
              className={`text-[11px] px-2.5 py-0.5 rounded font-mono font-medium transition ${
                chartLayout === 'memory'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Memory Heap Only
            </button>
          </div>
        </div>

        {/* Charts Grid */}
        <div className={`grid gap-4 ${chartLayout === 'dual' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Chart 1: CPU Sparkline (Canvas) */}
          {(chartLayout === 'dual' || chartLayout === 'cpu') && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-400"></div>
                  <span className="text-xs font-bold text-white font-mono">CPU Utilization (%)</span>
                </div>
                <span className="text-xs font-mono text-indigo-300 font-semibold">
                  Now: {metrics.cpu.percent.toFixed(1)}%
                </span>
              </div>

              <div className="pt-1">
                <CanvasSparkline
                  id="canvas-sparkline-cpu"
                  labels={chartLabels}
                  datasets={cpuDatasets}
                  height={chartLayout === 'cpu' ? 170 : 125}
                  unit="%"
                  suggestedMin={0}
                  suggestedMax={100}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
                <span>Start: {chartLabels[0] || '0s'}</span>
                <span>Peak in view: {Math.max(0, ...activeSeries.map((s) => s.cpuPercent)).toFixed(1)}%</span>
                <span>End: {chartLabels[chartLabels.length - 1] || 'now'}</span>
              </div>
            </div>
          )}

          {/* Chart 2: Memory Heap Allocation Sparkline (Canvas) */}
          {(chartLayout === 'dual' || chartLayout === 'memory') && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                  <span className="text-xs font-bold text-white font-mono">Memory Heap Allocation (MB)</span>
                </div>
                <div className="flex items-center space-x-3 text-xs font-mono">
                  <span className="text-emerald-400 font-semibold">
                    Heap: {metrics.memory.heapUsedMb} MB
                  </span>
                  <span className="text-sky-400">
                    RSS: {metrics.memory.rssMb} MB
                  </span>
                </div>
              </div>

              <div className="pt-1">
                <CanvasSparkline
                  id="canvas-sparkline-memory"
                  labels={chartLabels}
                  datasets={memoryDatasets}
                  height={chartLayout === 'memory' ? 170 : 125}
                  unit=" MB"
                  suggestedMin={0}
                  showLegend={true}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
                <span>Start: {chartLabels[0] || '0s'}</span>
                <span>Heap Peak: {Math.max(0, ...activeSeries.map((s) => s.heapUsedMb))} MB</span>
                <span>End: {chartLabels[chartLabels.length - 1] || 'now'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expandable Process Diagnostic Drawer */}
      {showProcessDetails && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Container Runtime Process Diagnostics
            </span>
            <span className="text-[11px] font-mono text-indigo-400">Node {metrics.process.nodeVersion}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">PROCESS ID (PID)</span>
              <span className="text-slate-200 font-semibold">{metrics.process.pid}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">PLATFORM / ARCH</span>
              <span className="text-slate-200 font-semibold">{metrics.process.platform} ({metrics.process.arch})</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">EXTERNAL BUFFERS</span>
              <span className="text-slate-200 font-semibold">{metrics.memory.externalMb} MB</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">ARRAY BUFFERS</span>
              <span className="text-slate-200 font-semibold">{metrics.memory.arrayBuffersMb} MB</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">USER CPU TIME</span>
              <span className="text-slate-200 font-semibold">{Math.round(metrics.cpu.userMicros / 1000)}ms</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">SYSTEM CPU TIME</span>
              <span className="text-slate-200 font-semibold">{Math.round(metrics.cpu.systemMicros / 1000)}ms</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">TOTAL INVARIANTS CHECKED</span>
              <span className="text-emerald-400 font-semibold">{metrics.swarmStats.totalAssertionsVerified} verified</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">CONTAINER UPTIME</span>
              <span className="text-slate-200 font-semibold">{formatUptime(metrics.process.uptimeSeconds)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
