export type AgentId =
  | 'AGENT_1_ANALYST'
  | 'AGENT_2_FRONTEND'
  | 'AGENT_3_BACKEND'
  | 'AGENT_4_DATABASE'
  | 'AGENT_5_API'
  | 'AGENT_6_AUTH'
  | 'AGENT_7_SECURITY'
  | 'AGENT_8_PERFORMANCE'
  | 'AGENT_9_UX'
  | 'AGENT_10_A11Y'
  | 'AGENT_11_TEST'
  | 'AGENT_12_E2E'
  | 'AGENT_13_DEVOPS'
  | 'AGENT_14_DEPENDENCY'
  | 'AGENT_15_DOCS'
  | 'AGENT_16_PRODUCT'
  | 'AGENT_17_INTEGRITY'
  | 'AGENT_18_RECOVERY'
  | 'AGENT_19_AI'
  | 'AGENT_20_QA';

export type AgentStatus = 'idle' | 'analyzing' | 'executing' | 'completed' | 'warning' | 'error';

export interface AgentDefinition {
  id: AgentId;
  index: number;
  name: string;
  badge: string;
  role: string;
  focusArea: string;
  category: 'core' | 'quality' | 'infrastructure' | 'product';
  mandate: string[];
}

export interface AgentLogEntry {
  timestamp: string;
  agentId: AgentId;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export interface AgentResult {
  agentId: AgentId;
  agentName: string;
  status: 'passed' | 'warning' | 'fixed' | 'error';
  durationMs: number;
  summary: string;
  findings: string[];
  repairsApplied: string[];
}

export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'draft' | 'diagnosing' | 'building' | 'tested' | 'production-ready';
  healthScore: number;
  files: ProjectFile[];
  createdAt: string;
  updatedAt: string;
  stats: {
    linesOfCode: number;
    filesCount: number;
    testsPassed: number;
    securityGrade: string;
  };
}

export interface SwarmExecutionState {
  id: string;
  projectId: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  currentPhase: 'SCAN' | 'DIAGNOSE' | 'PARALLEL_AGENTS' | 'INTEGRATE' | 'TEST' | 'QA_FINAL';
  progress: number;
  startTime?: string;
  endTime?: string;
  activeAgents: AgentId[];
  completedAgents: AgentId[];
  results: Record<AgentId, AgentResult>;
  logs: AgentLogEntry[];
}

export interface TestItem {
  id: string;
  name: string;
  suite: 'unit' | 'integration' | 'api' | 'e2e';
  status: 'passed' | 'failed' | 'running' | 'pending';
  durationMs: number;
  assertion: string;
  details?: string;
}

export interface TestSuiteSummary {
  runId: string;
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
  timestamp: string;
  tests: TestItem[];
}

export interface SecurityVulnerability {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  rule: string;
  file: string;
  line?: number;
  description: string;
  resolution: string;
  status: 'detected' | 'mitigated';
}

export interface SecurityReport {
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'F';
  scannedFiles: number;
  vulnerabilities: SecurityVulnerability[];
  checkedRules: {
    secretsProtection: boolean;
    xssGuards: boolean;
    injectionPreventions: boolean;
    safeHeaders: boolean;
    dependencySafety: boolean;
    corsEnforcement: boolean;
  };
}

export interface DeploymentGateCheck {
  id: string;
  label: string;
  agentRef: string;
  category: 'build' | 'security' | 'testing' | 'persistence' | 'api';
  status: 'pass' | 'fail' | 'warning';
  notes: string;
}

export interface SystemStatus {
  status: 'online' | 'degraded' | 'offline';
  uptimeSeconds: number;
  nodeVersion: string;
  environment: string;
  memoryUsageMb: number;
  aiEngineAvailable: boolean;
  aiModel: string;
  totalProjects?: number;
  activeAgentsPool?: number;
  timestamp: string;
}

export interface PerformanceHistoryPoint {
  timestamp: string;
  cpuPercent: number;
  memoryRssMb: number;
  heapUsedMb: number;
  activeAgents: number;
}

export interface CpuMetrics {
  percent: number;
  userMicros: number;
  systemMicros: number;
  cores: number;
  model: string;
  speedMhz: number;
  loadAverage: [number, number, number];
}

export interface MemoryMetrics {
  rssMb: number;
  heapTotalMb: number;
  heapUsedMb: number;
  heapUsedPercent: number;
  externalMb: number;
  arrayBuffersMb: number;
  systemTotalMb: number;
  systemFreeMb: number;
  systemUsedPercent: number;
}

export interface SwarmTelemetryStats {
  isSwarmActive: boolean;
  activeWorkers: number;
  totalCycles: number;
  totalTasksCompleted: number;
  avgCycleDurationMs: number;
  peakMemoryMb: number;
  totalAssertionsVerified: number;
}

export interface SessionEvent {
  id: string;
  timestamp: string;
  type: 'session_start' | 'swarm_start' | 'swarm_end' | 'gc_flush' | 'test_run' | 'peak_reset';
  label: string;
  details?: string;
}

export interface SessionPerformanceSummary {
  sessionStartTime: string;
  sessionUptimeSeconds: number;
  totalSamples: number;
  peakCpuPercent: number;
  minCpuPercent: number;
  avgCpuPercent: number;
  peakHeapUsedMb: number;
  avgHeapUsedMb: number;
  initialHeapUsedMb: number;
  totalGcEvents: number;
  totalSwarmRuns: number;
}

export interface SystemPerformanceMetrics {
  timestamp: string;
  cpu: CpuMetrics;
  memory: MemoryMetrics;
  swarmStats: SwarmTelemetryStats;
  process: {
    pid: number;
    uptimeSeconds: number;
    nodeVersion: string;
    platform: string;
    arch: string;
  };
  history: PerformanceHistoryPoint[];
  sessionHistory: PerformanceHistoryPoint[];
  sessionSummary: SessionPerformanceSummary;
  sessionEvents: SessionEvent[];
}

export interface CategoryHealth {
  category: 'core' | 'quality' | 'infrastructure' | 'product';
  label: string;
  score: number;
  agentCount: number;
  passedCount: number;
  warningCount: number;
  errorCount: number;
  fixedCount: number;
}

export interface SwarmHealthScore {
  overallScore: number;
  statusGrade: 'optimal' | 'stable' | 'degraded' | 'critical';
  statusLabel: string;
  timestamp: string;
  categories: Record<'core' | 'quality' | 'infrastructure' | 'product', CategoryHealth>;
  agentScores: Record<string, {
    agentId: string;
    agentName: string;
    category: string;
    score: number;
    status: string;
    findingsCount: number;
    repairsCount: number;
  }>;
  summary: {
    totalAgents: number;
    passed: number;
    fixed: number;
    warnings: number;
    errors: number;
    totalFindings: number;
    totalRepairs: number;
  };
}
