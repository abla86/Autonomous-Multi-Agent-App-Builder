import fs from 'fs';
import path from 'path';
import { StructuredLog, LogLevel, LogCategory, LogSource } from '../types';

const DATA_DIR = path.join(process.cwd(), 'data');
const LOGS_FILE = path.join(DATA_DIR, 'system-logs.json');

// In-memory cache for fast indexing and high-throughput logging
const MAX_LOGS_LIMIT = 2000;
let inMemoryLogs: StructuredLog[] = [];

// Seed initial structured logs for immediate rich observability
function getSeedLogs(): StructuredLog[] {
  const now = Date.now();
  const baseLogs: Array<Omit<StructuredLog, 'id' | 'timestamp'>> = [
    {
      level: 'info',
      category: 'system_health',
      source: 'backend',
      action: 'SYSTEM_BOOTSTRAP',
      message: 'Autonomous Swarm Orchestrator initialized on port 3000 with 20 worker definitions.',
      metadata: { port: 3000, pid: process.pid, platform: process.platform, nodeVersion: process.version },
      traceId: 'boot-001',
    },
    {
      level: 'info',
      category: 'agent_event',
      source: 'agent_swarm',
      action: 'AGENT_INITIALIZED',
      agentId: 'AGENT_1_ANALYST',
      message: 'Agent 1 (Lead System Analyst) established protocol session v2.1-swarm.',
      metadata: { priority: 'P0', role: 'Lead Architect', memoryAllocatedMb: 32 },
      traceId: 'tr-swm-001',
    },
    {
      level: 'info',
      category: 'agent_event',
      source: 'agent_swarm',
      action: 'AGENT_INITIALIZED',
      agentId: 'AGENT_13_DEVOPS',
      message: 'Agent 13 (DevOps & Build Specialist) bound health checks to Express endpoint /api/health.',
      metadata: { endpoint: '/api/health', pollIntervalMs: 5000 },
      traceId: 'tr-swm-002',
    },
    {
      level: 'info',
      category: 'api_request',
      source: 'backend',
      action: 'API_REQUEST_COMPLETED',
      method: 'GET',
      path: '/api/projects',
      statusCode: 200,
      responseTimeMs: 14,
      message: 'Retrieved project catalog successfully.',
      traceId: 'req-proj-01',
      metadata: { projectCount: 1, cached: true },
    },
    {
      level: 'info',
      category: 'user_action',
      source: 'frontend',
      action: 'USER_NAVIGATION',
      message: 'User navigated to 20-Agent Swarm execution console.',
      userId: 'user_dev_01',
      traceId: 'usr-nav-01',
      metadata: { activeTab: 'swarm', viewport: '1920x1080' },
    },
    {
      level: 'info',
      category: 'rollback',
      source: 'backend',
      action: 'SNAPSHOT_CHECKPOINT_CREATED',
      agentId: 'AGENT_17_INTEGRITY',
      message: 'Pre-flight baseline snapshot created for proj-swarm-core.',
      traceId: 'tr-snap-01',
      metadata: { snapshotLabel: 'Initial Baseline Scaffold Snapshot', fileCount: 6 },
    },
    {
      level: 'warn',
      category: 'performance',
      source: 'backend',
      action: 'HIGH_LATENCY_WARNING',
      message: 'AST dependency tree calculation exceeded 80ms target threshold.',
      responseTimeMs: 94,
      traceId: 'tr-perf-01',
      metadata: { targetMs: 80, actualMs: 94, agentId: 'AGENT_14_DEPENDENCY' },
    },
    {
      level: 'info',
      category: 'flag_toggle',
      source: 'backend',
      action: 'FEATURE_FLAG_EVALUATION',
      message: 'Feature flag "automated_rollback_engine" evaluated: TRUE for all environments.',
      traceId: 'tr-ff-01',
      metadata: { key: 'automated_rollback_engine', enabled: true },
    },
    {
      level: 'error',
      category: 'error',
      source: 'backend',
      action: 'TEST_GUARD_INTERCEPT',
      agentId: 'AGENT_11_TEST',
      message: 'Simulated mutation failed Unit assertion in /src/engine/orchestrator.ts: Queue priority invariant violated.',
      statusCode: 422,
      traceId: 'tr-err-01',
      errorDetails: {
        name: 'AssertionError',
        message: 'Expected task priority P0 to be scheduled at index 0',
        code: 'ERR_ASSERTION_FAILED',
        stack: 'AssertionError: Expected task priority P0 at index 0\n    at TestEngine.verifyQueueOrder (/src/engine/tests.ts:42:15)\n    at evaluateCriticalTests (/src/server/rollbackEngine.ts:182:11)',
      },
      metadata: { testId: 'CHK-01', recoveredByRollback: true },
    },
    {
      level: 'info',
      category: 'rollback',
      source: 'backend',
      action: 'AUTO_ROLLBACK_EXECUTED',
      agentId: 'AGENT_18_RECOVERY',
      message: 'Automated rollback triggered: Reverted 1 candidate mutation file to Snapshot SNAP-BASE-001.',
      traceId: 'tr-rb-01',
      metadata: { revertedFiles: ['/src/engine/orchestrator.ts'], durationMs: 18 },
    },
  ];

  return baseLogs.map((log, index) => ({
    ...log,
    id: `log-${Date.now() - (baseLogs.length - index) * 60000}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date(now - (baseLogs.length - index) * 60000).toISOString(),
  }));
}

function loadLogs(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(LOGS_FILE)) {
      const data = fs.readFileSync(LOGS_FILE, 'utf-8');
      inMemoryLogs = JSON.parse(data);
      if (!Array.isArray(inMemoryLogs) || inMemoryLogs.length === 0) {
        inMemoryLogs = getSeedLogs();
        saveLogs();
      }
    } else {
      inMemoryLogs = getSeedLogs();
      saveLogs();
    }
  } catch (err) {
    console.error('Error loading structured logs from disk:', err);
    inMemoryLogs = getSeedLogs();
  }
}

let saveTimeout: NodeJS.Timeout | null = null;
function debouncedSaveLogs(): void {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveLogs();
  }, 1000);
}

function saveLogs(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(LOGS_FILE, JSON.stringify(inMemoryLogs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write structured logs to disk:', err);
  }
}

// Initialize on module load
loadLogs();

export function addLog(entry: Partial<StructuredLog>): StructuredLog {
  const newLog: StructuredLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: entry.timestamp || new Date().toISOString(),
    level: entry.level || 'info',
    category: entry.category || 'api_request',
    source: entry.source || 'backend',
    action: entry.action || 'GENERIC_EVENT',
    message: entry.message || '',
    method: entry.method,
    path: entry.path,
    statusCode: entry.statusCode,
    responseTimeMs: entry.responseTimeMs,
    userId: entry.userId,
    agentId: entry.agentId,
    traceId: entry.traceId || `tr-${Math.random().toString(36).substring(2, 9)}`,
    errorDetails: entry.errorDetails,
    metadata: entry.metadata,
  };

  inMemoryLogs.unshift(newLog);

  // Keep size constrained
  if (inMemoryLogs.length > MAX_LOGS_LIMIT) {
    inMemoryLogs = inMemoryLogs.slice(0, MAX_LOGS_LIMIT);
  }

  debouncedSaveLogs();
  return newLog;
}

export function getLogs(filter?: {
  search?: string;
  level?: LogLevel | 'all';
  category?: LogCategory | 'all';
  source?: LogSource | 'all';
  limit?: number;
  since?: string;
}): { logs: StructuredLog[]; total: number; filteredCount: number } {
  let result = [...inMemoryLogs];

  if (filter?.search) {
    const q = filter.search.toLowerCase();
    result = result.filter(
      (log) =>
        log.message.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        (log.path && log.path.toLowerCase().includes(q)) ||
        (log.traceId && log.traceId.toLowerCase().includes(q)) ||
        (log.agentId && log.agentId.toLowerCase().includes(q)) ||
        (log.errorDetails?.message && log.errorDetails.message.toLowerCase().includes(q))
    );
  }

  if (filter?.level && filter.level !== 'all') {
    result = result.filter((log) => log.level === filter.level);
  }

  if (filter?.category && filter.category !== 'all') {
    result = result.filter((log) => log.category === filter.category);
  }

  if (filter?.source && filter.source !== 'all') {
    result = result.filter((log) => log.source === filter.source);
  }

  if (filter?.since) {
    const sinceDate = new Date(filter.since).getTime();
    result = result.filter((log) => new Date(log.timestamp).getTime() >= sinceDate);
  }

  const filteredCount = result.length;
  const limit = filter?.limit || 100;
  const pagedLogs = result.slice(0, limit);

  return {
    logs: pagedLogs,
    total: inMemoryLogs.length,
    filteredCount,
  };
}

export function clearLogs(): void {
  inMemoryLogs = [];
  saveLogs();
}

export function exportLogs(format: 'json' | 'csv'): string {
  if (format === 'csv') {
    const header = ['Timestamp', 'Level', 'Category', 'Source', 'Action', 'Message', 'Method', 'Path', 'Status', 'DurationMs', 'TraceId'].join(',');
    const rows = inMemoryLogs.map((log) =>
      [
        `"${log.timestamp}"`,
        `"${log.level}"`,
        `"${log.category}"`,
        `"${log.source}"`,
        `"${log.action}"`,
        `"${(log.message || '').replace(/"/g, '""')}"`,
        `"${log.method || ''}"`,
        `"${log.path || ''}"`,
        log.statusCode || '',
        log.responseTimeMs || '',
        `"${log.traceId || ''}"`,
      ].join(',')
    );
    return [header, ...rows].join('\n');
  }

  return JSON.stringify(inMemoryLogs, null, 2);
}
