import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Flame,
  Gauge,
  HardDrive,
  Info,
  Layers,
  Pause,
  Play,
  RefreshCw,
  Search,
  Server,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Trash2,
  Zap,
  Check,
  ChevronDown,
  ChevronUp,
  Cpu,
  ArrowUpRight,
  Sliders,
  Bug,
  Filter,
} from 'lucide-react';
import {
  StructuredLog,
  LogLevel,
  LogCategory,
  LogSource,
  ApplicationHealthReport,
  DetailedMonitoringMetrics,
  AlertRule,
  AlertInstance,
  GlobalErrorEvent,
  Project,
  SubsystemHealth,
} from '../types';

import { api } from '../services/api';
import { clientLogger } from '../services/clientLogger';
import { clientErrorHandler } from '../services/clientErrorHandler';

interface ObservabilityCenterProps {
  project?: Project | null;
}

export const ObservabilityCenter: React.FC<ObservabilityCenterProps> = ({ project }) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'health' | 'metrics' | 'alerts' | 'errors'>('logs');

  // Logs state
  const [logs, setLogs] = useState<StructuredLog[]>([]);
  const [totalLogsCount, setTotalLogsCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<LogCategory | 'all'>('all');
  const [selectedSource, setSelectedSource] = useState<LogSource | 'all'>('all');
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);

  // Health state
  const [healthReport, setHealthReport] = useState<ApplicationHealthReport | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState<boolean>(false);

  // Metrics state
  const [metrics, setMetrics] = useState<DetailedMonitoringMetrics | null>(null);

  // Alerts state
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<AlertInstance[]>([]);
  const [isSimulatingAlert, setIsSimulatingAlert] = useState<boolean>(false);

  // Global Errors state
  const [globalErrors, setGlobalErrors] = useState<GlobalErrorEvent[]>([]);
  const [isSimulatingError, setIsSimulatingError] = useState<boolean>(false);

  // Simulation test for React Error Boundary
  const [triggerReactCrash, setTriggerReactCrash] = useState<boolean>(false);

  // Load all telemetry
  const loadData = async () => {
    try {
      const [logsData, health, met, alertsData, errorsData] = await Promise.all([
        api.getLogs({
          search: searchQuery || undefined,
          level: selectedLevel !== 'all' ? selectedLevel : undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          source: selectedSource !== 'all' ? selectedSource : undefined,
          limit: 100,
        }),
        api.getDetailedHealth(),
        api.getDetailedMetrics(),
        api.getAlerts(),
        api.getGlobalErrors(),
      ]);

      setLogs(logsData.logs);
      setTotalLogsCount(logsData.total);
      setHealthReport(health);
      setMetrics(met);
      setAlertRules(alertsData.rules);
      setActiveAlerts(alertsData.activeAlerts);
      setGlobalErrors(errorsData);
    } catch (err: any) {
      console.error('Failed to load observability telemetry:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, selectedLevel, selectedCategory, selectedSource]);

  // Live polling interval when streaming is active
  useEffect(() => {
    if (!isLiveStreaming) return;
    const interval = setInterval(() => {
      loadData();
    }, 2500);
    return () => clearInterval(interval);
  }, [isLiveStreaming, searchQuery, selectedLevel, selectedCategory, selectedSource]);

  const handleClearLogs = async () => {
    if (confirm('Clear all structured logs from in-memory buffer and persistence?')) {
      await api.clearLogs();
      loadData();
    }
  };

  const handleEmitSampleLog = async () => {
    clientLogger.userAction(
      'DIAGNOSTIC_SAMPLE_TRIGGERED',
      `Manual test event triggered from Observability Center by operator.`,
      { timestamp: new Date().toISOString(), component: 'ObservabilityCenter', userAgent: navigator.userAgent }
    );
    setTimeout(loadData, 500);
  };

  const handleAcknowledgeAlert = async (id: string) => {
    await api.acknowledgeAlert(id);
    loadData();
  };

  const handleResolveAlert = async (id: string) => {
    await api.resolveAlert(id);
    loadData();
  };

  const handleSimulateAlert = async (scenario: 'latency_spike' | 'error_burst' | 'memory_surge' | 'subsystem_down') => {
    setIsSimulatingAlert(true);
    try {
      await api.simulateAlert(scenario);
      await loadData();
    } catch (e) {
      console.error('Alert simulation failed:', e);
    } finally {
      setIsSimulatingAlert(false);
    }
  };

  const handleSimulateError = async (scenario: 'backend_500' | 'operational_fallback' | 'validation_422' | 'unhandled_rejection') => {
    setIsSimulatingError(true);
    try {
      const res = await api.simulateError(scenario);
      clientErrorHandler.reportError(
        { message: res.notice || 'Simulated operational response executed successfully.', statusCode: 200 },
        { action: 'SIMULATION_FALLBACK_VERIFIED' }
      );
      loadData();
    } catch (err: any) {
      clientErrorHandler.reportError(err, {
        action: `SIMULATED_${scenario.toUpperCase()}`,
        fallbackAvailable: true,
      });
      loadData();
    } finally {
      setIsSimulatingError(false);
    }
  };

  const handleResolveError = async (id: string) => {
    await api.resolveGlobalError(id);
    loadData();
  };

  const copyLogText = (log: StructuredLog) => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopiedLogId(log.id);
    setTimeout(() => setCopiedLogId(null), 2000);
  };

  if (triggerReactCrash) {
    throw new Error('Intentional React render exception triggered from Observability Sandbox to verify ErrorBoundary protection!');
  }

  const activeAlertsCount = activeAlerts.filter((a) => a.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Top Observability Hero Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-white tracking-tight">Observability, Logging & Monitoring</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>99.9% UPTIME SLA</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Real-time structured event logs, application health probes, performance histograms, automated alerts & global error supervisor.
              </p>
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <div className="text-[10px] uppercase font-mono text-slate-400">Application Health</div>
              <div className="text-sm font-bold flex items-center space-x-1.5 mt-0.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    healthReport?.status === 'healthy' ? 'bg-emerald-400' : healthReport?.status === 'degraded' ? 'bg-amber-400' : 'bg-rose-400'
                  }`}
                />
                <span className="text-white capitalize">{healthReport?.status || 'Healthy'}</span>
              </div>
            </div>

            <div className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <div className="text-[10px] uppercase font-mono text-slate-400">P95 Latency</div>
              <div className="text-sm font-bold text-indigo-400 mt-0.5 font-mono">
                {metrics?.latency.p95Ms || 18}ms
              </div>
            </div>

            <div className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <div className="text-[10px] uppercase font-mono text-slate-400">Active Alerts</div>
              <div className="text-sm font-bold mt-0.5 font-mono flex items-center space-x-1">
                <span className={activeAlertsCount > 0 ? 'text-amber-400' : 'text-slate-400'}>
                  {activeAlertsCount} Active
                </span>
                {activeAlertsCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
              </div>
            </div>

            <div className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <div className="text-[10px] uppercase font-mono text-slate-400">Structured Logs</div>
              <div className="text-sm font-bold text-white mt-0.5 font-mono">
                {totalLogsCount} Records
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex space-x-2 border-t border-slate-800/80 mt-6 pt-4 overflow-x-auto">
          {[
            { id: 'logs', label: 'Structured Logs Explorer', icon: Terminal, count: logs.length },
            { id: 'health', label: 'Application Health & Subsystems', icon: Server },
            { id: 'metrics', label: 'Performance & Response Times', icon: Gauge },
            { id: 'alerts', label: 'Alerting Rules & Active Alerts', icon: Bell, count: activeAlertsCount, badgeColor: 'amber' },
            { id: 'errors', label: 'Global Error Hub & Fallback Testing', icon: Bug, count: globalErrors.filter((e) => !e.resolved).length, badgeColor: 'rose' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      tab.badgeColor === 'rose'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : tab.badgeColor === 'amber'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: STRUCTURED LOGS EXPLORER                                           */}
      {/* ========================================================================= */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs by action, message, path, traceId, agentId, or error..."
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsLiveStreaming(!isLiveStreaming)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                  isLiveStreaming
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {isLiveStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isLiveStreaming ? 'Live Stream: 2s' : 'Stream Paused'}</span>
              </button>

              <button
                onClick={handleEmitSampleLog}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
                title="Emit a simulated user action log entry"
              >
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                <span>Emit User Action</span>
              </button>

              <a
                href={api.getExportLogsUrl('json')}
                download="system-logs.json"
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </a>

              <a
                href={api.getExportLogsUrl('csv')}
                download="system-logs.csv"
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </a>

              <button
                onClick={handleClearLogs}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium border border-rose-500/30 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-mono text-[11px] mr-1">LEVEL:</span>
            {['all', 'info', 'warn', 'error', 'fatal', 'debug'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl as any)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono uppercase transition ${
                  selectedLevel === lvl
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                {lvl}
              </button>
            ))}

            <span className="text-slate-400 font-mono text-[11px] ml-3 mr-1">CATEGORY:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'api_request', label: 'API Requests' },
              { id: 'user_action', label: 'User Actions' },
              { id: 'agent_event', label: 'Agent Swarm' },
              { id: 'error', label: 'Errors' },
              { id: 'rollback', label: 'Rollbacks' },
              { id: 'flag_toggle', label: 'Feature Flags' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-2.5 py-1 rounded-md text-[11px] transition ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}

            <span className="text-slate-400 font-mono text-[11px] ml-3 mr-1">SOURCE:</span>
            {['all', 'frontend', 'backend', 'agent_swarm'].map((src) => (
              <button
                key={src}
                onClick={() => setSelectedSource(src as any)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono uppercase transition ${
                  selectedSource === src
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                {src.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Logs Stream View */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg">
            <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">
                SHOWING {logs.length} OF {totalLogsCount} STRUCTURED LOG ENTRIES
              </span>
              <span className="text-[11px]">Click any entry to inspect full JSON payload & trace</span>
            </div>

            {logs.length === 0 ? (
              <div className="py-16 text-center text-slate-500 space-y-2">
                <Terminal className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs">No structured logs match the current search or filters.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedLevel('all');
                    setSelectedCategory('all');
                    setSelectedSource('all');
                  }}
                  className="text-xs text-indigo-400 underline hover:text-indigo-300"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80 font-mono text-xs">
                {logs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  const isCopied = copiedLogId === log.id;

                  const levelColor =
                    log.level === 'fatal' || log.level === 'error'
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      : log.level === 'warn'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';

                  return (
                    <div
                      key={log.id}
                      className="hover:bg-slate-800/40 transition cursor-pointer"
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    >
                      <div className="p-3 flex items-start gap-3">
                        {/* Level Badge */}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border flex-shrink-0 ${levelColor}`}
                        >
                          {log.level}
                        </span>

                        {/* Timestamp */}
                        <span className="text-[11px] text-slate-500 whitespace-nowrap flex-shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString()}.
                          {String(new Date(log.timestamp).getMilliseconds()).padStart(3, '0')}
                        </span>

                        {/* Category & Source */}
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700/60 uppercase flex-shrink-0">
                          {log.source}:{log.category}
                        </span>

                        {/* Method / Status if API request */}
                        {log.method && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex-shrink-0 ${
                              log.statusCode && log.statusCode >= 500
                                ? 'bg-rose-500/20 text-rose-400'
                                : log.statusCode && log.statusCode >= 400
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}
                          >
                            {log.method} {log.statusCode || ''}
                          </span>
                        )}

                        {/* Latency if available */}
                        {typeof log.responseTimeMs === 'number' && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] flex-shrink-0 ${
                              log.responseTimeMs > 250
                                ? 'text-rose-400 bg-rose-500/10'
                                : log.responseTimeMs > 80
                                ? 'text-amber-400 bg-amber-500/10'
                                : 'text-emerald-400 bg-emerald-500/10'
                            }`}
                          >
                            {log.responseTimeMs}ms
                          </span>
                        )}

                        {/* Action & Message */}
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-slate-200 mr-2">[{log.action}]</span>
                          <span className="text-slate-300 font-sans text-xs">{log.message}</span>
                        </div>

                        {/* Trace ID */}
                        {log.traceId && (
                          <span className="text-[10px] text-indigo-400/80 font-mono hidden md:inline-block flex-shrink-0">
                            {log.traceId}
                          </span>
                        )}

                        <div className="text-slate-500">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>

                      {/* Expanded Details Accordion */}
                      {isExpanded && (
                        <div
                          className="px-4 pb-4 pt-1 bg-slate-950/90 border-t border-slate-800 text-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
                            <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
                              Structured Log Payload (ID: {log.id})
                            </span>
                            <button
                              onClick={() => copyLogText(log)}
                              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{isCopied ? 'Copied' : 'Copy JSON'}</span>
                            </button>
                          </div>

                          {/* Error Stack if available */}
                          {log.errorDetails && (
                            <div className="mt-3 p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 text-rose-300 space-y-1">
                              <div className="font-bold text-xs">
                                {log.errorDetails.name}: {log.errorDetails.message}
                              </div>
                              {log.errorDetails.stack && (
                                <pre className="text-[11px] text-slate-400 whitespace-pre-wrap max-h-40 overflow-y-auto">
                                  {log.errorDetails.stack}
                                </pre>
                              )}
                            </div>
                          )}

                          <pre className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                            {JSON.stringify(log, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: APPLICATION HEALTH & SUBSYSTEMS                                    */}
      {/* ========================================================================= */}
      {activeTab === 'health' && healthReport && (
        <div className="space-y-6">
          {/* Subsystems Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.entries(healthReport.subsystems) as [string, SubsystemHealth][]).map(([key, sub]) => {
              const isHealthy = sub.status === 'healthy';

              const isDegraded = sub.status === 'degraded';

              return (
                <div
                  key={key}
                  className={`p-4 rounded-xl border bg-slate-900 transition shadow-md ${
                    isHealthy
                      ? 'border-emerald-500/30'
                      : isDegraded
                      ? 'border-amber-500/30'
                      : 'border-rose-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{sub.name}</h4>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">{key}</span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${
                        isHealthy
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : isDegraded
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-2">{sub.message}</p>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Probe Latency:</span>
                    <span className="text-white font-bold">{sub.latencyMs}ms</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* System Host & Process Resources */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>Runtime Process & Hardware Allocation</span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-400">Node RSS Memory</span>
                <div className="text-lg font-bold text-indigo-400 mt-0.5 font-mono">
                  {healthReport.system.memoryRssMb} MB
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Resident process set</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-400">V8 Heap Allocation</span>
                <div className="text-lg font-bold text-white mt-0.5 font-mono">
                  {healthReport.system.heapUsedMb} / {healthReport.system.heapTotalMb} MB
                </div>
                <div className="text-[10px] text-slate-500 mt-1">JavaScript heap consumption</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-400">Host Free RAM</span>
                <div className="text-lg font-bold text-emerald-400 mt-0.5 font-mono">
                  {healthReport.system.freeMemMb} MB
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Available container memory</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-400">Process Uptime</span>
                <div className="text-lg font-bold text-amber-400 mt-0.5 font-mono">
                  {healthReport.uptimeSeconds}s
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Continuous operation</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Deep health diagnostic verified at {new Date(healthReport.timestamp).toLocaleTimeString()}</span>
              </div>
              <button
                onClick={loadData}
                className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Run Health Probe</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PERFORMANCE METRICS & HISTOGRAMS                                   */}
      {/* ========================================================================= */}
      {activeTab === 'metrics' && metrics && (
        <div className="space-y-6">
          {/* Key Latency Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400">Average Latency</span>
              <div className="text-2xl font-bold text-white font-mono mt-1">{metrics.latency.avgMs}ms</div>
              <div className="text-[11px] text-slate-500 mt-1">Across {metrics.totalRequests} API calls</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400">P50 Median</span>
              <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">{metrics.latency.p50Ms}ms</div>
              <div className="text-[11px] text-slate-500 mt-1">50% of requests faster</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400">P95 Tail Latency</span>
              <div className="text-2xl font-bold text-indigo-400 font-mono mt-1">{metrics.latency.p95Ms}ms</div>
              <div className="text-[11px] text-slate-500 mt-1">Target SLA: &lt; 350ms</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400">Throughput & Error Rate</span>
              <div className="text-2xl font-bold text-white font-mono mt-1">
                {metrics.throughputRps} <span className="text-xs font-normal text-slate-400">req/s</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Error rate: <span className="text-emerald-400 font-semibold">{metrics.errorRatePercent}%</span>
              </div>
            </div>
          </div>

          {/* Latency Distribution Histogram */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Response Time Distribution Histogram</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {metrics.latencyBuckets.map((bucket) => {
                const maxCount = Math.max(...metrics.latencyBuckets.map((b) => b.count), 1);
                const heightPercent = Math.max(8, Math.round((bucket.count / maxCount) * 100));

                return (
                  <div key={bucket.range} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center">
                    <span className="text-[11px] font-mono font-bold text-slate-300">{bucket.range}</span>
                    <div className="w-full bg-slate-800 rounded-full h-20 flex items-end p-1 my-2">
                      <div
                        className="w-full rounded-md bg-indigo-500 transition-all duration-500"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-white font-mono">{bucket.count}</span>
                    <span className="text-[10px] text-slate-500">requests</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Slowest Endpoints Table */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <HardDrive className="w-4 h-4 text-indigo-400" />
              <span>Slowest REST Route Endpoints (P95 Ranked)</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Method & Path</th>
                    <th className="py-2.5 px-3">Call Count</th>
                    <th className="py-2.5 px-3">Avg Latency</th>
                    <th className="py-2.5 px-3">P95 Latency</th>
                    <th className="py-2.5 px-3">Error Count</th>
                    <th className="py-2.5 px-3">Last Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {metrics.slowestEndpoints.map((ep) => (
                    <tr key={`${ep.method}-${ep.path}`} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-semibold text-white">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 mr-2 text-[10px]">
                          {ep.method}
                        </span>
                        {ep.path}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{ep.callCount}</td>
                      <td className="py-2.5 px-3 text-slate-300">{ep.avgDurationMs}ms</td>
                      <td className="py-2.5 px-3 font-bold text-indigo-400">{ep.p95DurationMs}ms</td>
                      <td className="py-2.5 px-3">
                        {ep.errorCount > 0 ? (
                          <span className="text-rose-400 font-bold">{ep.errorCount}</span>
                        ) : (
                          <span className="text-slate-500">0</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] ${
                            ep.lastStatusCode >= 400 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {ep.lastStatusCode}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ALERTING SYSTEM & FAULT INJECTION SANDBOX                           */}
      {/* ========================================================================= */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          {/* Active Alerts Banner */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <span>Active Alerts & Automated Incident Triggers ({activeAlerts.length})</span>
              </h3>
              <button
                onClick={loadData}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh</span>
              </button>
            </div>

            {activeAlerts.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-950 border border-slate-800 text-slate-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
                <p className="text-xs font-semibold text-slate-300">All Alert Rules Clear</p>
                <p className="text-[11px] text-slate-500">Zero threshold violations in the monitoring window.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeAlerts.map((alt) => {
                  const isCritical = alt.severity === 'critical';
                  const isResolved = alt.status === 'resolved';

                  return (
                    <div
                      key={alt.id}
                      className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                        isResolved
                          ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                          : isCritical
                          ? 'bg-rose-950/20 border-rose-500/40 text-slate-100'
                          : 'bg-amber-950/20 border-amber-500/40 text-slate-100'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase border ${
                              isCritical
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            }`}
                          >
                            {alt.severity}
                          </span>
                          <span className="font-bold text-white text-xs">{alt.title}</span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            Status: <strong className="uppercase">{alt.status}</strong>
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{alt.message}</p>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Triggered at: {new Date(alt.triggeredAt).toLocaleTimeString()} · Metric: {alt.metricValue} {alt.unit} (Threshold: {alt.threshold} {alt.unit})
                        </div>
                      </div>

                      {alt.status === 'active' && (
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <button
                            onClick={() => handleAcknowledgeAlert(alt.id)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
                          >
                            Acknowledge
                          </button>
                          <button
                            onClick={() => handleResolveAlert(alt.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow transition"
                          >
                            Resolve Alert
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Configured Alert Rules */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Configured System Alert Thresholds</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alertRules.map((rule) => (
                <div key={rule.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{rule.name}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                        rule.severity === 'critical' ? 'text-rose-400 bg-rose-500/10' : 'text-amber-400 bg-amber-500/10'
                      }`}
                    >
                      {rule.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{rule.description}</p>
                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500">Condition:</span>
                    <span className="text-indigo-400">
                      Value {rule.condition === 'gt' ? '>' : '<'} {rule.threshold} {rule.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Simulation Sandbox */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-indigo-500/30 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Flame className="w-4 h-4 text-rose-400" />
                <span>Fault Injection & Alert Simulation Testbed</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Inject controlled operational faults to test alert triggering, structured logging, and automated recovery.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={() => handleSimulateAlert('latency_spike')}
                disabled={isSimulatingAlert}
                className="p-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 text-left transition space-y-1"
              >
                <div className="text-xs font-bold text-white">Simulate P95 Latency Spike</div>
                <div className="text-[11px] text-slate-400">Injects 485ms requests to trigger latency alert rule.</div>
              </button>

              <button
                onClick={() => handleSimulateAlert('error_burst')}
                disabled={isSimulatingAlert}
                className="p-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/50 text-left transition space-y-1"
              >
                <div className="text-xs font-bold text-white">Simulate 5xx Error Spike</div>
                <div className="text-[11px] text-slate-400">Injects batch of 500 errors to test critical error threshold.</div>
              </button>

              <button
                onClick={() => handleSimulateAlert('memory_surge')}
                disabled={isSimulatingAlert}
                className="p-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-left transition space-y-1"
              >
                <div className="text-xs font-bold text-white">Simulate Memory Surge</div>
                <div className="text-[11px] text-slate-400">Simulates 460MB heap usage alert violation.</div>
              </button>

              <button
                onClick={() => handleSimulateAlert('subsystem_down')}
                disabled={isSimulatingAlert}
                className="p-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/50 text-left transition space-y-1"
              >
                <div className="text-xs font-bold text-white">Simulate Subsystem Fault</div>
                <div className="text-[11px] text-slate-400">Simulates database lock and critical alert generation.</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: GLOBAL ERROR HUB & FALLBACK TESTING                                */}
      {/* ========================================================================= */}
      {activeTab === 'errors' && (
        <div className="space-y-6">
          {/* Recent Global Errors Table */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>Centralized Global Error Registry ({globalErrors.length})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Intercepted runtime exceptions with user-friendly explanations, trace IDs, and fallback status.
                </p>
              </div>

              <button
                onClick={async () => {
                  await api.clearResolvedErrors();
                  loadData();
                }}
                className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded bg-slate-800"
              >
                Clear Resolved
              </button>
            </div>

            {globalErrors.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-950 border border-slate-800 text-slate-400">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                <p className="text-xs font-semibold text-slate-300">Zero Unhandled Errors</p>
              </div>
            ) : (
              <div className="space-y-3">
                {globalErrors.map((err) => (
                  <div
                    key={err.id}
                    className={`p-4 rounded-xl border space-y-2 ${
                      err.resolved
                        ? 'bg-slate-950/60 border-slate-800 opacity-60'
                        : 'bg-slate-950 border-rose-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            {err.type} {err.statusCode ? `· ${err.statusCode}` : ''}
                          </span>
                          <span className="font-bold text-white text-xs">{err.message}</span>
                          {err.fallbackActivated && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              FALLBACK ACTIVE
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-300 mt-1.5">{err.userFriendlyMessage}</p>

                        <div className="mt-2 text-xs text-amber-300/90 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                          <span className="font-bold">Suggested Remedy:</span> {err.suggestedRemedy}
                        </div>

                        {err.fallbackDescription && (
                          <div className="mt-1 text-xs text-indigo-300/90 bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20">
                            <span className="font-bold">Fallback Strategy:</span> {err.fallbackDescription}
                          </div>
                        )}

                        <div className="text-[10px] text-slate-500 font-mono mt-2">
                          Trace: {err.traceId} · Source: {err.source} · Time: {new Date(err.timestamp).toLocaleTimeString()}
                        </div>
                      </div>

                      {!err.resolved && (
                        <button
                          onClick={() => handleResolveError(err.id)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition flex-shrink-0"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fault Tolerance & Graceful Fallback Sandbox */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-indigo-500/30 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Bug className="w-4 h-4 text-indigo-400" />
                <span>Graceful Degradation & Error Handling Testbed</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Trigger various failure modes to verify centralized catching, user-friendly messages, and fallback execution.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={() => handleSimulateError('backend_500')}
                disabled={isSimulatingError}
                className="p-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition space-y-1"
              >
                <div className="text-xs font-bold text-white">Trigger Backend 500</div>
                <div className="text-[11px] text-slate-400">Verifies RFC-7807 error envelope, trace ID, and remedy.</div>
              </button>

              <button
                onClick={() => handleSimulateError('operational_fallback')}
                disabled={isSimulatingError}
                className="p-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition space-y-1"
              >
                <div className="text-xs font-bold text-white">Trigger Fallback Cache</div>
                <div className="text-[11px] text-slate-400">Verifies system supplies safe cached default state.</div>
              </button>

              <button
                onClick={() => handleSimulateError('validation_422')}
                disabled={isSimulatingError}
                className="p-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition space-y-1"
              >
                <div className="text-xs font-bold text-white">Trigger Validation 422</div>
                <div className="text-[11px] text-slate-400">Tests rejection of invalid out-of-range configurations.</div>
              </button>

              <button
                onClick={() => setTriggerReactCrash(true)}
                className="p-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-rose-500/30 text-left transition space-y-1"
              >
                <div className="text-xs font-bold text-rose-300">Test React Error Boundary</div>
                <div className="text-[11px] text-slate-400">Throws a render exception to test UI error containment.</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
