import {
  Project,
  SystemStatus,
  SwarmExecutionState,
  TestSuiteSummary,
  SecurityReport,
  DeploymentGateCheck,
  SystemPerformanceMetrics,
  FeatureFlag,
  ProjectSnapshot,
  RollbackLog,
  RollbackConfig,
  SwarmProtocolMessage,
  AgentId,
  StructuredLog,
  LogLevel,
  LogCategory,
  LogSource,
  ApplicationHealthReport,
  DetailedMonitoringMetrics,
  AlertRule,
  AlertInstance,
  GlobalErrorEvent,
} from '../types';

async function safeJson(res: Response, endpoint: string): Promise<any> {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error(`Endpoint ${endpoint} returned non-JSON response (${res.status}): ${text.substring(0, 100)}`);
  }
  return res.json();
}

export const api = {
  async getHealth(): Promise<any> {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
    return safeJson(res, '/api/health');
  },

  async getPerformanceMetrics(): Promise<SystemPerformanceMetrics> {
    const res = await fetch('/api/system/performance');
    if (!res.ok) throw new Error(`Performance metrics failed: ${res.statusText}`);
    return safeJson(res, '/api/system/performance');
  },


  async resetPerformanceTelemetry(): Promise<any> {
    const res = await fetch('/api/system/performance/reset', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset performance telemetry');
    return res.json();
  },

  async triggerGarbageCollection(): Promise<{ success: boolean; freedRssMb: number; freedHeapMb: number; currentRssMb: number; currentHeapMb: number }> {
    const res = await fetch('/api/system/gc', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to trigger memory cleanup');
    return res.json();
  },

  async getSystemStatus(): Promise<SystemStatus> {
    const res = await fetch('/api/system/status');
    if (!res.ok) throw new Error(`System status failed: ${res.statusText}`);
    return res.json();
  },

  async getProjects(): Promise<Project[]> {
    const res = await fetch('/api/projects');
    if (!res.ok) throw new Error(`Failed to fetch projects: ${res.statusText}`);
    const data = await res.json();
    return data.projects || [];
  },

  async getProject(id: string): Promise<Project> {
    const res = await fetch(`/api/projects/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch project: ${res.statusText}`);
    const data = await res.json();
    return data.project;
  },

  async createProject(name: string, description: string): Promise<Project> {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create project');
    }
    const data = await res.json();
    return data.project;
  },

  async updateProject(id: string, payload: Partial<Project>): Promise<Project> {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update project');
    const data = await res.json();
    return data.project;
  },

  async deleteProject(id: string): Promise<void> {
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete project');
  },

  async saveFile(projectId: string, file: { id?: string; name: string; path: string; content: string; language: string }): Promise<any> {
    const res = await fetch(`/api/projects/${projectId}/files`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(file),
    });
    if (!res.ok) throw new Error('Failed to save file');
    return res.json();
  },

  async deleteFile(projectId: string, fileId: string): Promise<any> {
    const res = await fetch(`/api/projects/${projectId}/files/${fileId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete file');
    return res.json();
  },

  async runSwarm(projectId: string): Promise<{ executionTimeMs: number; results: Record<string, any>; logs: any[]; project: Project }> {
    const res = await fetch(`/api/projects/${projectId}/swarm/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Swarm run failed');
    }
    return res.json();
  },

  async logSwarmReport(projectId: string, payload: { report: string; healthScore: number; categoryScores?: any; summary?: any }): Promise<any> {
    const res = await fetch(`/api/projects/${projectId}/swarm/report-log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to log swarm health report');
    return res.json();
  },

  async runTests(projectId: string): Promise<TestSuiteSummary> {
    const res = await fetch(`/api/projects/${projectId}/tests/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to execute test suite');
    return res.json();
  },

  async runSecurityScan(projectId: string): Promise<SecurityReport> {
    const res = await fetch(`/api/projects/${projectId}/security-scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to run security scanner');
    const data = await res.json();
    return data.report;
  },

  async consultAI(projectId: string, prompt: string, contextFileId?: string): Promise<any> {
    const res = await fetch(`/api/projects/${projectId}/ai/consult`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, contextFileId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'AI consultation failed');
    }
    return res.json();
  },

  async getDeployChecks(projectId: string): Promise<{ readyForDeploy: boolean; score: number; checks: DeploymentGateCheck[] }> {
    const res = await fetch(`/api/projects/${projectId}/deploy-check`);
    if (!res.ok) throw new Error('Failed to retrieve deployment checks');
    return res.json();
  },

  getExportUrl(projectId: string): string {
    return `/api/projects/${projectId}/export`;
  },

  // ==========================================
  // FEATURE FLAGS
  // ==========================================
  async getFeatureFlags(): Promise<FeatureFlag[]> {
    const res = await fetch('/api/feature-flags');
    if (!res.ok) throw new Error('Failed to fetch feature flags');
    const data = await res.json();
    return data.flags || [];
  },

  async toggleFeatureFlag(key: string): Promise<FeatureFlag> {
    const res = await fetch(`/api/feature-flags/${key}/toggle`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Failed to toggle feature flag');
    const data = await res.json();
    return data.flag;
  },

  async updateFeatureFlag(key: string, updates: Partial<FeatureFlag>): Promise<FeatureFlag> {
    const res = await fetch(`/api/feature-flags/${key}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update feature flag');
    const data = await res.json();
    return data.flag;
  },

  async createFeatureFlag(flag: Partial<FeatureFlag>): Promise<FeatureFlag> {
    const res = await fetch('/api/feature-flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(flag),
    });
    if (!res.ok) throw new Error('Failed to create feature flag');
    const data = await res.json();
    return data.flag;
  },

  async deleteFeatureFlag(key: string): Promise<boolean> {
    const res = await fetch(`/api/feature-flags/${key}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete feature flag');
    const data = await res.json();
    return data.success;
  },

  async resetFeatureFlags(): Promise<FeatureFlag[]> {
    const res = await fetch('/api/feature-flags/reset', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset feature flags');
    const data = await res.json();
    return data.flags;
  },

  // ==========================================
  // AUTOMATED ROLLBACK & SNAPSHOTS
  // ==========================================
  async getSnapshots(projectId: string): Promise<ProjectSnapshot[]> {
    const res = await fetch(`/api/projects/${projectId}/snapshots`);
    if (!res.ok) throw new Error('Failed to fetch snapshots');
    const data = await res.json();
    return data.snapshots || [];
  },

  async createSnapshot(projectId: string, label: string, agentId?: string): Promise<ProjectSnapshot> {
    const res = await fetch(`/api/projects/${projectId}/snapshots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label, agentId }),
    });
    if (!res.ok) throw new Error('Failed to create snapshot');
    const data = await res.json();
    return data.snapshot;
  },

  async getRollbackLogs(projectId: string): Promise<RollbackLog[]> {
    const res = await fetch(`/api/projects/${projectId}/rollback-logs`);
    if (!res.ok) throw new Error('Failed to fetch rollback logs');
    const data = await res.json();
    return data.logs || [];
  },

  async getRollbackConfig(): Promise<RollbackConfig> {
    const res = await fetch('/api/rollback/config');
    if (!res.ok) throw new Error('Failed to fetch rollback configuration');
    const data = await res.json();
    return data.config;
  },

  async updateRollbackConfig(config: Partial<RollbackConfig>): Promise<RollbackConfig> {
    const res = await fetch('/api/rollback/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error('Failed to update rollback configuration');
    const data = await res.json();
    return data.config;
  },

  async revertToSnapshot(
    projectId: string,
    snapshotId: string,
    reason?: string
  ): Promise<{ success: boolean; message: string; log: RollbackLog; project: Project }> {
    const res = await fetch(`/api/projects/${projectId}/rollback/revert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ snapshotId, reason }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to revert to snapshot');
    }
    return res.json();
  },

  async simulateMergeWithRollbackGuard(
    projectId: string,
    payload: {
      agentId?: string;
      simulateFailure: boolean;
      failureType?: 'unit' | 'integration' | 'e2e';
      proposedFiles?: any[];
    }
  ): Promise<{ success: boolean; outcome: any; project: Project }> {
    const res = await fetch(`/api/projects/${projectId}/rollback/simulate-merge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to simulate merge');
    }
    return res.json();
  },

  // ==========================================
  // STANDARDIZED AGENT PROTOCOL & CONFLICTS
  // ==========================================
  async getProtocolMessages(filter?: {
    senderId?: string;
    recipientId?: string;
    type?: string;
    status?: string;
  }): Promise<SwarmProtocolMessage[]> {
    const params = new URLSearchParams();
    if (filter?.senderId) params.set('senderId', filter.senderId);
    if (filter?.recipientId) params.set('recipientId', filter.recipientId);
    if (filter?.type) params.set('type', filter.type);
    if (filter?.status) params.set('status', filter.status);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`/api/swarm/protocol/messages${qs}`);
    if (!res.ok) throw new Error('Failed to fetch protocol messages');
    const data = await res.json();
    return data.messages || [];
  },

  async sendProtocolMessage(
    message: Partial<SwarmProtocolMessage>
  ): Promise<SwarmProtocolMessage> {
    const res = await fetch('/api/swarm/protocol/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to dispatch protocol message');
    }
    const data = await res.json();
    return data.message;
  },

  async resolveProtocolConflict(payload: {
    conflictId: string;
    resolvedBy: AgentId;
    strategy: 'PRIORITY_OVERRIDE' | 'ARBITRATED_MERGE' | 'SAFETY_FIRST_ROLLBACK' | 'SEMANTIC_CONSENSUS';
    decision: string;
    appliedChanges?: string;
  }): Promise<SwarmProtocolMessage> {
    const res = await fetch('/api/swarm/protocol/resolve-conflict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to resolve protocol conflict');
    }
    const data = await res.json();
    return data.resolutionMessage;
  },

  async simulateProtocolCycle(projectId?: string): Promise<any> {
    const res = await fetch('/api/swarm/protocol/simulate-cycle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId }),
    });
    if (!res.ok) throw new Error('Failed to simulate protocol cycle');
    return res.json();
  },

  async getProtocolSpec(): Promise<any> {
    const res = await fetch('/api/swarm/protocol/spec');
    if (!res.ok) throw new Error('Failed to fetch protocol spec');
    const data = await res.json();
    return data.specification;
  },

  // ==========================================
  // STRUCTURED LOGGING
  // ==========================================
  async getLogs(filter?: {
    search?: string;
    level?: LogLevel | 'all';
    category?: LogCategory | 'all';
    source?: LogSource | 'all';
    limit?: number;
    since?: string;
  }): Promise<{ logs: StructuredLog[]; total: number; filteredCount: number }> {
    const params = new URLSearchParams();
    if (filter?.search) params.set('search', filter.search);
    if (filter?.level && filter.level !== 'all') params.set('level', filter.level);
    if (filter?.category && filter.category !== 'all') params.set('category', filter.category);
    if (filter?.source && filter.source !== 'all') params.set('source', filter.source);
    if (filter?.limit) params.set('limit', String(filter.limit));
    if (filter?.since) params.set('since', filter.since);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`/api/logs${qs}`);
    if (!res.ok) throw new Error('Failed to fetch structured logs');
    return res.json();
  },

  async sendLog(entry: Partial<StructuredLog>): Promise<StructuredLog> {
    const res = await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error('Failed to send structured log');
    const data = await res.json();
    return data.log;
  },

  async clearLogs(): Promise<void> {
    const res = await fetch('/api/logs', { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to clear logs');
  },

  getExportLogsUrl(format: 'json' | 'csv' = 'json'): string {
    return `/api/logs/export?format=${format}`;
  },

  // ==========================================
  // MONITORING, HEALTH & ALERTS
  // ==========================================
  async getDetailedHealth(): Promise<ApplicationHealthReport> {
    const res = await fetch('/api/system/health-report');
    if (!res.ok) throw new Error('Failed to fetch detailed health report');
    const data = await res.json();
    return data.report;
  },

  async getDetailedMetrics(): Promise<DetailedMonitoringMetrics> {
    const res = await fetch('/api/monitoring/metrics');
    if (!res.ok) throw new Error('Failed to fetch detailed monitoring metrics');
    const data = await res.json();
    return data.metrics;
  },

  async getAlerts(): Promise<{ rules: AlertRule[]; activeAlerts: AlertInstance[] }> {
    const res = await fetch('/api/monitoring/alerts');
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  },

  async acknowledgeAlert(alertId: string): Promise<AlertInstance> {
    const res = await fetch(`/api/monitoring/alerts/${alertId}/ack`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to acknowledge alert');
    const data = await res.json();
    return data.alert;
  },

  async resolveAlert(alertId: string): Promise<AlertInstance> {
    const res = await fetch(`/api/monitoring/alerts/${alertId}/resolve`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to resolve alert');
    const data = await res.json();
    return data.alert;
  },

  async simulateAlert(scenario: 'latency_spike' | 'error_burst' | 'memory_surge' | 'subsystem_down'): Promise<AlertInstance> {
    const res = await fetch('/api/monitoring/alerts/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario }),
    });
    if (!res.ok) throw new Error('Failed to simulate alert scenario');
    const data = await res.json();
    return data.alert;
  },

  // ==========================================
  // GLOBAL ERROR HANDLING & TESTING
  // ==========================================
  async getGlobalErrors(): Promise<GlobalErrorEvent[]> {
    const res = await fetch('/api/system/errors');
    if (!res.ok) throw new Error('Failed to fetch recorded global errors');
    const data = await res.json();
    return data.errors || [];
  },

  async resolveGlobalError(errorId: string): Promise<void> {
    const res = await fetch(`/api/system/errors/${errorId}/resolve`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to resolve error event');
  },

  async clearResolvedErrors(): Promise<void> {
    const res = await fetch('/api/system/errors/clear-resolved', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to clear resolved errors');
  },

  async simulateError(scenario: 'backend_500' | 'operational_fallback' | 'validation_422' | 'unhandled_rejection'): Promise<any> {
    const res = await fetch('/api/system/simulate-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Simulated error occurred');
    }
    return data;
  },
};

