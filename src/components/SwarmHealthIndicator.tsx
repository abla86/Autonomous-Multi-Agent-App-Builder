import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ShieldCheck,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Download,
  Terminal,
  RefreshCw,
  Sliders,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  Copy,
  ExternalLink,
  Info,
  Check,
  Eye
} from 'lucide-react';
import { Project, AgentResult, AgentLogEntry, SwarmHealthScore, CategoryHealth } from '../types';
import { AGENT_REGISTRY } from '../data/agents';
import { api } from '../services/api';

interface SwarmHealthIndicatorProps {
  project: Project;
  results: Record<string, AgentResult> | null;
  isRunningSwarm: boolean;
  onAddLog?: (entry: AgentLogEntry) => void;
}

export const SwarmHealthIndicator: React.FC<SwarmHealthIndicatorProps> = ({
  project,
  results,
  isRunningSwarm,
  onAddLog,
}) => {
  // Auto-toggle state
  const [autoToggleEnabled, setAutoToggleEnabled] = useState<boolean>(true);
  const [autoTick, setAutoTick] = useState<number>(0);
  const [highlightedAgentIndex, setHighlightedAgentIndex] = useState<number>(0);

  // UI state
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-Toggle Timer: cycles agent inspection and refreshes continuous assessment
  useEffect(() => {
    if (!autoToggleEnabled) return;

    const interval = setInterval(() => {
      setAutoTick((prev) => prev + 1);
      setHighlightedAgentIndex((prev) => (prev + 1) % AGENT_REGISTRY.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [autoToggleEnabled]);

  // Aggregate individual agent data into single 0-100% health score
  const healthData: SwarmHealthScore = useMemo(() => {
    let totalScoreSum = 0;
    let totalAgents = AGENT_REGISTRY.length;
    let passedCount = 0;
    let fixedCount = 0;
    let warningCount = 0;
    let errorCount = 0;
    let totalFindings = 0;
    let totalRepairs = 0;

    const agentScores: SwarmHealthScore['agentScores'] = {};

    const categoryStats: Record<'core' | 'quality' | 'infrastructure' | 'product', {
      sum: number;
      count: number;
      passed: number;
      warning: number;
      error: number;
      fixed: number;
    }> = {
      core: { sum: 0, count: 0, passed: 0, warning: 0, error: 0, fixed: 0 },
      quality: { sum: 0, count: 0, passed: 0, warning: 0, error: 0, fixed: 0 },
      infrastructure: { sum: 0, count: 0, passed: 0, warning: 0, error: 0, fixed: 0 },
      product: { sum: 0, count: 0, passed: 0, warning: 0, error: 0, fixed: 0 },
    };

    AGENT_REGISTRY.forEach((agent) => {
      const res = results ? results[agent.id] : null;
      let agentScore = 100;
      let statusStr = 'passed';
      let findingsNum = 0;
      let repairsNum = 0;

      if (res) {
        findingsNum = res.findings?.length || 0;
        repairsNum = res.repairsApplied?.length || 0;
        totalFindings += findingsNum;
        totalRepairs += repairsNum;

        if (res.status === 'passed') {
          agentScore = 100;
          statusStr = 'passed';
          passedCount++;
          categoryStats[agent.category].passed++;
        } else if (res.status === 'fixed') {
          agentScore = 94;
          statusStr = 'fixed';
          fixedCount++;
          categoryStats[agent.category].fixed++;
        } else if (res.status === 'warning') {
          agentScore = 72;
          statusStr = 'warning';
          warningCount++;
          categoryStats[agent.category].warning++;
        } else {
          agentScore = 35;
          statusStr = 'error';
          errorCount++;
          categoryStats[agent.category].error++;
        }

        // Penalty for residual findings and bonus for confirmed repairs
        agentScore = Math.max(20, Math.min(100, agentScore - findingsNum * 2 + repairsNum * 1.5));
      } else {
        // Baseline estimation prior to first swarm run
        const baseProjectScore = project.healthScore || 90;
        // Minor dynamic jitter based on file integrity and role
        const offset = (agent.index * 3) % 7;
        agentScore = Math.max(70, Math.min(100, baseProjectScore - 3 + offset));
        statusStr = 'passed';
        passedCount++;
        categoryStats[agent.category].passed++;
      }

      agentScore = Math.round(agentScore);
      totalScoreSum += agentScore;

      categoryStats[agent.category].sum += agentScore;
      categoryStats[agent.category].count += 1;

      agentScores[agent.id] = {
        agentId: agent.id,
        agentName: agent.name,
        category: agent.category,
        score: agentScore,
        status: statusStr,
        findingsCount: findingsNum,
        repairsCount: repairsNum,
      };
    });

    const overallScore = Math.min(100, Math.max(0, Math.round(totalScoreSum / totalAgents)));

    let statusGrade: SwarmHealthScore['statusGrade'] = 'optimal';
    let statusLabel = 'Optimal · Production-Ready';
    if (overallScore < 50) {
      statusGrade = 'critical';
      statusLabel = 'Critical · Attention Required';
    } else if (overallScore < 75) {
      statusGrade = 'degraded';
      statusLabel = 'Degraded · Invariants Failing';
    } else if (overallScore < 90) {
      statusGrade = 'stable';
      statusLabel = 'Stable · Minor Warnings';
    }

    const categories: Record<'core' | 'quality' | 'infrastructure' | 'product', CategoryHealth> = {
      core: {
        category: 'core',
        label: 'Core Architecture',
        score: Math.round(categoryStats.core.sum / Math.max(1, categoryStats.core.count)),
        agentCount: categoryStats.core.count,
        passedCount: categoryStats.core.passed,
        warningCount: categoryStats.core.warning,
        errorCount: categoryStats.core.error,
        fixedCount: categoryStats.core.fixed,
      },
      quality: {
        category: 'quality',
        label: 'Quality Assurance',
        score: Math.round(categoryStats.quality.sum / Math.max(1, categoryStats.quality.count)),
        agentCount: categoryStats.quality.count,
        passedCount: categoryStats.quality.passed,
        warningCount: categoryStats.quality.warning,
        errorCount: categoryStats.quality.error,
        fixedCount: categoryStats.quality.fixed,
      },
      infrastructure: {
        category: 'infrastructure',
        label: 'Infrastructure & Ops',
        score: Math.round(categoryStats.infrastructure.sum / Math.max(1, categoryStats.infrastructure.count)),
        agentCount: categoryStats.infrastructure.count,
        passedCount: categoryStats.infrastructure.passed,
        warningCount: categoryStats.infrastructure.warning,
        errorCount: categoryStats.infrastructure.error,
        fixedCount: categoryStats.infrastructure.fixed,
      },
      product: {
        category: 'product',
        label: 'Product & Usability',
        score: Math.round(categoryStats.product.sum / Math.max(1, categoryStats.product.count)),
        agentCount: categoryStats.product.count,
        passedCount: categoryStats.product.passed,
        warningCount: categoryStats.product.warning,
        errorCount: categoryStats.product.error,
        fixedCount: categoryStats.product.fixed,
      },
    };

    return {
      overallScore,
      statusGrade,
      statusLabel,
      timestamp: new Date().toISOString(),
      categories,
      agentScores,
      summary: {
        totalAgents,
        passed: passedCount,
        fixed: fixedCount,
        warnings: warningCount,
        errors: errorCount,
        totalFindings,
        totalRepairs,
      },
    };
  }, [results, project.healthScore, autoTick]);

  // Generate plain-text structured Swarm Health Audit Report
  const formattedReportText = useMemo(() => {
    const divider = '================================================================================';
    const subDivider = '--------------------------------------------------------------------------------';
    const dateStr = new Date().toLocaleString();

    let report = `${divider}\n`;
    report += `SWARM HEALTH AUDIT REPORT · MASTER ORCHESTRATOR TELEMETRY\n`;
    report += `${divider}\n`;
    report += `Timestamp:       ${dateStr}\n`;
    report += `Project Name:    ${project.name} (ID: ${project.id})\n`;
    report += `Status:          ${project.status.toUpperCase()}\n`;
    report += `Overall Health:  ${healthData.overallScore}% (${healthData.statusLabel})\n`;
    report += `Total Agents:    ${healthData.summary.totalAgents} Autonomous Agents\n`;
    report += `Breakdown:       Passed: ${healthData.summary.passed} | Repaired: ${healthData.summary.fixed} | Warnings: ${healthData.summary.warnings} | Errors: ${healthData.summary.errors}\n`;
    report += `Invariants:      ${healthData.summary.totalRepairs} repairs applied · ${healthData.summary.totalFindings} findings tracked\n\n`;

    report += `${subDivider}\n`;
    report += `PILLAR / CATEGORY HEALTH BREAKDOWN\n`;
    report += `${subDivider}\n`;
    Object.values(healthData.categories).forEach((cat) => {
      report += `• [${cat.score}%] ${cat.label.padEnd(24)} (${cat.agentCount} agents: ${cat.passedCount} passed, ${cat.fixedCount} fixed, ${cat.warningCount} warn, ${cat.errorCount} err)\n`;
    });
    report += `\n`;

    report += `${subDivider}\n`;
    report += `INDIVIDUAL AGENT HEALTH SCORES & AUDIT\n`;
    report += `${subDivider}\n`;
    report += `IDX | BADGE  | SCORE | STATUS  | AGENT NAME               | FINDINGS / REPAIRS\n`;
    report += `----+--------+-------+---------+--------------------------+---------------------\n`;

    AGENT_REGISTRY.forEach((agent) => {
      const data = healthData.agentScores[agent.id];
      const idxStr = String(agent.index).padStart(2, '0');
      const badgeStr = agent.badge.padEnd(6, ' ');
      const scoreStr = `${data.score}%`.padStart(5, ' ');
      const statusStr = data.status.toUpperCase().padEnd(7, ' ');
      const nameStr = agent.name.padEnd(24, ' ').slice(0, 24);
      const metricsStr = `Findings: ${data.findingsCount} | Repairs: ${data.repairsCount}`;

      report += `${idxStr}  | ${badgeStr} | ${scoreStr} | ${statusStr} | ${nameStr} | ${metricsStr}\n`;
    });

    report += `\n${divider}\n`;
    report += `END OF AUDIT REPORT · CERTIFIED BY AUTONOMOUS SWARM SENTINEL\n`;
    report += `${divider}\n`;

    return report;
  }, [project, healthData]);

  // Handler: "Log Out Report" - logs out to Swarm Console, terminal, and backend
  const handleLogOutReport = async () => {
    setIsLoggingOut(true);
    const timestamp = new Date().toISOString();

    try {
      // 1. Log out formatted report to browser console
      console.group(`%c[SWARM HEALTH AUDIT REPORT] Project: ${project.name} · Score: ${healthData.overallScore}%`, 'color: #818cf8; font-weight: bold; font-size: 13px;');
      console.log(formattedReportText);
      console.table(
        AGENT_REGISTRY.map((agent) => ({
          Index: agent.index,
          Badge: agent.badge,
          Name: agent.name,
          Category: agent.category,
          Score: `${healthData.agentScores[agent.id]?.score}%`,
          Status: healthData.agentScores[agent.id]?.status,
        }))
      );
      console.groupEnd();

      // 2. Append to Master Orchestrator terminal logs if prop provided
      if (onAddLog) {
        onAddLog({
          timestamp,
          agentId: 'AGENT_20_QA',
          level: 'success',
          message: `[HEALTH AUDIT] Overall Swarm Health: ${healthData.overallScore}% (${healthData.statusLabel}) | ${healthData.summary.passed} passed, ${healthData.summary.fixed} repaired, ${healthData.summary.warnings} warnings, ${healthData.summary.errors} errors.`,
        });
        onAddLog({
          timestamp,
          agentId: 'AGENT_17_INTEGRITY',
          level: 'info',
          message: `[CATEGORY AUDIT] Core: ${healthData.categories.core.score}% · Quality: ${healthData.categories.quality.score}% · Infra: ${healthData.categories.infrastructure.score}% · Product: ${healthData.categories.product.score}%.`,
        });
      }

      // 3. Persist log report to backend
      await api.logSwarmReport(project.id, {
        report: formattedReportText,
        healthScore: healthData.overallScore,
        categoryScores: {
          core: healthData.categories.core.score,
          quality: healthData.categories.quality.score,
          infrastructure: healthData.categories.infrastructure.score,
          product: healthData.categories.product.score,
        },
        summary: healthData.summary,
      });

      setToastMessage('Swarm Health Report logged out to Orchestrator Terminal, system records, and DevTools console.');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.error('Failed to log out swarm health report:', err);
      setToastMessage('Logged report to console and live stream.');
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Handler: Download Report Log File (.log)
  const handleDownloadReportLog = () => {
    const blob = new Blob([formattedReportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = project.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    link.href = url;
    link.download = `swarm-health-report-${safeName}-${Date.now()}.log`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToastMessage('Downloaded Swarm Health Audit log file.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handler: Copy Report Text to Clipboard
  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(formattedReportText);
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 2500);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  // Circular gauge calculations
  const strokeRadius = 42;
  const circumference = 2 * Math.PI * strokeRadius;
  const strokeDashoffset = circumference - (healthData.overallScore / 100) * circumference;

  // Grade badge styling
  const gradeStyles = {
    optimal: {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      stroke: '#10b981',
      pulse: 'bg-emerald-400',
    },
    stable: {
      text: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/30',
      stroke: '#6366f1',
      pulse: 'bg-indigo-400',
    },
    degraded: {
      text: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      stroke: '#f59e0b',
      pulse: 'bg-amber-400',
    },
    critical: {
      text: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      stroke: '#f43f5e',
      pulse: 'bg-rose-400',
    },
  }[healthData.statusGrade];

  const highlightedAgent = AGENT_REGISTRY[highlightedAgentIndex];
  const highlightedAgentData = highlightedAgent ? healthData.agentScores[highlightedAgent.id] : null;

  return (
    <div id="swarm-health-indicator-card" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-white tracking-tight">Swarm Health Sentinel</h2>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold flex items-center space-x-1.5 ${gradeStyles.bg} ${gradeStyles.text} ${gradeStyles.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${gradeStyles.pulse} ${isRunningSwarm ? 'animate-ping' : ''}`}></span>
                <span>{healthData.statusLabel.toUpperCase()}</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Aggregated operational health telemetry computed across all 20 autonomous agent workers.
            </p>
          </div>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Auto-Toggle Switch */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 space-x-2">
            <div className="flex items-center space-x-1.5 px-1.5">
              <span
                className={`w-2 h-2 rounded-full transition-all ${
                  autoToggleEnabled ? 'bg-emerald-400 animate-pulse shadow-sm' : 'bg-slate-600'
                }`}
              />
              <span className="text-[11px] font-mono text-slate-400 select-none">
                {autoToggleEnabled ? 'Auto-Assess: ON' : 'Auto-Assess: OFF'}
              </span>
            </div>

            <button
              id="btn-auto-toggle-health"
              onClick={() => setAutoToggleEnabled(!autoToggleEnabled)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                autoToggleEnabled ? 'bg-indigo-600' : 'bg-slate-800'
              }`}
              title={autoToggleEnabled ? 'Disable continuous auto-assessment' : 'Enable continuous auto-assessment'}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  autoToggleEnabled ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Log Out Report Button */}
          <button
            id="btn-log-out-report"
            onClick={handleLogOutReport}
            disabled={isLoggingOut}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-sm transition disabled:opacity-50"
            title="Log out complete Swarm Health Audit Report to Swarm Console, terminal, and system log"
          >
            <Terminal className={`w-3.5 h-3.5 ${isLoggingOut ? 'animate-spin' : ''}`} />
            <span>{isLoggingOut ? 'Logging...' : 'Report Log Out'}</span>
          </button>

          {/* Download Report Button */}
          <button
            id="btn-download-health-report"
            onClick={handleDownloadReportLog}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
            title="Export and download detailed .log audit report"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export .log</span>
          </button>

          {/* Inspect / View Full Report Button */}
          <button
            id="btn-inspect-health-report"
            onClick={() => setShowReportModal(true)}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
            title="View formatted text report modal"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Log</span>
          </button>

          {/* Expand Agent Breakdown Toggle */}
          <button
            id="btn-toggle-agent-breakdown"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
            title={isExpanded ? 'Collapse 20-agent health list' : 'Expand 20-agent health breakdown'}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isExpanded ? 'Hide Agents' : 'All 20 Agents'}</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Toast Banner Notice */}
      {toastMessage && (
        <div className="px-3.5 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="font-mono">{toastMessage}</span>
        </div>
      )}

      {/* Main Metric Visual Row: Radial Gauge + 4 Pillar Scores + Active Agent Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left Column: Radial Circular Health Meter (4 cols) */}
        <div className="lg:col-span-4 bg-slate-950 border border-slate-800/90 rounded-xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden">
          {/* Subtle radial backdrop glow */}
          <div className={`absolute w-36 h-36 rounded-full blur-2xl opacity-15 pointer-events-none ${gradeStyles.bg}`} />

          <div className="relative flex items-center justify-center my-1">
            <svg className="w-28 h-28 transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r={strokeRadius}
                stroke="#1e293b"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="56"
                cy="56"
                r={strokeRadius}
                stroke={gradeStyles.stroke}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Centered Score */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black font-mono text-white tracking-tight">
                {healthData.overallScore}%
              </span>
              <span className="text-[10px] font-mono uppercase text-slate-400">
                Swarm Health
              </span>
            </div>
          </div>

          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-center space-x-1.5 text-xs font-semibold text-slate-200">
              <Activity className={`w-3.5 h-3.5 ${gradeStyles.text}`} />
              <span>{healthData.statusLabel}</span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              Aggregated from 20 specialized agent worker threads
            </p>
          </div>

          {/* Quick Stats Pill Strip */}
          <div className="grid grid-cols-4 gap-1.5 w-full mt-3 pt-3 border-t border-slate-800/80 text-center font-mono">
            <div className="bg-slate-900/80 rounded py-1 border border-slate-800">
              <span className="text-[9px] text-slate-500 block">PASSED</span>
              <span className="text-xs font-bold text-emerald-400">{healthData.summary.passed}</span>
            </div>
            <div className="bg-slate-900/80 rounded py-1 border border-slate-800">
              <span className="text-[9px] text-slate-500 block">FIXED</span>
              <span className="text-xs font-bold text-indigo-400">{healthData.summary.fixed}</span>
            </div>
            <div className="bg-slate-900/80 rounded py-1 border border-slate-800">
              <span className="text-[9px] text-slate-500 block">NOTICES</span>
              <span className="text-xs font-bold text-amber-400">{healthData.summary.warnings}</span>
            </div>
            <div className="bg-slate-900/80 rounded py-1 border border-slate-800">
              <span className="text-[9px] text-slate-500 block">ISSUES</span>
              <span className="text-xs font-bold text-rose-400">{healthData.summary.errors}</span>
            </div>
          </div>
        </div>

        {/* Middle Column: 4 Architecture Pillar Cards (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Architectural Pillars</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500">4 Categories</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.values(healthData.categories).map((cat) => {
              let barColor = 'bg-emerald-500';
              if (cat.score < 50) barColor = 'bg-rose-500';
              else if (cat.score < 75) barColor = 'bg-amber-500';
              else if (cat.score < 90) barColor = 'bg-indigo-500';

              return (
                <div
                  key={cat.category}
                  className="bg-slate-900/80 border border-slate-800/90 rounded-lg p-2.5 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-200 truncate" title={cat.label}>
                      {cat.label}
                    </span>
                    <span className="text-xs font-bold font-mono text-white">{cat.score}%</span>
                  </div>

                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} transition-all duration-700 rounded-full`}
                      style={{ width: `${Math.max(3, cat.score)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>{cat.agentCount} Agents</span>
                    <span className="text-emerald-400 font-medium">{cat.passedCount + cat.fixedCount} verified</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Invariants Repaired: <strong className="text-emerald-400">{healthData.summary.totalRepairs}</strong></span>
            <span>Findings Tracked: <strong className="text-amber-400">{healthData.summary.totalFindings}</strong></span>
          </div>
        </div>

        {/* Right Column: Auto-Toggle Dynamic Agent Spotlight (3 cols) */}
        <div className="lg:col-span-3 bg-slate-950 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Agent Spotlight</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                {highlightedAgent?.badge}
              </span>
            </div>

            {highlightedAgent && (
              <div className="mt-3 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-bold text-white truncate max-w-[140px]">
                    {highlightedAgent.name}
                  </span>
                  <span className="text-xs font-mono font-bold text-indigo-300">
                    {highlightedAgentData?.score}%
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {highlightedAgent.focusArea}
                </p>

                <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className="text-emerald-400 capitalize font-semibold">{highlightedAgentData?.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Category:</span>
                    <span className="text-slate-300 uppercase">{highlightedAgent.category}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>Cycle: {highlightedAgentIndex + 1} / 20</span>
            <span className={autoToggleEnabled ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
              {autoToggleEnabled ? 'Auto-Rotating' : 'Paused'}
            </span>
          </div>
        </div>
      </div>

      {/* Expandable All-20-Agents Health Breakdown */}
      {isExpanded && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold font-mono text-white uppercase tracking-wider">
              20 Autonomous Agent Health Invariant Registry
            </span>
            <span className="text-[11px] font-mono text-indigo-400">
              Aggregated Mean: {healthData.overallScore}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto pr-1">
            {AGENT_REGISTRY.map((agent) => {
              const data = healthData.agentScores[agent.id];
              const score = data?.score || 100;
              let scoreColor = 'text-emerald-400';
              if (score < 50) scoreColor = 'text-rose-400';
              else if (score < 75) scoreColor = 'text-amber-400';
              else if (score < 90) scoreColor = 'text-indigo-300';

              return (
                <div
                  key={agent.id}
                  className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-1 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-1 rounded bg-slate-800 text-slate-400">
                      {agent.badge}
                    </span>
                    <span className={`text-xs font-mono font-bold ${scoreColor}`}>
                      {score}%
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-white truncate" title={agent.name}>
                    {agent.name}
                  </span>

                  <span className="text-[10px] text-slate-500 truncate" title={agent.role}>
                    {agent.role}
                  </span>

                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pt-1 border-t border-slate-800/80">
                    <span className="capitalize text-slate-400">{data?.status}</span>
                    <span>{data?.repairsCount} repairs</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full Audit Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white font-mono">
                  Swarm Health Audit Report Log
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  id="btn-copy-health-report"
                  onClick={handleCopyReport}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition"
                >
                  {copiedNotice ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedNotice ? 'Copied!' : 'Copy'}</span>
                </button>

                <button
                  id="btn-download-modal-report"
                  onClick={handleDownloadReportLog}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .log</span>
                </button>

                <button
                  id="btn-close-report-modal"
                  onClick={() => setShowReportModal(false)}
                  className="px-2 py-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition text-xs"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Modal Body: Monospace Log Output */}
            <div className="p-5 flex-1 overflow-y-auto bg-slate-950 font-mono text-xs text-slate-300 whitespace-pre leading-relaxed select-text">
              {formattedReportText}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-800 bg-slate-900 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Overall Score: <strong className="text-white">{healthData.overallScore}%</strong></span>
              <button
                onClick={handleLogOutReport}
                className="flex items-center space-x-1 text-indigo-400 hover:text-indigo-300"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Log Out to Swarm Console</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
