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

export type AgentTaskPriority = 'p0' | 'p1' | 'p2' | 'p3';

export interface AgentTask {
  id: string;
  agentId: AgentId;
  title: string;
  priority: AgentTaskPriority;
  status: 'pending' | 'executing' | 'completed';
  order: number;
}

export interface CodeIssue {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  line?: number;
  rule: string;
  description: string;
  suggestedFix: string;
}

export interface CodeDiagnosis {
  fileId: string;
  filePath: string;
  fileName: string;
  language: string;
  cyclomaticComplexity: number;
  maintainabilityIndex: number;
  linesOfCode: number;
  understanding: {
    purpose: string;
    architectureRole: string;
    dependencies: string[];
    coreFunctions: string[];
    securityAssessment: string;
    dataContracts: string[];
  };
  issues: CodeIssue[];
  fixedContent: string;
  diffChangesCount: number;
  fixedExplanation: string;
  timestamp: string;
}

export interface FileImportResult {
  name: string;
  path: string;
  content: string;
  language: string;
  originalType: string;
  sizeBytes: number;
  summary: string;
}

export type ExportFormat = 'zip' | 'docx' | 'xlsx' | 'csv' | 'pdf' | 'json';

// Feature Flag System
export type FeatureFlagCategory = 'reliability' | 'swarm' | 'editor' | 'security' | 'experimental';

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  category: FeatureFlagCategory;
  enabled: boolean;
  rolloutPercentage: number;
  environment: 'all' | 'development' | 'staging' | 'production';
  updatedAt: string;
  updatedBy: string;
}


// Automated Rollback & Snapshot System
export interface ProjectSnapshot {
  id: string;
  projectId: string;
  timestamp: string;
  label: string;
  trigger: 'agent_pre_merge' | 'agent_post_merge' | 'manual' | 'pre_rollback';
  agentId?: AgentId | string;
  files: ProjectFile[];
  filesCount: number;
  linesOfCode: number;
}

export interface RollbackLog {
  id: string;
  projectId: string;
  timestamp: string;
  triggerAgentId: AgentId | string;
  targetSnapshotId: string;
  reason: string;
  failedTests: Array<{
    id: string;
    name: string;
    suite: 'unit' | 'integration' | 'api' | 'e2e';
    assertion: string;
    details?: string;
  }>;
  revertedFiles: string[];
  automated: boolean;
  status: 'completed' | 'failed';
}

export interface RollbackConfig {
  autoRollbackEnabled: boolean;
  rollbackOnUnitFailure: boolean;
  rollbackOnIntegrationFailure: boolean;
  rollbackOnE2EFailure: boolean;
  notifyOnRollback: boolean;
}

// Standardized Swarm Communication Protocol
export type SwarmMessageType =
  | 'REPORT_FINDINGS'
  | 'REQUEST_ACTION'
  | 'SHARE_INTERMEDIATE_RESULT'
  | 'CONFLICT_DETECTED'
  | 'CONFLICT_RESOLVED'
  | 'ACK'
  | 'REJECT';

export type MessagePriority = 'P0_CRITICAL' | 'P1_HIGH' | 'P2_NORMAL' | 'P3_LOW';

export interface SwarmFindingItem {
  id: string;
  rule: string;
  severity: 'critical' | 'high' | 'medium' | 'info';
  description: string;
  targetFile?: string;
  suggestedFix?: string;
}

export interface SwarmActionRequest {
  actionType: string;
  targetFile?: string;
  parameters: Record<string, any>;
  expectedOutcome?: string;
  deadlineMs?: number;
}

export interface SwarmIntermediateResult {
  artifactType: 'ast' | 'token_tree' | 'dependency_map' | 'test_matrix' | 'schema_def' | 'security_audit';
  summary: string;
  data: any;
}

export interface SwarmConflict {
  conflictId: string;
  conflictingAgentIds: AgentId[];
  targetResource: string;
  subject: string;
  agentAProposal: { agentId: AgentId; change: string; rationale: string };
  agentBProposal: { agentId: AgentId; change: string; rationale: string };
  status: 'detected' | 'analyzing' | 'resolved';
}

export interface SwarmResolution {
  resolvedBy: AgentId;
  strategy: 'PRIORITY_OVERRIDE' | 'ARBITRATED_MERGE' | 'SAFETY_FIRST_ROLLBACK' | 'SEMANTIC_CONSENSUS';
  decision: string;
  appliedChanges: string;
  resolvedAt: string;
}

export interface SwarmProtocolMessage {
  id: string;
  protocolVersion: '2.1-swarm';
  timestamp: string;
  senderId: AgentId;
  recipientId: AgentId | 'BROADCAST';
  type: SwarmMessageType;
  priority: MessagePriority;
  correlationId?: string;
  title: string;
  content: string;
  findings?: SwarmFindingItem[];
  actionRequest?: SwarmActionRequest;
  intermediateResult?: SwarmIntermediateResult;
  conflict?: SwarmConflict;
  resolution?: SwarmResolution;
  status: 'sent' | 'received' | 'processing' | 'resolved' | 'rejected' | 'delivered' | 'acknowledged';
}


// ==========================================
// STRUCTURED LOGGING & MONITORING
// ==========================================
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type LogCategory =
  | 'api_request'
  | 'user_action'
  | 'agent_event'
  | 'system_health'
  | 'security'
  | 'error'
  | 'rollback'
  | 'flag_toggle'
  | 'performance';

export type LogSource = 'frontend' | 'backend' | 'agent_swarm';

export interface StructuredLog {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  source: LogSource;
  action: string;
  message: string;
  method?: string;
  path?: string;
  statusCode?: number;
  responseTimeMs?: number;
  userId?: string;
  agentId?: AgentId | string;
  traceId?: string;
  errorDetails?: {
    name?: string;
    message: string;
    stack?: string;
    code?: string;
    componentStack?: string;
  };
  metadata?: Record<string, any>;
}

// Health & Subsystem Monitoring
export type SubsystemStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface SubsystemHealth {
  name: string;
  status: SubsystemStatus;
  latencyMs: number;
  message: string;
  lastChecked: string;
  details?: Record<string, any>;
}

export interface ApplicationHealthReport {
  status: SubsystemStatus;
  uptimeSeconds: number;
  timestamp: string;
  version: string;
  environment: string;
  system: {
    memoryRssMb: number;
    heapUsedMb: number;
    heapTotalMb: number;
    cpuPercent: number;
    eventLoopDelayMs: number;
    osLoadAvg: number[];
    freeMemMb: number;
    totalMemMb: number;
  };
  subsystems: Record<string, SubsystemHealth>;
  metricsSummary: {
    requestsTotal: number;
    requestsPerSecond: number;
    avgResponseTimeMs: number;
    p95ResponseTimeMs: number;
    errorRatePercent: number;
  };
}

// Performance & Observability
export interface LatencyBucket {
  range: string;
  count: number;
}

export interface EndpointMetric {
  path: string;
  method: string;
  callCount: number;
  avgDurationMs: number;
  p95DurationMs: number;
  errorCount: number;
  lastStatusCode: number;
}

export interface DetailedMonitoringMetrics {
  timestamp: string;
  uptimeSeconds: number;
  throughputRps: number;
  totalRequests: number;
  totalErrors: number;
  errorRatePercent: number;
  latency: {
    avgMs: number;
    p50Ms: number;
    p90Ms: number;
    p95Ms: number;
    p99Ms: number;
    minMs: number;
    maxMs: number;
  };
  latencyBuckets: LatencyBucket[];
  slowestEndpoints: EndpointMetric[];
  statusCodes: Record<string, number>;
  memoryHistory: Array<{ timestamp: string; heapUsedMb: number; rssMb: number }>;
}

// Alerting System
export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface AlertRule {
  id: string;
  name: string;
  metric: 'error_rate' | 'response_time_p95' | 'memory_usage' | 'critical_health' | 'subsystem_down';
  condition: 'gt' | 'lt' | 'eq';
  threshold: number;
  unit: string;
  severity: AlertSeverity;
  enabled: boolean;
  description: string;
}

export interface AlertInstance {
  id: string;
  ruleId: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  metricValue: number;
  threshold: number;
  unit: string;
  triggeredAt: string;
  status: 'active' | 'acknowledged' | 'resolved';
  resolvedAt?: string;
  acknowledgedAt?: string;
}

// Global Error Handling
export interface GlobalErrorEvent {
  id: string;
  traceId: string;
  timestamp: string;
  source: 'frontend' | 'backend';
  type: 'render_error' | 'unhandled_rejection' | 'api_error' | 'uncaught_exception' | 'operational_error';
  message: string;
  name?: string;
  stack?: string;
  endpoint?: string;
  statusCode?: number;
  componentStack?: string;
  userFriendlyMessage: string;
  suggestedRemedy: string;
  fallbackActivated: boolean;
  fallbackDescription?: string;
  resolved: boolean;
  resolvedAt?: string;
}


